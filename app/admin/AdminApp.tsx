'use client';
// Ref 관리자 글쓰기 화면
// 글 작성, SEO 점검, 이미지 변환, GitHub 저장소에 커밋까지 처리한다.
// 게시하면 content/posts/슬러그.json 과 이미지(public/assets/img/posts/)만 커밋하고,
// 목록·카테고리·사이트맵·RSS는 저장소에 연결된 Vercel 빌드가 자동으로 만든다.
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import type { CatSlug, FaqItem, PostSource } from '@/lib/types';
import { CATS, CAT_GROUPS, CAT_ORDER, RULE, SITE, abs, postPath, today } from '@/lib/site';
import { readMinutes, renderBody } from '@/lib/markdown';
import { SLUG_RE, runChecks } from '@/lib/seo';
import Article from '@/components/Article';
import { GitHub, type CommitFile, type GhError } from './github';
import { draftKeys, getDraft, putDraft } from './drafts';

interface AdminImage {
  no: number;
  blob: Blob | null;
  type: string;
  url: string;
  path: string | null;
  alt: string;
  caption: string;
  width: number;
  height: number;
  uploaded?: boolean;
}

interface Draft {
  category: CatSlug;
  keyword: string;
  seoTitle: string;
  h1: string;
  slug: string;
  desc: string;
  summary: string;
  body: string;
  faqs: FaqItem[];
  indexable: boolean;
  pubDate: string;
  modDate: string;
  images: AdminImage[];
  nextImg: number;
  published: boolean;
  savedAt?: string;
}

type TextField = 'keyword' | 'seoTitle' | 'h1' | 'slug' | 'desc' | 'summary' | 'body';
interface LogLine { text: string; cls?: 'err' | 'done'; href?: string }

function newDraft(): Draft {
  return {
    category: 'seo-content', keyword: '', seoTitle: '', h1: '', slug: '', desc: '', summary: '', body: '',
    faqs: [], indexable: true, pubDate: '', modDate: '', images: [], nextImg: 1, published: false,
  };
}

/** IndexedDB에 넣을 형태 (미리보기 주소는 빼고 Blob은 그대로) */
function draftData(s: Draft) {
  return {
    ...s,
    faqs: s.faqs.map((f) => ({ ...f })),
    images: s.images.map(({ url: _url, ...im }) => im),
    savedAt: new Date().toLocaleString('ko-KR'),
  };
}

function processImage(file: File): Promise<{ blob: Blob; type: string; width: number; height: number }> {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1600;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > max) { h = Math.round((h * max) / w); w = max; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      c.toBlob((b) => {
        if (!b) return rej(new Error('변환 실패: ' + file.name));
        res({ blob: b, type: b.type, width: w, height: h });
      }, 'image/webp', 0.82);
    };
    img.onerror = () => rej(new Error('이미지를 읽을 수 없습니다: ' + file.name));
    img.src = url;
  });
}

