// 관리자 화면의 SEO 실시간 점검. 기준값은 lib/site.ts 의 RULE.
// 점검 순서는 SEO 양식 순서를 따른다:
// 타이틀 > 메타 디스크립션 > H1 > H2/H3 목차 > 본문 길이 > 이미지 > 주소(슬러그)·링크
import { RULE, SITE } from './site';
import { noSpaceLen, type RenderResult } from './markdown';

export type CheckGroup = '타이틀' | '메타 디스크립션' | 'H1' | 'H2/H3 목차' | '본문' | '이미지' | '주소·링크';
export const CHECK_GROUPS: CheckGroup[] = ['타이틀', '메타 디스크립션', 'H1', 'H2/H3 목차', '본문', '이미지', '주소·링크'];

export type CheckKey =
  | 'titleLen' | 'titleKw'
  | 'descLen' | 'descKw'
  | 'h1One' | 'h1Kw'
  | 'h2Count' | 'h2Kw' | 'h3Nest'
  | 'bodyLen' | 'firstParaKw' | 'kwCount'
  | 'imgCount' | 'imgAlt'
  | 'slug' | 'internal';

export interface CheckItem {
  key: CheckKey;
  group: CheckGroup;
  ok: boolean;
  label: string;
  detail: string;
}

export interface CheckInput {
  keyword: string;
  seoTitle: string;
  h1: string;
  desc: string;
  body: string;
  slug: string;
  images: { no: number; alt: string }[];
}

