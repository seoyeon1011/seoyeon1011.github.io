// Ref 관리자 글쓰기 화면
// 글 작성, SEO 점검, 이미지 변환, GitHub 저장소에 한 번의 커밋으로 게시까지 처리한다.
// 기준값(RULE)은 .claude/skills/ref글작성/SKILL.md의 SEO 기준과 같아야 한다.
(function () {
  'use strict';

  var CFG = { owner: 'seoyeon1011', repo: 'seoyeon1011.github.io', site: 'https://seoyeon1011.github.io' };
  // 분류(카테고리). 메뉴 묶음: 마케팅 지식(seo-content, marketing), 포트폴리오(project, automation, certificate + 소개), 일기(diary)
  var CATS = { 'seo-content': '콘텐츠·SEO', 'marketing': '마케팅 전략', 'project': '프로젝트', 'automation': '자동화 실습', 'certificate': '자격증', 'diary': '일기' };
  var RULE = { titleMin: 10, titleMax: 15, descMin: 120, descMax: 200, bodyMin: 2000, imgMin: 5, h2Min: 4, kwMin: 3, recentMax: 6 };

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var token = sessionStorage.getItem('ref_token') || localStorage.getItem('ref_token') || '';
  var branch = 'main';
  var state = newState();
  var autosaveTimer = null;

  function newState() {
    return {
      category: 'seo-content', keyword: '', seoTitle: '', h1: '', slug: '', desc: '', summary: '', body: '',
      faqs: [], indexable: true, pubDate: '', images: [], nextImg: 1, published: false
    };
  }

  // ---------- 공통 도구 ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dot(d) { return (d || '').replace(/-/g, '.'); }
  function rfc822(dateStr) {
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var p = dateStr.split('-').map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    return days[d.getUTCDay()] + ', ' + pad(p[2]) + ' ' + mons[p[1] - 1] + ' ' + p[0] + ' 09:00:00 +0900';
  }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function noSpaceLen(s) { return s.replace(/\s/g, '').length; }
  function shortText(s, n) { return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; }
  function log(msg, cls) {
    var li = document.createElement('li');
    li.textContent = msg;
    if (cls) li.className = cls;
    $('#log').appendChild(li);
  }

  // ---------- GitHub API ----------
  function gh(path, opts) {
    opts = opts || {};
    var headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (opts.body) headers['Content-Type'] = 'application/json';
    return fetch('https://api.github.com' + path, { method: opts.method || 'GET', body: opts.body, headers: headers, cache: 'no-store' })
      .then(function (res) {
        if (res.ok) return res.status === 204 ? null : res.json();
        return res.json().catch(function () { return {}; }).then(function (j) {
          var e = new Error(res.status + ' ' + (j.message || ''));
          e.status = res.status;
          throw e;
        });
      });
  }
  function rp(p) { return '/repos/' + CFG.owner + '/' + CFG.repo + p; }
  function b64ToText(b) {
    var bin = atob(b.replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function blobToB64(blob) {
    return blob.arrayBuffer().then(function (buf) {
      var u = new Uint8Array(buf), s = '';
      for (var i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      return btoa(s);
    });
  }
  function getFile(path) {
    var enc = path.split('/').map(encodeURIComponent).join('/');
    return gh(rp('/contents/' + enc + '?ref=' + branch)).then(function (j) { return b64ToText(j.content); })
      .catch(function (e) { if (e.status === 404) return null; throw e; });
  }
  async function commitFiles(files, message) {
    var ref = await gh(rp('/git/ref/heads/' + branch));
    var base = ref.object.sha;
    var baseCommit = await gh(rp('/git/commits/' + base));
    var tree = [];
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (f.blob) {
        log('이미지 업로드 중: ' + f.path);
        var b = await gh(rp('/git/blobs'), { method: 'POST', body: JSON.stringify({ content: await blobToB64(f.blob), encoding: 'base64' }) });
        tree.push({ path: f.path, mode: '100644', type: 'blob', sha: b.sha });
      } else {
        tree.push({ path: f.path, mode: '100644', type: 'blob', content: f.content });
      }
    }
    var t = await gh(rp('/git/trees'), { method: 'POST', body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: tree }) });
    var c = await gh(rp('/git/commits'), { method: 'POST', body: JSON.stringify({ message: message, tree: t.sha, parents: [base] }) });
    await gh(rp('/git/refs/heads/' + branch), { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) });
    return c.sha;
  }

  // ---------- 임시저장 (IndexedDB, 이미지 포함) ----------
  function idb() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open('ref-admin', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('drafts'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idbDo(mode, fn) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction('drafts', mode);
        var out = fn(tx.objectStore('drafts'));
        tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : undefined); };
        tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function draftData() {
    var copy = JSON.parse(JSON.stringify(Object.assign({}, state, { images: [] })));
    copy.images = state.images.map(function (im) {
      return { no: im.no, blob: im.blob || null, type: im.type, path: im.path || null, remote: im.remote || null, alt: im.alt, caption: im.caption, width: im.width, height: im.height };
    });
    copy.savedAt = new Date().toLocaleString('ko-KR');
    return copy;
  }
  function saveDraft(key) { return idbDo('readwrite', function (s) { return s.put(draftData(), key); }); }
  function loadDraftKeys() { return idbDo('readonly', function (s) { return s.getAllKeys(); }); }
  function getDraft(key) { return idbDo('readonly', function (s) { return s.get(key); }); }
  function scheduleAutosave() {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(function () { saveDraft('자동저장').catch(function () {}); }, 1500);
  }

  // ---------- 본문 변환 (간단한 마크다운) ----------
  function inline(s) {
    s = esc(s);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, text, url) {
      var ext = /^https?:/.test(url) && url.indexOf(CFG.site) !== 0;
      return '<a href="' + url + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + text + '</a>';
    });
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    return s;
  }
  function imgByNo(no) { return state.images.filter(function (im) { return im.no === no; })[0]; }

  // mode: 'preview'(미리보기 주소) 또는 'publish'(사이트 경로)
  function renderBody(md, mode) {
    var lines = md.replace(/\r/g, '').split('\n');
    var out = [], para = [], h2 = 0, i = 0, used = [];
    var plain = [], firstPara = null;
    function flush() {
      if (para.length) {
        var t = para.join(' ');
        out.push('<p>' + inline(t) + '</p>');
        plain.push(t);
        if (firstPara === null) firstPara = t;
        para = [];
      }
    }
    while (i < lines.length) {
      var L = lines[i], m;
      if (!L.trim()) { flush(); i++; continue; }
      if ((m = L.trim().match(/^\[\[이미지(\d+)\]\]$/))) {
        flush();
        var no = +m[1], im = imgByNo(no);
        if (im) {
          used.push(no);
          var src = mode === 'preview' ? im.url : '../' + im.path;
          out.push('<figure>\n          <img src="' + esc(src) + '" alt="' + esc(im.alt) + '" width="' + im.width + '" height="' + im.height + '" loading="lazy" decoding="async">' +
            (im.caption ? '\n          <figcaption>' + esc(im.caption) + '</figcaption>' : '') + '\n        </figure>');
        } else {
          out.push('<div class="todo">[이미지' + no + ' 없음: 이미지 목록에서 번호를 확인하세요]</div>');
        }
        i++; continue;
      }
      if ((m = L.match(/^##\s+(.+)/)) && !/^###/.test(L)) { flush(); h2++; out.push('<h2 id="s' + h2 + '">' + inline(m[1].trim()) + '</h2>'); plain.push(m[1]); i++; continue; }
      if ((m = L.match(/^###\s+(.+)/))) { flush(); out.push('<h3>' + inline(m[1].trim()) + '</h3>'); plain.push(m[1]); i++; continue; }
      if (/^\s*[-*]\s+/.test(L)) {
        flush(); var ul = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { var t1 = lines[i].replace(/^\s*[-*]\s+/, ''); ul.push('<li>' + inline(t1) + '</li>'); plain.push(t1); i++; }
        out.push('<ul>\n          ' + ul.join('\n          ') + '\n        </ul>'); continue;
      }
      if (/^\s*\d+[.)]\s+/.test(L)) {
        flush(); var ol = [];
        while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { var t2 = lines[i].replace(/^\s*\d+[.)]\s+/, ''); ol.push('<li>' + inline(t2) + '</li>'); plain.push(t2); i++; }
        out.push('<ol>\n          ' + ol.join('\n          ') + '\n        </ol>'); continue;
      }
      if (/^>\s?/.test(L)) {
        flush(); var q = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
        out.push('<blockquote><p>' + inline(q.join(' ')) + '</p></blockquote>'); plain.push(q.join(' ')); continue;
      }
      if (/^\s*\|.*\|\s*$/.test(L)) {
        flush(); var rows = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
          var cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); });
          if (!cells.every(function (c) { return /^:?-{2,}:?$/.test(c); })) rows.push(cells);
          i++;
        }
        if (rows.length) {
          var head = '<tr>' + rows[0].map(function (c) { plain.push(c); return '<th>' + inline(c) + '</th>'; }).join('') + '</tr>';
          var bodyRows = rows.slice(1).map(function (r) { return '<tr>' + r.map(function (c) { plain.push(c); return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>'; });
          out.push('<div class="table-wrap">\n          <table>\n            <thead>' + head + '</thead>\n            <tbody>\n              ' + bodyRows.join('\n              ') + '\n            </tbody>\n          </table>\n        </div>');
        }
        continue;
      }
      para.push(L.trim()); i++;
    }
    flush();
    var text = plain.join('\n').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*|`/g, '');
    return { html: out.join('\n\n        '), h2: h2, used: used, text: text, firstPara: (firstPara || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') };
  }

  // ---------- SEO 점검 ----------
  function checks() {
    var r = renderBody(state.body, 'preview');
    var kw = state.keyword.trim();
    var t = state.seoTitle.trim();
    var d = state.desc.trim();
    var bodyLen = noSpaceLen(r.text);
    var usedImgs = state.images.filter(function (im) { return r.used.indexOf(im.no) !== -1; });
    var unused = state.images.length - usedImgs.length;
    var noAlt = usedImgs.filter(function (im) { return !im.alt.trim(); }).length;
    var kwCount = kw ? (r.text.toLowerCase().split(kw.toLowerCase()).length - 1) : 0;
    var internal = (state.body.match(/\]\(([^)\s]+)\)/g) || []).filter(function (m) { return !/\]\(https?:/.test(m) || m.indexOf(CFG.site) !== -1; }).length;
    var list = [
      { ok: t.length >= RULE.titleMin && t.length <= RULE.titleMax, label: 'SEO 타이틀 ' + RULE.titleMin + '~' + RULE.titleMax + '자', detail: '현재 ' + t.length + '자 (공백 포함)' },
      { ok: d.length >= RULE.descMin && d.length <= RULE.descMax, label: '메타 디스크립션 ' + RULE.descMin + '~' + RULE.descMax + '자', detail: '현재 ' + d.length + '자 (공백 포함)' },
      { ok: bodyLen >= RULE.bodyMin, label: '본문 공백 제외 ' + RULE.bodyMin + '자 이상', detail: '현재 ' + bodyLen + '자' },
      { ok: usedImgs.length >= RULE.imgMin, label: '본문 이미지 ' + RULE.imgMin + '장 이상', detail: '본문에 넣은 이미지 ' + usedImgs.length + '장' + (unused ? ', 넣지 않은 이미지 ' + unused + '장' : '') },
      { ok: usedImgs.length > 0 && noAlt === 0, label: '모든 이미지 대체 텍스트(alt)', detail: noAlt ? noAlt + '장 비어 있음 (게시 불가)' : (usedImgs.length ? '모두 작성됨' : '이미지 없음') },
      { ok: r.h2 >= RULE.h2Min, label: '소제목(##) ' + RULE.h2Min + '개 이상', detail: '현재 ' + r.h2 + '개' },
      { ok: !!kw && t.toLowerCase().indexOf(kw.toLowerCase()) === 0, label: '타이틀 맨 앞에 키워드', detail: kw ? (t.toLowerCase().indexOf(kw.toLowerCase()) === -1 ? '타이틀에 키워드 없음' : (t.toLowerCase().indexOf(kw.toLowerCase()) === 0 ? '맨 앞에 있음' : '포함됐지만 맨 앞은 아님')) : '타깃 키워드를 입력하세요' },
      { ok: !!kw && d.toLowerCase().indexOf(kw.toLowerCase()) !== -1, label: '디스크립션에 키워드', detail: '' },
      { ok: !!kw && r.firstPara.toLowerCase().indexOf(kw.toLowerCase()) !== -1, label: '첫 문단에 키워드', detail: '' },
      { ok: kwCount >= RULE.kwMin, label: '본문 키워드 ' + RULE.kwMin + '회 이상', detail: '현재 ' + kwCount + '회' },
      { ok: internal >= 1, label: '내부 링크 1개 이상', detail: '현재 ' + internal + '개' },
      { ok: /^[a-z0-9]+(-[a-z0-9]+)*$/.test(state.slug), label: '주소(슬러그) 형식', detail: state.slug ? '' : '비어 있음 (게시 불가)' }
    ];
    // 0~3번째 항목의 실제 값은 카운터에도 보여 준다
    setCounter('#c-title', t.length + '자 / ' + RULE.titleMin + '~' + RULE.titleMax, list[0].ok);
    setCounter('#c-desc', d.length + '자 / ' + RULE.descMin + '~' + RULE.descMax, list[1].ok);
    setCounter('#c-body', '공백 제외 ' + bodyLen + '자 / ' + RULE.bodyMin + ' 이상', list[2].ok);
    setCounter('#c-img', '본문 ' + usedImgs.length + '장 / ' + RULE.imgMin + ' 이상', list[3].ok);
    return { list: list, render: r, usedImgs: usedImgs, noAlt: noAlt, bodyLen: bodyLen };
  }
  function setCounter(sel, text, ok) { var el = $(sel); el.textContent = text; el.className = 'counter ' + (ok ? 'ok' : 'bad'); }
  function refresh() {
    var c = checks();
    var ul = $('#checks');
    ul.innerHTML = '';
    var pass = 0;
    c.list.forEach(function (it) {
      if (it.ok) pass++;
      var li = document.createElement('li');
      li.className = it.ok ? 'ok' : 'bad';
      li.innerHTML = '<span class="mark">' + (it.ok ? 'O' : 'X') + '</span><span>' + esc(it.label) + (it.detail ? '<small>' + esc(it.detail) + '</small>' : '') + '</span>';
      ul.appendChild(li);
    });
    $('#score').textContent = pass + ' / ' + c.list.length + ' 통과';
    // 이미지 사용 여부 표시
    $$('.img-item').forEach(function (el) {
      var no = +el.dataset.no, em = el.querySelector('.no em');
      var used = c.render.used.indexOf(no) !== -1;
      em.textContent = used ? '본문에 있음' : '본문에 없음';
      em.className = used ? 'used' : 'unused';
    });
    return c;
  }

  // ---------- 화면과 상태 연결 ----------
  function fillForm() {
    $$('[data-field]').forEach(function (el) { el.value = state[el.dataset.field] || ''; });
    $('[data-field="slug"]').readOnly = !!state.published;
    $$('input[name="vis"]').forEach(function (r) { r.checked = (r.value === 'index') === state.indexable; });
    $('#mode-label').textContent = state.published ? '게시한 글 수정 중: ' + state.slug : '새 글 작성 중';
    renderImages();
    renderFaqs();
    refresh();
  }
  function onField(e) {
    var el = e.target;
    if (el.dataset.field) {
      state[el.dataset.field] = el.value;
      if (el.dataset.field === 'slug') { el.value = el.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'); state.slug = el.value; }
      refresh();
      scheduleAutosave();
    }
  }

  function renderImages() {
    var box = $('#img-list');
    box.innerHTML = '';
    state.images.forEach(function (im) {
      var div = document.createElement('div');
      div.className = 'img-item';
      div.dataset.no = im.no;
      div.innerHTML =
        '<img src="' + esc(im.url) + '" alt="">' +
        '<div><div class="no">이미지' + im.no + '<em></em></div>' +
        '<input type="text" class="alt" placeholder="대체 텍스트(alt): 이미지 내용을 키워드 포함해 한 문장으로 (필수)" value="' + esc(im.alt) + '">' +
        '<input type="text" class="cap" placeholder="캡션 (선택, 이미지 아래 작은 글씨)" value="' + esc(im.caption) + '">' +
        '<div class="btns"><button type="button" class="abtn sm put">본문 커서 위치에 넣기</button><button type="button" class="abtn sm danger del">삭제</button></div></div>';
      div.querySelector('.alt').addEventListener('input', function (e) { im.alt = e.target.value; refresh(); scheduleAutosave(); });
      div.querySelector('.cap').addEventListener('input', function (e) { im.caption = e.target.value; scheduleAutosave(); });
      div.querySelector('.put').addEventListener('click', function () { insertAtCursor('\n[[이미지' + im.no + ']]\n'); });
      div.querySelector('.del').addEventListener('click', function () {
        if (!confirm('이미지' + im.no + '을(를) 목록에서 지울까요? 본문의 [[이미지' + im.no + ']] 표시는 직접 지워야 합니다.')) return;
        state.images = state.images.filter(function (x) { return x !== im; });
        renderImages(); refresh(); scheduleAutosave();
      });
      box.appendChild(div);
    });
  }

  function processImage(file) {
    return new Promise(function (res, rej) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 1600, w = img.naturalWidth, h = img.naturalHeight;
        if (w > max) { h = Math.round(h * max / w); w = max; }
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) {
          if (!b) return rej(new Error('변환 실패: ' + file.name));
          res({ blob: b, type: b.type, width: w, height: h });
        }, 'image/webp', 0.82);
      };
      img.onerror = function () { rej(new Error('이미지를 읽을 수 없습니다: ' + file.name)); };
      img.src = url;
    });
  }
  async function addFiles(files) {
    for (var i = 0; i < files.length; i++) {
      if (!/^image\//.test(files[i].type)) continue;
      try {
        var p = await processImage(files[i]);
        var no = state.nextImg++;
        state.images.push({ no: no, blob: p.blob, type: p.type, url: URL.createObjectURL(p.blob), path: null, alt: '', caption: '', width: p.width, height: p.height });
      } catch (e) { alert(e.message); }
    }
    renderImages(); refresh(); scheduleAutosave();
  }

  function renderFaqs() {
    var box = $('#faq-list');
    box.innerHTML = '';
    state.faqs.forEach(function (f, idx) {
      var div = document.createElement('div');
      div.className = 'faq-item';
      div.innerHTML = '<label>질문<input type="text" class="q" value="' + esc(f.q) + '"></label>' +
        '<label>답변<textarea class="a" rows="2">' + esc(f.a) + '</textarea></label>' +
        '<button type="button" class="abtn sm danger">질문 삭제</button>';
      div.querySelector('.q').addEventListener('input', function (e) { f.q = e.target.value; scheduleAutosave(); });
      div.querySelector('.a').addEventListener('input', function (e) { f.a = e.target.value; scheduleAutosave(); });
      div.querySelector('button').addEventListener('click', function () { state.faqs.splice(idx, 1); renderFaqs(); scheduleAutosave(); });
      box.appendChild(div);
    });
  }

  function insertAtCursor(text) {
    var ta = $('#body');
    var s = ta.selectionStart, e = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
    ta.selectionStart = ta.selectionEnd = s + text.length;
    ta.focus();
    state.body = ta.value;
    refresh(); scheduleAutosave();
  }
  function wrapSelection(before, after, fallback) {
    var ta = $('#body');
    var s = ta.selectionStart, e = ta.selectionEnd;
    var sel = ta.value.slice(s, e) || fallback;
    insertAtCursor(before + sel + after);
  }
  var SNIPPETS = {
    h2: function () { insertAtCursor('\n## 소제목\n\n'); },
    h3: function () { insertAtCursor('\n### 작은 소제목\n\n'); },
    ul: function () { insertAtCursor('\n- 항목\n- 항목\n\n'); },
    ol: function () { insertAtCursor('\n1. 항목\n2. 항목\n\n'); },
    quote: function () { insertAtCursor('\n> 인용문\n\n'); },
    table: function () { insertAtCursor('\n| 항목 | 내용 |\n| --- | --- |\n| 값 | 값 |\n\n'); },
    link: function () { wrapSelection('[', '](글주소.html)', '링크 글자'); },
    bold: function () { wrapSelection('**', '**', '굵게'); }
  };

  // ---------- HTML 생성 ----------
  function navHtml(cat) {
    function a(href, label, on) { return '<li><a href="' + href + '"' + (on ? ' aria-current="page"' : '') + '>' + label + '</a></li>'; }
    function group(label, items) {
      return '          <li class="has-sub">\n' +
        '            <button type="button" class="sub-toggle" aria-expanded="false">' + label + '</button>\n' +
        '            <ul class="sub">\n' + items.map(function (x) { return '              ' + x + '\n'; }).join('') +
        '            </ul>\n          </li>\n';
    }
    return '  <header class="site-header">\n    <div class="wrap">\n      <a class="logo" href="../index.html">Ref<span>.</span></a>\n' +
      '      <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">메뉴</button>\n' +
      '      <nav class="nav" id="site-nav" aria-label="주요 메뉴">\n        <ul>\n' +
      '          ' + a('../posts.html', '전체 글') + '\n' +
      group('마케팅 지식', [
        a('../category/seo-content.html', '콘텐츠·SEO', cat === 'seo-content'),
        a('../category/marketing.html', '마케팅 전략', cat === 'marketing')
      ]) +
      group('포트폴리오', [
        a('../category/project.html', '프로젝트', cat === 'project'),
        a('../category/automation.html', '자동화 실습', cat === 'automation'),
        a('../category/certificate.html', '자격증', cat === 'certificate'),
        a('../about.html', '소개')
      ]) +
      '          ' + a('../category/diary.html', '일기', cat === 'diary') + '\n' +
      '        </ul>\n      </nav>\n    </div>\n  </header>';
  }
  function articleHtml(s, mode, related) {
    var r = renderBody(s.body, mode);
    var h1 = s.h1.trim() || s.seoTitle.trim();
    var date = s.pubDate || today();
    var mins = Math.max(1, Math.round(noSpaceLen(r.text) / 500));
    var sum = s.summary.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    var faqs = s.faqs.filter(function (f) { return f.q.trim() && f.a.trim(); });
    var h = '';
    h += '    <article class="read">\n      <header class="page-head">\n';
    h += '        <nav class="breadcrumb" aria-label="현재 위치"><ol><li><a href="../index.html">홈</a></li><li><a href="../category/' + s.category + '.html">' + CATS[s.category] + '</a></li><li>' + esc(s.seoTitle.trim() || h1) + '</li></ol></nav>\n';
    h += '        <span class="tag">' + CATS[s.category] + '</span>\n';
    h += '        <h1>' + esc(h1) + '</h1>\n';
    h += '        <div class="post-meta">\n          <span>레프(Ref)</span>\n          <time datetime="' + date + '">' + dot(date) + ' 작성</time>\n';
    if (s.published && s.pubDate && s.pubDate !== today()) h += '          <time datetime="' + today() + '">' + dot(today()) + ' 수정</time>\n';
    h += '          <span>읽는 시간 약 ' + mins + '분</span>\n        </div>\n      </header>\n\n';
    if (sum.length) h += '      <div class="summary">\n        <strong>핵심 요약</strong>\n        <ul>\n' + sum.map(function (x) { return '          <li>' + inline(x) + '</li>'; }).join('\n') + '\n        </ul>\n      </div>\n\n';
    h += '      <nav class="toc" data-toc hidden aria-label="목차"><p>목차</p></nav>\n\n';
    h += '      <div class="prose">\n        ' + r.html + '\n      </div>\n';
    if (faqs.length) {
      h += '\n      <section class="faq" aria-labelledby="faq-title">\n        <h2 id="faq-title">자주 묻는 질문</h2>\n';
      h += faqs.map(function (f) { return '        <details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'; }).join('\n') + '\n      </section>\n';
    }
    h += '\n      <aside class="author-box">\n        <div class="avatar" aria-hidden="true">R</div>\n        <div>\n          <p><strong>레프(Ref)</strong></p>\n' +
      '          <p>콘텐츠·SEO 마케팅을 공부하며 Claude Code로 마케팅 업무를 자동화하고 있습니다. <a href="../about.html">소개 보기</a></p>\n        </div>\n      </aside>\n';
    if (related && related.length) {
      h += '\n      <section class="related">\n        <h2>함께 읽으면 좋은 글</h2>\n        <div class="grid">\n';
      h += related.map(function (p) {
        return '          <article class="card">\n            <span class="tag">' + esc(p.tag) + '</span>\n            <h3><a href="' + esc(p.slug) + '.html">' + esc(p.title) + '</a></h3>\n          </article>';
      }).join('\n') + '\n        </div>\n      </section>\n';
    }
    h += '    </article>';
    return h;
  }
  function postHtml(s, related) {
    var url = CFG.site + '/posts/' + s.slug + '.html';
    var h1 = s.h1.trim() || s.seoTitle.trim();
    var r = renderBody(s.body, 'publish');
    var imgs = r.used.map(function (no) { return CFG.site + '/' + imgByNo(no).path; });
    var ogImg = imgs[0] || CFG.site + '/assets/img/og-default.png';
    var mod = today();
    var faqs = s.faqs.filter(function (f) { return f.q.trim() && f.a.trim(); });
    var ld = [
      {
        '@context': 'https://schema.org', '@type': 'BlogPosting', headline: h1, description: s.desc.trim(),
        datePublished: s.pubDate, dateModified: mod, inLanguage: 'ko-KR', keywords: s.keyword.trim(),
        image: imgs.length ? imgs : [ogImg], mainEntityOfPage: url,
        author: { '@type': 'Person', name: '레프(Ref)', url: CFG.site + '/about.html' },
        publisher: { '@type': 'Person', name: '레프(Ref)' }
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: CFG.site + '/' },
          { '@type': 'ListItem', position: 2, name: CATS[s.category], item: CFG.site + '/category/' + s.category + '.html' },
          { '@type': 'ListItem', position: 3, name: s.seoTitle.trim() || h1 }
        ]
      }
    ];
    if (faqs.length) {
      ld.push({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map(function (f) { return { '@type': 'Question', name: f.q.trim(), acceptedAnswer: { '@type': 'Answer', text: f.a.trim() } }; })
      });
    }
    var ldText = JSON.stringify(ld, null, 2).replace(/</g, '\\u003c');
    return '<!DOCTYPE html>\n<!-- 관리자 글쓰기 화면에서 생성된 글. 수정은 /admin/ 의 "게시한 글 수정하기"로 한다 -->\n<html lang="ko">\n<head>\n' +
      '  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '  <title>' + esc(s.seoTitle.trim()) + '</title>\n' +
      '  <meta name="description" content="' + esc(s.desc.trim()) + '">\n' +
      '  <link rel="canonical" href="' + url + '">\n' +
      '  <meta name="robots" content="' + (s.indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow') + '">\n' +
      '  <meta name="author" content="레프(Ref)">\n' +
      '  <meta property="og:type" content="article">\n  <meta property="og:site_name" content="Ref(레프)">\n' +
      '  <meta property="og:title" content="' + esc(h1) + '">\n' +
      '  <meta property="og:description" content="' + esc(s.desc.trim()) + '">\n' +
      '  <meta property="og:url" content="' + url + '">\n' +
      '  <meta property="og:image" content="' + esc(ogImg) + '">\n' +
      '  <meta property="article:published_time" content="' + s.pubDate + '">\n' +
      '  <meta property="article:modified_time" content="' + mod + '">\n' +
      '  <meta name="twitter:card" content="summary_large_image">\n' +
      '  <link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">\n' +
      '  <link rel="alternate" type="application/rss+xml" title="Ref(레프) RSS" href="../rss.xml">\n' +
      '  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">\n' +
      '  <link rel="stylesheet" href="../assets/css/style.css">\n' +
      '  <script type="application/ld+json">\n' + ldText + '\n  </script>\n</head>\n<body>\n' +
      '  <a class="skip-link" href="#main">본문 바로가기</a>\n' + navHtml(s.category) + '\n\n' +
      '  <main id="main" class="wrap">\n' + articleHtml(s, 'publish', related) + '\n  </main>\n\n' +
      '  <footer class="site-footer">\n    <div class="wrap">\n      <p>&copy; 2026 Ref(레프). 콘텐츠·SEO 마케팅 지식창고</p>\n      <ul>\n' +
      '        <li><a href="../about.html">소개</a></li>\n        <li><a href="../rss.xml">RSS</a></li>\n        <li><a href="../sitemap.xml">사이트맵</a></li>\n' +
      '      </ul>\n    </div>\n  </footer>\n  <script src="../assets/js/main.js" defer></script>\n</body>\n</html>\n';
  }
  function cardHtml(s, prefix, indent, withData) {
    var h1 = s.h1.trim() || s.seoTitle.trim();
    var p = indent;
    return p + '<article class="card"' + (withData ? ' data-cat="' + s.category + '" data-keywords="' + esc(s.keyword.trim()) + '"' : '') + '>\n' +
      p + '  <span class="tag">' + CATS[s.category] + '</span>\n' +
      p + '  <h3><a href="' + prefix + 'posts/' + s.slug + '.html">' + esc(h1) + '</a></h3>\n' +
      p + '  <p>' + esc(shortText(s.desc.trim(), 90)) + '</p>\n' +
      p + '  <span class="meta"><time datetime="' + s.pubDate + '">' + dot(s.pubDate) + '</time></span>\n' +
      p + '</article>\n';
  }
  function removeCard(html, slug) {
    var re = new RegExp('[ \\t]*<article class="card"[^>]*>(?:(?!</article>)[\\s\\S])*?href="(?:\\.\\./)?(?:posts/)?' + reEsc(slug) + '\\.html"[\\s\\S]*?</article>[ \\t]*\\n?', 'g');
    return html.replace(re, '');
  }
  function insertAfter(html, marker, snippet, fileName) {
    var i = html.indexOf(marker);
    if (i === -1) throw new Error(fileName + '에서 삽입 위치 표시(' + marker + ')를 찾지 못했습니다.');
    var end = html.indexOf('\n', i) + 1;
    return html.slice(0, end) + snippet + html.slice(end);
  }
  function countCards(html, marker) {
    var i = html.indexOf(marker);
    if (i === -1) return 0;
    return (html.slice(i).match(/<article class="card"/g) || []).length;
  }

  // ---------- 게시 ----------
  async function publish() {
    var c = refresh();
    var s = state;
    var errs = [];
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.slug)) errs.push('주소(슬러그)를 영문 소문자, 숫자, 하이픈으로 입력하세요.');
    if (!s.seoTitle.trim()) errs.push('SEO 타이틀을 입력하세요.');
    if (!s.desc.trim()) errs.push('메타 디스크립션을 입력하세요.');
    if (!s.body.trim()) errs.push('본문을 입력하세요.');
    if (c.noAlt) errs.push('본문에 넣은 이미지 중 대체 텍스트(alt)가 빈 이미지가 ' + c.noAlt + '장 있습니다.');
    if (errs.length) { alert(errs.join('\n')); return; }
    var fails = c.list.filter(function (x) { return !x.ok; });
    var msg = (fails.length ? 'SEO 기준 미달 ' + fails.length + '개:\n- ' + fails.map(function (x) { return x.label + (x.detail ? ' (' + x.detail + ')' : ''); }).join('\n- ') + '\n\n' : 'SEO 점검을 모두 통과했습니다.\n\n') +
      (s.indexable ? '검색 노출' : '작성 중(noindex)') + ' 상태로 게시할까요?';
    if (!confirm(msg)) return;

    var btn = $('#publish');
    var wasPublished = s.published;
    btn.disabled = true;
    $('#log').innerHTML = '';
    try {
      log('저장소 파일 읽는 중');
      var existing = await getFile('posts/' + s.slug + '.html');
      if (existing && !s.published) {
        throw new Error('posts/' + s.slug + '.html 이 이미 있습니다. 다른 주소를 쓰거나, 관리자 화면에서 만든 글이면 "게시한 글 수정하기"로 불러오세요.');
      }
      var isNew = !existing;
      if (!s.pubDate) s.pubDate = today();
      var catKeys = Object.keys(CATS);
      var files = await Promise.all(['posts.html', 'index.html', 'sitemap.xml', 'rss.xml'].concat(catKeys.map(function (k) { return 'category/' + k + '.html'; })).map(getFile));
      var postsHtml = files[0], indexHtml = files[1], sitemap = files[2], rss = files[3];
      var catHtml = {};
      catKeys.forEach(function (k, i) { catHtml[k] = files[4 + i]; });
      if (!catHtml[s.category]) throw new Error('category/' + s.category + '.html 을 저장소에서 찾지 못했습니다. 분류 페이지를 먼저 GitHub에 올렸는지 확인하세요.');
      if (!postsHtml || !indexHtml || !sitemap || !rss) throw new Error('사이트 기본 파일을 찾지 못했습니다. 저장소에 사이트 파일을 먼저 올렸는지 확인하세요.');

      // 이미지 경로 확정 (본문에 넣은 이미지만 올린다)
      var upload = [];
      c.usedImgs.forEach(function (im) {
        if (!im.path) {
          var ext = /png/.test(im.type) ? 'png' : (/jpe?g/.test(im.type) ? 'jpg' : 'webp');
          im.path = 'assets/img/posts/' + s.slug + '-' + im.no + '.' + ext;
        }
        if (im.blob && !im.uploaded) upload.push({ path: im.path, blob: im.blob, im: im });
      });

      // 관련 글: 같은 카테고리 우선 2개
      var doc = new DOMParser().parseFromString(postsHtml, 'text/html');
      var all = Array.prototype.slice.call(doc.querySelectorAll('[data-post-list] .card')).map(function (el) {
        var a = el.querySelector('h3 a');
        var m = a ? (a.getAttribute('href') || '').match(/([a-z0-9-]+)\.html$/) : null;
        return m ? { slug: m[1], title: a.textContent.trim(), cat: el.dataset.cat, tag: (el.querySelector('.tag') || {}).textContent || '' } : null;
      }).filter(function (p) { return p && p.slug !== s.slug; });
      var related = all.filter(function (p) { return p.cat === s.category; }).concat(all.filter(function (p) { return p.cat !== s.category; })).slice(0, 2);

      log('목록, 카테고리, 사이트맵, RSS 갱신 중');
      // 전체 글 목록
      postsHtml = removeCard(postsHtml, s.slug);
      postsHtml = insertAfter(postsHtml, 'data-post-list>', cardHtml(s, '', '      ', true), 'posts.html');
      // 카테고리 (다른 카테고리에 있던 카드는 지운다)
      Object.keys(catHtml).forEach(function (k) {
        if (!catHtml[k]) return;
        catHtml[k] = removeCard(catHtml[k], s.slug);
        if (k === s.category) catHtml[k] = insertAfter(catHtml[k], 'data-cat-list>', cardHtml(s, '../', '      ', false), 'category/' + k + '.html');
      });
      // 홈 최근 글 + 글 개수
      indexHtml = removeCard(indexHtml, s.slug);
      indexHtml = insertAfter(indexHtml, '<!-- recent:start -->', cardHtml(s, '', '          ', false), 'index.html');
      var rs = indexHtml.indexOf('<!-- recent:start -->'), re = indexHtml.indexOf('<!-- recent:end -->');
      if (rs !== -1 && re !== -1) {
        var seg = indexHtml.slice(rs, re);
        var cards = seg.match(/[ \t]*<article class="card"[\s\S]*?<\/article>[ \t]*\n?/g) || [];
        if (cards.length > RULE.recentMax) {
          var keep = cards.slice(0, RULE.recentMax).join('');
          indexHtml = indexHtml.slice(0, rs) + '<!-- recent:start -->\n' + keep + indexHtml.slice(indexHtml.lastIndexOf('\n', re) + 1);
        }
      }
      Object.keys(catHtml).forEach(function (k) {
        if (!catHtml[k]) return;
        var n = countCards(catHtml[k], 'data-cat-list>');
        indexHtml = indexHtml.replace(new RegExp('(data-count="' + k + '">)[^<]*'), '$1글 ' + n + '개');
      });
      // 사이트맵
      var loc = CFG.site + '/posts/' + s.slug + '.html';
      sitemap = sitemap.replace(new RegExp('[ \\t]*<url><loc>' + reEsc(loc) + '</loc>.*?</url>\\n?', 'g'), '');
      [CFG.site + '/', CFG.site + '/posts.html', CFG.site + '/category/' + s.category + '.html'].forEach(function (u) {
        sitemap = sitemap.replace(new RegExp('(<loc>' + reEsc(u) + '</loc><lastmod>)[^<]*'), '$1' + today());
      });
      if (s.indexable) sitemap = sitemap.replace('</urlset>', '  <url><loc>' + loc + '</loc><lastmod>' + today() + '</lastmod></url>\n</urlset>');
      // RSS
      rss = rss.replace(new RegExp('[ \\t]*<item>(?:(?!</item>)[\\s\\S])*?<link>' + reEsc(loc) + '</link>[\\s\\S]*?</item>[ \\t]*\\n?', 'g'), '');
      if (s.indexable) {
        var item = '    <item>\n      <title>' + esc(s.h1.trim() || s.seoTitle.trim()) + '</title>\n      <link>' + loc + '</link>\n      <guid>' + loc + '</guid>\n' +
          '      <description>' + esc(s.desc.trim()) + '</description>\n      <category>' + CATS[s.category] + '</category>\n      <pubDate>' + rfc822(s.pubDate) + '</pubDate>\n    </item>\n';
        rss = insertAfter(rss, '<atom:link', item, 'rss.xml');
      }
      rss = rss.replace(/<lastBuildDate>[^<]*<\/lastBuildDate>/, '<lastBuildDate>' + rfc822(today()) + '</lastBuildDate>');

      // 글 원본 (다시 불러와 수정할 때 사용, 사이트에는 공개되지 않음)
      s.published = true;
      var source = JSON.parse(JSON.stringify(Object.assign({}, s, { images: [] })));
      source.images = s.images.filter(function (im) { return im.path; }).map(function (im) {
        return { no: im.no, path: im.path, type: im.type, alt: im.alt, caption: im.caption, width: im.width, height: im.height };
      });

      var out = upload.map(function (u) { return { path: u.path, blob: u.blob }; });
      out.push({ path: 'posts/' + s.slug + '.html', content: postHtml(s, related) });
      out.push({ path: '_source/' + s.slug + '.json', content: JSON.stringify(source, null, 2) + '\n' });
      out.push({ path: 'posts.html', content: postsHtml });
      out.push({ path: 'index.html', content: indexHtml });
      out.push({ path: 'sitemap.xml', content: sitemap });
      out.push({ path: 'rss.xml', content: rss });
      Object.keys(catHtml).forEach(function (k) { if (catHtml[k]) out.push({ path: 'category/' + k + '.html', content: catHtml[k] }); });

      log('커밋 만드는 중 (파일 ' + out.length + '개)');
      await commitFiles(out, (isNew ? '글 게시: ' : '글 수정: ') + (s.h1.trim() || s.seoTitle.trim()));
      upload.forEach(function (u) { u.im.uploaded = true; });
      saveDraft('게시됨: ' + s.slug).then(loadDraftList).catch(function () {}); // 게시 완료 표시를 막지 않도록 기다리지 않는다
      fillForm();
      loadPublishedList();
      log('게시 완료. 1~2분 뒤 반영됩니다.', 'done');
      var li = document.createElement('li');
      li.className = 'done';
      li.innerHTML = '<a href="' + loc + '" target="_blank" rel="noopener">' + esc(loc) + '</a>';
      $('#log').appendChild(li);
    } catch (e) {
      s.published = wasPublished;
      log('실패: ' + e.message, 'err');
      if (e.status === 401 || e.status === 403) log('토큰이 만료됐거나 Contents 쓰기 권한이 없습니다.', 'err');
      if (e.status === 409 || e.status === 422) log('저장소가 비어 있거나 동시에 다른 변경이 있었습니다. 잠시 뒤 다시 시도하세요.', 'err');
    } finally {
      btn.disabled = false;
    }
  }

  // ---------- 불러오기 ----------
  async function loadDraftList() {
    var sel = $('#draft-select');
    var keys = await loadDraftKeys().catch(function () { return []; });
    sel.innerHTML = '<option value="">임시저장 불러오기</option>' + keys.map(function (k) { return '<option>' + esc(k) + '</option>'; }).join('');
  }
  async function loadPublishedList() {
    var sel = $('#published-select');
    try {
      var list = await gh(rp('/contents/_source?ref=' + branch));
      sel.innerHTML = '<option value="">게시한 글 수정하기</option>' + list.filter(function (f) { return /\.json$/.test(f.name); })
        .map(function (f) { return '<option>' + esc(f.name.replace(/\.json$/, '')) + '</option>'; }).join('');
    } catch (e) {
      sel.innerHTML = '<option value="">게시한 글 없음</option>';
    }
  }
  function applyLoaded(data) {
    state = Object.assign(newState(), data);
    state.images = (data.images || []).map(function (im) {
      var url = im.blob ? URL.createObjectURL(im.blob) : 'https://raw.githubusercontent.com/' + CFG.owner + '/' + CFG.repo + '/' + branch + '/' + im.path;
      return Object.assign({}, im, { url: url, uploaded: !im.blob && !!im.path });
    });
    fillForm();
  }

  // 글 페이지의 "수정" 버튼으로 들어온 경우: /admin/?edit=슬러그
  var editSlug = new URLSearchParams(location.search).get('edit');
  if (editSlug && !/^[a-z0-9-]+$/.test(editSlug)) editSlug = null;

  async function loadForEdit(slug) {
    try {
      var txt = await getFile('_source/' + slug + '.json');
      if (!txt) {
        fillForm();
        alert('"' + slug + '" 글은 관리자 화면 밖에서 만든 글이라 여기서 불러올 수 없습니다. Claude Code로 수정하세요.');
        return;
      }
      applyLoaded(JSON.parse(txt));
    } catch (err) { fillForm(); alert('불러오기 실패: ' + err.message); }
  }

  // 글 페이지에서 수정 버튼을 보여 줄지 정하는 표시. 토큰이 아니라 표시값만 저장한다
  function setAdminFlag(on) {
    try { if (on) localStorage.setItem('ref_admin', '1'); else localStorage.removeItem('ref_admin'); } catch (e) {}
  }

  // ---------- 로그인 ----------
  async function connect() {
    var input = $('#token').value.trim();
    if (input) token = input;
    if (!token) { $('#login-msg').textContent = '토큰을 입력하세요.'; return; }
    $('#login-msg').textContent = '확인 중...';
    try {
      var repo = await gh(rp(''));
      if (repo.permissions && !repo.permissions.push) throw new Error('이 토큰은 저장소에 쓰기 권한이 없습니다.');
      branch = repo.default_branch || 'main';
      if (input) {
        sessionStorage.setItem('ref_token', token);
        if ($('#remember').checked) localStorage.setItem('ref_token', token);
      }
      $('#login-view').hidden = true;
      $('#editor-view').hidden = false;
      $('#who').hidden = false;
      $('#repo-label').textContent = CFG.owner + '/' + CFG.repo;
      setAdminFlag(true);
      var auto = await getDraft('자동저장').catch(function () { return null; });
      var hasAuto = auto && (auto.body || auto.seoTitle);
      if (editSlug) {
        history.replaceState(null, '', location.pathname);
        if (hasAuto && !confirm('자동저장된 작성 중인 글이 있습니다 (' + (auto.savedAt || '') + ').\n이 내용을 버리고 "' + editSlug + '" 글을 불러올까요?\n(취소하면 자동저장된 글을 엽니다)')) applyLoaded(auto);
        else await loadForEdit(editSlug);
        editSlug = null;
      } else if (hasAuto && confirm('자동저장된 글이 있습니다 (' + (auto.savedAt || '') + '). 불러올까요?')) applyLoaded(auto);
      else fillForm();
      loadDraftList();
      loadPublishedList();
    } catch (e) {
      $('#login-msg').textContent = e.status === 401 ? '토큰이 올바르지 않거나 만료됐습니다.' : (e.status === 404 ? '저장소 ' + CFG.repo + '를 찾지 못했습니다. 토큰의 저장소 접근 범위를 확인하세요.' : e.message);
      if (!input) { token = ''; }
      if (e.status === 401) setAdminFlag(false);
    }
  }

  // ---------- 이벤트 ----------
  $('#connect').addEventListener('click', connect);
  $('#token').addEventListener('keydown', function (e) { if (e.key === 'Enter') connect(); });
  $('#logout').addEventListener('click', function () {
    sessionStorage.removeItem('ref_token'); localStorage.removeItem('ref_token'); setAdminFlag(false); location.reload();
  });
  document.addEventListener('input', onField);
  document.addEventListener('change', function (e) {
    if (e.target.name === 'vis') { state.indexable = e.target.value === 'index'; scheduleAutosave(); }
    if (e.target.dataset.field) onField(e);
  });
  $$('[data-insert]').forEach(function (b) { b.addEventListener('click', function () { SNIPPETS[b.dataset.insert](); }); });
  $('#img-input').addEventListener('change', function (e) {
    var picked = Array.prototype.slice.call(e.target.files); // 입력칸을 비우기 전에 복사해 둔다
    e.target.value = '';
    addFiles(picked);
  });
  var drop = $('#drop');
  ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { addFiles(Array.prototype.slice.call(e.dataTransfer.files)); });
  $('#add-faq').addEventListener('click', function () { state.faqs.push({ q: '', a: '' }); renderFaqs(); });
  $('#new-post').addEventListener('click', function () {
    if (!confirm('지금 쓰던 내용을 비우고 새 글을 시작할까요? (자동저장 내용도 새 글로 바뀝니다)')) return;
    state = newState(); fillForm(); $('#log').innerHTML = '';
  });
  $('#save-draft').addEventListener('click', function () {
    var key = (state.seoTitle.trim() || '제목없음') + ' (' + new Date().toLocaleString('ko-KR') + ')';
    saveDraft(key).then(function () { alert('임시저장했습니다: ' + key); loadDraftList(); }).catch(function (e) { alert('임시저장 실패: ' + e.message); });
  });
  $('#draft-select').addEventListener('change', function (e) {
    var k = e.target.value; e.target.value = '';
    if (!k || !confirm('"' + k + '"을(를) 불러올까요? 지금 쓰던 내용은 사라집니다.')) return;
    getDraft(k).then(function (d) { if (d) applyLoaded(d); });
  });
  $('#published-select').addEventListener('change', async function (e) {
    var slug = e.target.value; e.target.value = '';
    if (!slug || !confirm('"' + slug + '" 글을 불러와 수정할까요? 지금 쓰던 내용은 사라집니다.')) return;
    try {
      var txt = await getFile('_source/' + slug + '.json');
      applyLoaded(JSON.parse(txt));
    } catch (err) { alert('불러오기 실패: ' + err.message); }
  });
  $('#preview-btn').addEventListener('click', function () {
    $('#preview-body').innerHTML = articleHtml(state, 'preview', []);
    $('#preview').hidden = false;
    // 목차 생성 (사이트 main.js와 같은 규칙)
    var toc = $('#preview-body [data-toc]');
    var heads = $$('#preview-body .prose h2[id]');
    if (toc && heads.length >= 3) {
      var ol = document.createElement('ol');
      heads.forEach(function (h) { var li = document.createElement('li'); li.textContent = h.textContent; ol.appendChild(li); });
      toc.appendChild(ol); toc.hidden = false;
    }
  });
  $('#close-preview').addEventListener('click', function () { $('#preview').hidden = true; });
  $('#publish').addEventListener('click', publish);
  window.addEventListener('beforeunload', function () { saveDraft('자동저장').catch(function () {}); });

  if (token) { $('#token').value = ''; connect(); }
})();