const SYNTAX: [string, string][] = [
  ['## 소제목', '소제목(H2). 목차에 자동으로 들어감'],
  ['### 작은 소제목', 'H3'],
  ['- 내용 / 1. 내용', '목록 / 번호 목록'],
  ['> 내용', '인용'],
  ['| 항목 | 내용 |', '표. 첫 줄이 머리글'],
  ['[글자](주소)', '링크. 내 글은 파일명.html 만 쓰면 됨'],
  ['**글자**', '굵게'],
  ['[[이미지3]]', '아래 이미지 목록의 3번 이미지. 한 줄에 단독으로'],
];

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [remember, setRemember] = useState(false);
  const [loginMsg, setLoginMsg] = useState('');
  const [s, setS] = useState<Draft>(newDraft);
  const [drafts, setDrafts] = useState<string[]>([]);
  const [published, setPublished] = useState<string[] | null>([]);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const gh = useRef<GitHub | null>(null);
  const tokenRef = useRef('');
  const sRef = useRef(s);
  sRef.current = s;
  const loggedInRef = useRef(false);
  loggedInRef.current = loggedIn;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const editSlug = useRef<string | null>(null);

  // ---------- 상태 변경 + 자동저장 ----------
  function scheduleAutosave() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { putDraft('자동저장', draftData(sRef.current)).catch(() => {}); }, 1500);
  }
  function update(patch: Partial<Draft> | ((prev: Draft) => Partial<Draft>)) {
    setS((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
    scheduleAutosave();
  }
  const log = (text: string, cls?: LogLine['cls'], href?: string) => setLogs((l) => [...l, { text, cls, href }]);

  // ---------- 본문 변환과 SEO 점검 ----------
  const render = useMemo(
    () => renderBody(s.body, s.images.map((im) => ({ no: im.no, src: im.url, alt: im.alt, caption: im.caption, width: im.width, height: im.height }))),
    [s.body, s.images],
  );
  const check = useMemo(() => runChecks(s, render), [s, render]);
  const pass = check.list.filter((x) => x.ok).length;

  // ---------- 불러오기 ----------
  function applyLoaded(data: Partial<Draft> & { images?: Partial<AdminImage>[] }) {
    const images = (data.images || []).map((im) => ({
      no: im.no!, blob: im.blob || null, type: im.type || '', path: im.path || null, alt: im.alt || '', caption: im.caption || '',
      width: im.width || 0, height: im.height || 0,
      url: im.blob ? URL.createObjectURL(im.blob) : gh.current!.rawUrl('public/' + im.path),
      uploaded: im.uploaded || (!im.blob && !!im.path),
    }));
    setS({ ...newDraft(), ...data, modDate: data.modDate || '', images } as Draft);
  }
  /** content/posts/슬러그.json 을 불러온다. 관리자 화면 밖에서 만든 글(bodyFile)은 거절한다 */
  async function loadPublished(slug: string) {
    const txt = await gh.current!.getFile('content/posts/' + slug + '.json');
    if (!txt) throw new Error('content/posts/' + slug + '.json 을 찾지 못했습니다.');
    const src = JSON.parse(txt) as PostSource;
    if (src.bodyFile || typeof src.body !== 'string') {
      alert('"' + slug + '" 글은 관리자 화면 밖에서 만든 글이라 여기서 불러올 수 없습니다. Claude Code로 수정하세요.');
      return;
    }
    applyLoaded({ ...src, published: true, modDate: src.modDate || '' } as unknown as Partial<Draft>);
  }
  async function refreshDrafts() { setDrafts(await draftKeys().catch(() => [])); }
  async function refreshPublished() {
    try {
      const list = await gh.current!.listDir('content/posts');
      setPublished(list.filter((f) => /\.json$/.test(f.name)).map((f) => f.name.replace(/\.json$/, '')));
    } catch { setPublished(null); }
  }

  // 글 페이지에서 수정 버튼을 보여 줄지 정하는 표시. 토큰이 아니라 표시값만 저장한다
  function setAdminFlag(on: boolean) {
    try { if (on) localStorage.setItem('ref_admin', '1'); else localStorage.removeItem('ref_admin'); } catch { /* 무시 */ }
  }

  // ---------- 로그인 ----------
  async function connect(input?: string) {
    const typed = (input || '').trim();
    const token = typed || tokenRef.current;
    if (!token) { setLoginMsg('토큰을 입력하세요.'); return; }
    setLoginMsg('확인 중...');
    const client = new GitHub(token);
    try {
      const repo = await client.repoInfo();
      if (repo.permissions && !repo.permissions.push) throw new Error('이 토큰은 저장소에 쓰기 권한이 없습니다.');
      gh.current = client;
      tokenRef.current = token;
      if (typed) {
        sessionStorage.setItem('ref_token', token);
        if (remember) localStorage.setItem('ref_token', token);
      }
      setTokenInput('');
      setLoggedIn(true);
      setLoginMsg('');
      setAdminFlag(true);
      const auto = await getDraft<Draft>('자동저장').catch(() => undefined);
      const hasAuto = !!auto && !!(auto.body || auto.seoTitle);
      const slug = editSlug.current;
      if (slug) {
        history.replaceState(null, '', location.pathname);
        editSlug.current = null;
        if (hasAuto && !confirm('자동저장된 작성 중인 글이 있습니다 (' + (auto!.savedAt || '') + ').\n이 내용을 버리고 "' + slug + '" 글을 불러올까요?\n(취소하면 자동저장된 글을 엽니다)')) applyLoaded(auto!);
        else await loadPublished(slug).catch((e: Error) => alert('불러오기 실패: ' + e.message));
      } else if (hasAuto && confirm('자동저장된 글이 있습니다 (' + (auto!.savedAt || '') + '). 불러올까요?')) {
        applyLoaded(auto!);
      }
      refreshDrafts();
      refreshPublished();
    } catch (e) {
      const err = e as GhError;
      setLoginMsg(err.status === 401 ? '토큰이 올바르지 않거나 만료됐습니다.' : err.status === 404 ? '저장소 ' + SITE.repo + '를 찾지 못했습니다. 토큰의 저장소 접근 범위를 확인하세요.' : err.message);
      if (!typed) tokenRef.current = '';
      if (err.status === 401) setAdminFlag(false);
    }
  }

  function logout() {
    sessionStorage.removeItem('ref_token');
    localStorage.removeItem('ref_token');
    setAdminFlag(false);
    location.reload();
  }

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; // 개발 모드(Strict Mode)에서 두 번 실행되지 않게
    started.current = true;
    const q = new URLSearchParams(location.search).get('edit');
    editSlug.current = q && /^[a-z0-9-]+$/.test(q) ? q : null;
    const saved = sessionStorage.getItem('ref_token') || localStorage.getItem('ref_token') || '';
    if (saved) { tokenRef.current = saved; connect(); }
    const onUnload = () => { if (loggedInRef.current) putDraft('자동저장', draftData(sRef.current)).catch(() => {}); };
    window.addEventListener('beforeunload', onUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- 본문 편집 도구 ----------
  function insertAtCursor(text: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const st = ta.selectionStart, en = ta.selectionEnd;
    const value = ta.value.slice(0, st) + text + ta.value.slice(en);
    update({ body: value });
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = st + text.length; });
  }
  function wrapSelection(before: string, after: string, fallback: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd) || fallback;
    insertAtCursor(before + sel + after);
  }
  const SNIPPETS: [string, string, () => void][] = [
    ['h2', '소제목', () => insertAtCursor('\n## 소제목\n\n')],
    ['h3', '작은 소제목', () => insertAtCursor('\n### 작은 소제목\n\n')],
    ['ul', '목록', () => insertAtCursor('\n- 항목\n- 항목\n\n')],
    ['ol', '번호 목록', () => insertAtCursor('\n1. 항목\n2. 항목\n\n')],
    ['quote', '인용', () => insertAtCursor('\n> 인용문\n\n')],
    ['table', '표', () => insertAtCursor('\n| 항목 | 내용 |\n| --- | --- |\n| 값 | 값 |\n\n')],
    ['link', '링크', () => wrapSelection('[', '](글주소.html)', '링크 글자')],
    ['bold', '굵게', () => wrapSelection('**', '**', '굵게')],
  ];

  function onText(field: TextField) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let v = e.target.value;
      if (field === 'slug') v = v.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      update({ [field]: v } as Partial<Draft>);
    };
  }

  // ---------- 이미지 ----------
  async function addFiles(files: File[]) {
    const added: AdminImage[] = [];
    let next = sRef.current.nextImg;
    for (const f of files) {
      if (!/^image\//.test(f.type)) continue;
      try {
        const p = await processImage(f);
        added.push({ no: next++, blob: p.blob, type: p.type, url: URL.createObjectURL(p.blob), path: null, alt: '', caption: '', width: p.width, height: p.height });
      } catch (e) { alert((e as Error).message); }
    }
    if (added.length) update((prev) => ({ images: [...prev.images, ...added], nextImg: Math.max(prev.nextImg, next) }));
  }
  function patchImage(no: number, patch: Partial<AdminImage>) {
    update((prev) => ({ images: prev.images.map((im) => (im.no === no ? { ...im, ...patch } : im)) }));
  }
  function removeImage(no: number) {
    if (!confirm('이미지' + no + '을(를) 목록에서 지울까요? 본문의 [[이미지' + no + ']] 표시는 직접 지워야 합니다.')) return;
    update((prev) => ({ images: prev.images.filter((im) => im.no !== no) }));
  }

  // ---------- FAQ ----------
  const patchFaq = (idx: number, patch: Partial<FaqItem>) => update((prev) => ({ faqs: prev.faqs.map((f, i) => (i === idx ? { ...f, ...patch } : f)) }));

  // ---------- 게시 ----------
  async function publish() {
    const cur = sRef.current;
    const errs: string[] = [];
    if (!SLUG_RE.test(cur.slug)) errs.push('주소(슬러그)를 영문 소문자, 숫자, 하이픈으로 입력하세요.');
    if (!cur.seoTitle.trim()) errs.push('SEO 타이틀을 입력하세요.');
    if (!cur.desc.trim()) errs.push('메타 디스크립션을 입력하세요.');
    if (!cur.body.trim()) errs.push('본문을 입력하세요.');
    if (check.noAlt) errs.push('본문에 넣은 이미지 중 대체 텍스트(alt)가 빈 이미지가 ' + check.noAlt + '장 있습니다.');
    if (errs.length) { alert(errs.join('\n')); return; }
    const fails = check.list.filter((x) => !x.ok);
    const msg = (fails.length
      ? 'SEO 기준 미달 ' + fails.length + '개:\n- ' + fails.map((x) => x.label + (x.detail ? ' (' + x.detail + ')' : '')).join('\n- ') + '\n\n'
      : 'SEO 점검을 모두 통과했습니다.\n\n') + (cur.indexable ? '검색 노출' : '작성 중(noindex)') + ' 상태로 게시할까요?';
    if (!confirm(msg)) return;

    setBusy(true);
    setLogs([]);
    try {
      const client = gh.current!;
      log('저장소 파일 읽는 중');
      const jsonPath = 'content/posts/' + cur.slug + '.json';
      const existing = await client.getFile(jsonPath);
      if (existing) {
        if (!cur.published) throw new Error(jsonPath + ' 이 이미 있습니다. 다른 주소를 쓰거나, "게시한 글 수정하기"로 불러오세요.');
        if ((JSON.parse(existing) as PostSource).bodyFile) throw new Error('이 주소는 관리자 화면 밖에서 만든 글입니다. Claude Code로 수정하세요.');
      }
      const isNew = !existing;
      const pubDate = cur.pubDate || today();
      const modDate = today();

      // 본문에 넣은 이미지만 경로를 정하고 올린다
      const upload: { no: number; path: string; blob: Blob }[] = [];
      const images = cur.images.map((im) => {
        if (render.used.indexOf(im.no) === -1) return im;
        let path = im.path;
        if (!path) {
          const ext = /png/.test(im.type) ? 'png' : /jpe?g/.test(im.type) ? 'jpg' : 'webp';
          path = 'assets/img/posts/' + cur.slug + '-' + im.no + '.' + ext;
        }
        if (im.blob && !im.uploaded) upload.push({ no: im.no, path, blob: im.blob });
        return { ...im, path };
      });

      // 화면에 없는 설정(카드 소개문, 검색 키워드, 관련 글 등)은 불러온 값을 그대로 둔다
      const extra: Partial<PostSource> = {};
      const loaded = cur as unknown as Partial<PostSource>;
      for (const k of ['excerpt', 'searchKeywords', 'ldKeywords', 'breadcrumbTitle', 'related'] as const) {
        if (loaded[k] !== undefined) (extra as Record<string, unknown>)[k] = loaded[k];
      }
      const source: PostSource = {
        ...extra,
        slug: cur.slug, category: cur.category, keyword: cur.keyword, seoTitle: cur.seoTitle, h1: cur.h1, desc: cur.desc,
        summary: cur.summary, body: cur.body, faqs: cur.faqs, indexable: cur.indexable, pubDate, modDate,
        images: images.filter((im) => im.path).map((im) => ({ no: im.no, path: im.path!, type: im.type, alt: im.alt, caption: im.caption, width: im.width, height: im.height })),
        nextImg: cur.nextImg, published: true,
      };
      const files: CommitFile[] = upload.map((u) => ({ path: 'public/' + u.path, blob: u.blob }));
      files.push({ path: jsonPath, content: JSON.stringify(source, null, 2) + '\n' });

      log('커밋 만드는 중 (파일 ' + files.length + '개)');
      await client.commitFiles(files, (isNew ? '글 게시: ' : '글 수정: ') + (cur.h1.trim() || cur.seoTitle.trim()), log);

      const done = new Set(upload.map((u) => u.no));
      const next: Draft = { ...cur, pubDate, modDate, published: true, images: images.map((im) => (done.has(im.no) ? { ...im, uploaded: true } : im)) };
      setS(next);
      putDraft('게시됨: ' + cur.slug, draftData(next)).then(refreshDrafts).catch(() => {});
      refreshPublished();
      log('게시 완료. Vercel 빌드가 끝나면(보통 1~2분) 사이트에 반영됩니다.', 'done');
      const loc = abs(postPath(cur.slug));
      log(loc, 'done', loc);
    } catch (e) {
      const err = e as GhError;
      log('실패: ' + err.message, 'err');
      if (err.status === 401 || err.status === 403) log('토큰이 만료됐거나 Contents 쓰기 권한이 없습니다.', 'err');
      if (err.status === 409 || err.status === 422) log('저장소가 비어 있거나 동시에 다른 변경이 있었습니다. 잠시 뒤 다시 시도하세요.', 'err');
    } finally {
      setBusy(false);
    }
  }

  const counter = (text: string, ok: boolean) => <span className={'counter ' + (ok ? 'ok' : 'bad')}>{text}</span>;

  // ---------- 화면 ----------
  return (
    <div className="admin">
      <header className="site-header">
        <div className="wrap admin-wrap">
          <a className="logo" href="/">Ref<span>.</span> <small>글쓰기</small></a>
          {loggedIn && (
            <div className="admin-top">
              <span>{SITE.owner}/{SITE.repo}</span>
              <button type="button" className="abtn" onClick={logout}>로그아웃</button>
            </div>
          )}
        </div>
      </header>

      {!loggedIn ? (
        <main className="admin-wrap">
          <section className="panel login">
            <h1>나만 쓰는 글쓰기 화면</h1>
            <p>GitHub 토큰으로 로그인하면 글을 쓰고 바로 사이트에 게시할 수 있습니다. 토큰은 서버로 보내지지 않고 이 브라우저에만 저장됩니다.</p>
            <label>GitHub 토큰
              <input type="password" autoComplete="off" placeholder="github_pat_로 시작하는 값" value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') connect(tokenInput); }} />
            </label>
            <label className="inline"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> 이 기기에서 로그인 유지 (개인 기기에서만 체크)</label>
            <button type="button" className="abtn primary" onClick={() => connect(tokenInput)}>로그인</button>
            <p className="msg" role="alert">{loginMsg}</p>
            <details>
              <summary>토큰 만드는 법</summary>
              <ol>
                <li>GitHub 오른쪽 위 프로필 &gt; Settings &gt; 맨 아래 Developer settings</li>
                <li>Personal access tokens &gt; Fine-grained tokens &gt; Generate new token</li>
                <li>Expiration: 90일 등 원하는 기간</li>
                <li>Repository access: Only select repositories &gt; {SITE.repo} 하나만 선택</li>
                <li>Permissions &gt; Repository permissions &gt; Contents: Read and write</li>
                <li>Generate token 후 나온 값을 복사해 위에 붙여넣기 (다시 볼 수 없으니 안전한 곳에 보관)</li>
              </ol>
            </details>
          </section>
        </main>
      ) : (
        <main className="admin-wrap">
          <div className="admin-bar">
            <button type="button" className="abtn" onClick={() => {
              if (!confirm('지금 쓰던 내용을 비우고 새 글을 시작할까요? (자동저장 내용도 새 글로 바뀝니다)')) return;
              setS(newDraft()); setLogs([]); scheduleAutosave();
            }}>새 글</button>
            <select aria-label="임시저장 글" value="" onChange={async (e) => {
              const k = e.target.value;
              if (!k || !confirm('"' + k + '"을(를) 불러올까요? 지금 쓰던 내용은 사라집니다.')) return;
              const d = await getDraft<Draft>(k);
              if (d) applyLoaded(d);
            }}>
              <option value="">임시저장 불러오기</option>
              {drafts.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <select aria-label="게시한 글" value="" onChange={(e) => {
              const slug = e.target.value;
              if (!slug || !confirm('"' + slug + '" 글을 불러와 수정할까요? 지금 쓰던 내용은 사라집니다.')) return;
              loadPublished(slug).catch((err: Error) => alert('불러오기 실패: ' + err.message));
            }}>
              <option value="">{published === null ? '게시한 글 없음' : '게시한 글 수정하기'}</option>
              {(published || []).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <span className="mode">{s.published ? '게시한 글 수정 중: ' + s.slug : '새 글 작성 중'}</span>
          </div>

          <div className="admin-grid">
            <section className="panel form">
              <div className="row2">
                <label>분류
                  <select value={s.category} onChange={(e) => update({ category: e.target.value as CatSlug })}>
                    {CAT_GROUPS.map((g) => (
                      <optgroup key={g.key} label={g.label}>
                        {CAT_ORDER.filter((c) => CATS[c].group === g.key).map((c) => <option key={c} value={c}>{CATS[c].label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <label>타깃 키워드
                  <input type="text" value={s.keyword} onChange={onText('keyword')} placeholder="예: ADsP 독학 후기" />
                </label>
              </div>

              <label>SEO 타이틀 {counter(`${check.titleLen}자 / ${RULE.titleMin}~${RULE.titleMax}`, check.list[0].ok)}
                <input type="text" value={s.seoTitle} onChange={onText('seoTitle')} placeholder="검색 결과에 보일 제목, 10~15자, 키워드를 앞에" />
              </label>
              <label>글 제목 (페이지 맨 위 큰 제목)
                <input type="text" value={s.h1} onChange={onText('h1')} placeholder="비우면 SEO 타이틀과 같게 들어갑니다" />
              </label>
              <label>주소(슬러그) <span className="hint">영문 소문자, 숫자, 하이픈만</span>
                <input type="text" value={s.slug} onChange={onText('slug')} readOnly={s.published} placeholder="예: adsp-self-study-review" />
              </label>
              <label>메타 디스크립션 {counter(`${check.descLen}자 / ${RULE.descMin}~${RULE.descMax}`, check.list[1].ok)}
                <textarea rows={3} value={s.desc} onChange={onText('desc')} placeholder="검색 결과 제목 아래 보이는 요약문, 120~200자" />
              </label>
              <label>핵심 요약 <span className="hint">한 줄에 하나씩, 3줄 권장</span>
                <textarea rows={3} value={s.summary} onChange={onText('summary')} />
              </label>

              <div className="body-head">
                <span>본문 {counter(`공백 제외 ${check.bodyLen}자 / ${RULE.bodyMin} 이상`, check.list[2].ok)}</span>
                <div className="toolbar" role="toolbar" aria-label="본문 서식">
                  {SNIPPETS.map(([k, label, fn]) => <button key={k} type="button" className="abtn sm" onClick={fn}>{label}</button>)}
                </div>
              </div>
              <textarea id="body" ref={bodyRef} rows={24} spellCheck={false} value={s.body} onChange={onText('body')}
                placeholder={'## 소제목\n\n문단은 빈 줄로 구분합니다.\n\n[[이미지1]]\n\n- 목록\n- 목록\n\n[링크 글자](seo-content-writing-guide.html)'} />
              <details className="syntax">
                <summary>본문 쓰는 법</summary>
                <table><tbody>{SYNTAX.map(([a, b]) => <tr key={a}><td><code>{a}</code></td><td>{b}</td></tr>)}</tbody></table>
                <p>문단과 문단 사이는 빈 줄 하나로 구분합니다.</p>
              </details>

              <h2 className="sub">이미지 {counter(`본문 ${check.usedCount}장 / ${RULE.imgMin} 이상`, check.list[3].ok)}</h2>
              <label className={'drop' + (dragOver ? ' over' : '')}
                onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }}>
                <input type="file" accept="image/*" multiple onChange={(e) => { const picked = Array.from(e.target.files || []); e.target.value = ''; addFiles(picked); }} />
                <span>여기를 눌러 이미지를 고르거나 끌어다 놓으세요. 가로 1600px 이하 WebP로 자동 변환합니다.</span>
              </label>
              <div className="img-list">
                {s.images.map((im) => {
                  const used = render.used.indexOf(im.no) !== -1;
                  return (
                    <div className="img-item" key={im.no}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={im.url} alt="" />
                      <div>
                        <div className="no">이미지{im.no}<em className={used ? 'used' : 'unused'}>{used ? '본문에 있음' : '본문에 없음'}</em></div>
                        <input type="text" className="alt" placeholder="대체 텍스트(alt): 이미지 내용을 키워드 포함해 한 문장으로 (필수)" value={im.alt} onChange={(e) => patchImage(im.no, { alt: e.target.value })} />
                        <input type="text" className="cap" placeholder="캡션 (선택, 이미지 아래 작은 글씨)" value={im.caption} onChange={(e) => patchImage(im.no, { caption: e.target.value })} />
                        <div className="btns">
                          <button type="button" className="abtn sm" onClick={() => insertAtCursor('\n[[이미지' + im.no + ']]\n')}>본문 커서 위치에 넣기</button>
                          <button type="button" className="abtn sm danger" onClick={() => removeImage(im.no)}>삭제</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h2 className="sub">자주 묻는 질문 <span className="hint">선택. 넣으면 FAQ 구조화 데이터가 자동으로 붙음</span></h2>
              {s.faqs.map((f, idx) => (
                <div className="faq-item" key={idx}>
                  <label>질문<input type="text" value={f.q} onChange={(e) => patchFaq(idx, { q: e.target.value })} /></label>
                  <label>답변<textarea rows={2} value={f.a} onChange={(e) => patchFaq(idx, { a: e.target.value })} /></label>
                  <button type="button" className="abtn sm danger" onClick={() => update((prev) => ({ faqs: prev.faqs.filter((_, i) => i !== idx) }))}>질문 삭제</button>
                </div>
              ))}
              <button type="button" className="abtn sm" onClick={() => update((prev) => ({ faqs: [...prev.faqs, { q: '', a: '' }] }))}>질문 추가</button>

              <h2 className="sub">공개 설정</h2>
              <label className="inline"><input type="radio" name="vis" checked={s.indexable} onChange={() => update({ indexable: true })} /> 검색 노출 (사이트맵, RSS에 포함)</label>
              <label className="inline"><input type="radio" name="vis" checked={!s.indexable} onChange={() => update({ indexable: false })} /> 작성 중 (사이트에는 올라가지만 검색에 안 나옴)</label>
            </section>

            <aside className="side">
              <section className="panel">
                <h2 className="sub">SEO 점검 <span id="score">{pass} / {check.list.length} 통과</span></h2>
                <ul className="checks">
                  {check.list.map((it) => (
                    <li key={it.label} className={it.ok ? 'ok' : 'bad'}>
                      <span className="mark">{it.ok ? 'O' : 'X'}</span>
                      <span>{it.label}{it.detail && <small>{it.detail}</small>}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="panel actions-panel">
                <button type="button" className="abtn" onClick={() => setPreview(true)}>미리보기</button>
                <button type="button" className="abtn" onClick={() => {
                  const key = (s.seoTitle.trim() || '제목없음') + ' (' + new Date().toLocaleString('ko-KR') + ')';
                  putDraft(key, draftData(sRef.current)).then(() => { alert('임시저장했습니다: ' + key); refreshDrafts(); }).catch((e: Error) => alert('임시저장 실패: ' + e.message));
                }}>임시저장</button>
                <button type="button" className="abtn primary" disabled={busy} onClick={publish}>게시하기</button>
                <p className="hint">작성 내용은 이 브라우저에 자동 저장됩니다.</p>
                <ol className="log" aria-live="polite">
                  {logs.map((l, i) => (
                    <li key={i} className={l.cls}>{l.href ? <a href={l.href} target="_blank" rel="noopener">{l.text}</a> : l.text}</li>
                  ))}
                </ol>
              </section>
            </aside>
          </div>

          {preview && (
            <section className="preview-wrap">
              <div className="preview-bar">
                <strong>미리보기</strong>
                <button type="button" className="abtn sm" onClick={() => setPreview(false)}>닫기</button>
              </div>
              <div className="wrap">
                <Article view={{
                  category: s.category,
                  crumb: s.seoTitle.trim() || s.h1.trim(),
                  title: s.h1.trim() || s.seoTitle.trim(),
                  pubDate: s.pubDate || today(),
                  modDate: s.published && s.pubDate ? today() : undefined,
                  minutes: readMinutes(render.text),
                  summary: s.summary,
                  bodyHtml: render.html,
                  faqs: s.faqs,
                  related: [],
                }} />
              </div>
            </section>
          )}
        </main>
      )}
    </div>
  );
}