export interface CheckResult {
  list: CheckItem[];
  /** 항목 하나의 통과 여부 */
  ok: (key: CheckKey) => boolean;
  usedCount: number;
  unusedCount: number;
  noAlt: number;
  bodyLen: number;
  titleLen: number;
  descLen: number;
}

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function runChecks(s: CheckInput, r: RenderResult): CheckResult {
  const kw = s.keyword.trim().toLowerCase();
  const t = s.seoTitle.trim();
  const d = s.desc.trim();
  const tl = t.toLowerCase();
  // 글 제목(H1)을 비우면 SEO 타이틀이 H1으로 들어간다 (app/posts/[slug] 와 미리보기가 같은 규칙)
  const h1 = s.h1.trim() || t;
  const bodyLen = noSpaceLen(r.text);
  const usedImgs = s.images.filter((im) => r.used.indexOf(im.no) !== -1);
  const unused = s.images.length - usedImgs.length;
  const noAlt = usedImgs.filter((im) => !im.alt.trim()).length;
  const kwCount = kw ? r.text.toLowerCase().split(kw).length - 1 : 0;
  const internal = (s.body.match(/\]\(([^)\s]+)\)/g) || []).filter((m) => !/\]\(https?:/.test(m) || m.indexOf(SITE.url) !== -1).length;
  const kwPos = kw ? tl.indexOf(kw) : -1;
  // 본문에 "# 제목" 줄이 있으면 페이지 H1이 2개가 된다
  const bodyH1 = (s.body.replace(/\r/g, '').match(/^#\s+\S/gm) || []).length;
  const h2Kw = kw ? r.h2Texts.filter((x) => x.toLowerCase().indexOf(kw) !== -1).length : 0;
  const needKw = '타깃 키워드를 입력하세요';

  const list: CheckItem[] = [
    { key: 'titleLen', group: '타이틀', ok: t.length >= RULE.titleMin && t.length <= RULE.titleMax, label: `SEO 타이틀 ${RULE.titleMin}~${RULE.titleMax}자`, detail: `현재 ${t.length}자 (공백 포함)` },
    { key: 'titleKw', group: '타이틀', ok: !!kw && kwPos === 0, label: '타이틀 맨 앞에 키워드', detail: kw ? (kwPos === -1 ? '타이틀에 키워드 없음' : kwPos === 0 ? '맨 앞에 있음' : '포함됐지만 맨 앞은 아님') : needKw },

    { key: 'descLen', group: '메타 디스크립션', ok: d.length >= RULE.descMin && d.length <= RULE.descMax, label: `메타 디스크립션 ${RULE.descMin}~${RULE.descMax}자`, detail: `현재 ${d.length}자 (공백 포함)` },
    { key: 'descKw', group: '메타 디스크립션', ok: !!kw && d.toLowerCase().indexOf(kw) !== -1, label: '디스크립션에 키워드', detail: kw ? '' : needKw },

    { key: 'h1One', group: 'H1', ok: !!h1 && bodyH1 === 0, label: 'H1 1개', detail: !h1 ? '글 제목과 SEO 타이틀이 모두 비어 있음' : bodyH1 ? `본문에 "# 제목" 줄이 ${bodyH1}개 있음. 소제목은 ## 로 쓰세요` : (s.h1.trim() ? '글 제목이 H1' : 'SEO 타이틀이 H1으로 들어감') },
    { key: 'h1Kw', group: 'H1', ok: !!kw && h1.toLowerCase().indexOf(kw) !== -1, label: 'H1에 핵심 키워드', detail: kw ? (h1.toLowerCase().indexOf(kw) !== -1 ? '포함됨' : 'H1(글 제목)에 키워드 없음') : needKw },

    { key: 'h2Count', group: 'H2/H3 목차', ok: r.h2 >= RULE.h2Min, label: `소제목(H2) ${RULE.h2Min}개 이상`, detail: `현재 H2 ${r.h2}개, H3 ${r.h3}개` },
    { key: 'h2Kw', group: 'H2/H3 목차', ok: h2Kw >= 1, label: 'H2 중 1개 이상에 키워드', detail: kw ? `키워드가 들어간 H2 ${h2Kw}개` : needKw },
    { key: 'h3Nest', group: 'H2/H3 목차', ok: r.h3Orphan === 0, label: 'H3는 H2 아래에만', detail: r.h3Orphan ? `첫 H2보다 앞에 H3 ${r.h3Orphan}개` : '' },

    { key: 'bodyLen', group: '본문', ok: bodyLen >= RULE.bodyMin, label: `본문 공백 제외 ${RULE.bodyMin}자 이상`, detail: `현재 ${bodyLen}자` },
    { key: 'firstParaKw', group: '본문', ok: !!kw && r.firstPara.toLowerCase().indexOf(kw) !== -1, label: '첫 문단에 키워드', detail: kw ? '' : needKw },
    { key: 'kwCount', group: '본문', ok: kwCount >= RULE.kwMin, label: `본문 키워드 ${RULE.kwMin}회 이상`, detail: `현재 ${kwCount}회` },

    { key: 'imgCount', group: '이미지', ok: usedImgs.length >= RULE.imgMin, label: `본문 이미지 ${RULE.imgMin}장 이상`, detail: `본문에 넣은 이미지 ${usedImgs.length}장` + (unused ? `, 넣지 않은 이미지 ${unused}장` : '') },
    { key: 'imgAlt', group: '이미지', ok: usedImgs.length > 0 && noAlt === 0, label: '모든 이미지 대체 텍스트(alt)', detail: noAlt ? `${noAlt}장 비어 있음 (게시 불가)` : usedImgs.length ? '모두 작성됨' : '이미지 없음' },

    { key: 'slug', group: '주소·링크', ok: SLUG_RE.test(s.slug), label: '주소(슬러그) 영문 소문자·숫자·하이픈', detail: s.slug ? (SLUG_RE.test(s.slug) ? '/posts/' + s.slug : '앞뒤 하이픈이나 빈 칸 없이 입력하세요') : '비어 있음 (게시 불가)' },
    { key: 'internal', group: '주소·링크', ok: internal >= 1, label: '내부 링크 1개 이상', detail: `현재 ${internal}개` },
  ];
  const byKey = new Map(list.map((x) => [x.key, x.ok]));
  return { list, ok: (k) => !!byKey.get(k), usedCount: usedImgs.length, unusedCount: unused, noAlt, bodyLen, titleLen: t.length, descLen: d.length };
}
