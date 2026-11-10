// 관리자 화면의 SEO 실시간 점검. 기준값은 lib/site.ts 의 RULE.
import { RULE, SITE } from './site';
import { noSpaceLen, type RenderResult } from './markdown';

export interface CheckItem {
  ok: boolean;
  label: string;
  detail: string;
}

export interface CheckInput {
  keyword: string;
  seoTitle: string;
  desc: string;
  body: string;
  slug: string;
  images: { no: number; alt: string }[];
}

export interface CheckResult {
  list: CheckItem[];
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
  const bodyLen = noSpaceLen(r.text);
  const usedImgs = s.images.filter((im) => r.used.indexOf(im.no) !== -1);
  const unused = s.images.length - usedImgs.length;
  const noAlt = usedImgs.filter((im) => !im.alt.trim()).length;
  const kwCount = kw ? r.text.toLowerCase().split(kw).length - 1 : 0;
  const internal = (s.body.match(/\]\(([^)\s]+)\)/g) || []).filter((m) => !/\]\(https?:/.test(m) || m.indexOf(SITE.url) !== -1).length;
  const kwPos = kw ? tl.indexOf(kw) : -1;

  const list: CheckItem[] = [
    { ok: t.length >= RULE.titleMin && t.length <= RULE.titleMax, label: `SEO 타이틀 ${RULE.titleMin}~${RULE.titleMax}자`, detail: `현재 ${t.length}자 (공백 포함)` },
    { ok: d.length >= RULE.descMin && d.length <= RULE.descMax, label: `메타 디스크립션 ${RULE.descMin}~${RULE.descMax}자`, detail: `현재 ${d.length}자 (공백 포함)` },
    { ok: bodyLen >= RULE.bodyMin, label: `본문 공백 제외 ${RULE.bodyMin}자 이상`, detail: `현재 ${bodyLen}자` },
    { ok: usedImgs.length >= RULE.imgMin, label: `본문 이미지 ${RULE.imgMin}장 이상`, detail: `본문에 넣은 이미지 ${usedImgs.length}장` + (unused ? `, 넣지 않은 이미지 ${unused}장` : '') },
    { ok: usedImgs.length > 0 && noAlt === 0, label: '모든 이미지 대체 텍스트(alt)', detail: noAlt ? `${noAlt}장 비어 있음 (게시 불가)` : usedImgs.length ? '모두 작성됨' : '이미지 없음' },
    { ok: r.h2 >= RULE.h2Min, label: `소제목(##) ${RULE.h2Min}개 이상`, detail: `현재 ${r.h2}개` },
    { ok: !!kw && kwPos === 0, label: '타이틀 맨 앞에 키워드', detail: kw ? (kwPos === -1 ? '타이틀에 키워드 없음' : kwPos === 0 ? '맨 앞에 있음' : '포함됐지만 맨 앞은 아님') : '타깃 키워드를 입력하세요' },
    { ok: !!kw && d.toLowerCase().indexOf(kw) !== -1, label: '디스크립션에 키워드', detail: '' },
    { ok: !!kw && r.firstPara.toLowerCase().indexOf(kw) !== -1, label: '첫 문단에 키워드', detail: '' },
    { ok: kwCount >= RULE.kwMin, label: `본문 키워드 ${RULE.kwMin}회 이상`, detail: `현재 ${kwCount}회` },
    { ok: internal >= 1, label: '내부 링크 1개 이상', detail: `현재 ${internal}개` },
    { ok: SLUG_RE.test(s.slug), label: '주소(슬러그) 형식', detail: s.slug ? '' : '비어 있음 (게시 불가)' },
  ];
  return { list, usedCount: usedImgs.length, unusedCount: unused, noAlt, bodyLen, titleLen: t.length, descLen: d.length };
}
