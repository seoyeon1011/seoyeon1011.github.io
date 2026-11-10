// 사이트 전체 설정. 분류(카테고리), 메뉴, SEO 기준을 바꿀 때는 이 파일 한 곳만 고친다.
// SEO 기준(RULE)을 바꾸면 .claude/skills/레프글작성/SKILL.md 의 기준표도 같이 고친다.
import type { CatSlug } from './types';

export const SITE = {
  url: 'https://marketing-ref.vercel.app',
  name: 'Ref(레프)',
  author: '레프(Ref)',
  title: 'Ref(레프) | 콘텐츠·SEO 마케팅 지식창고',
  tagline: '콘텐츠·SEO 마케팅 지식창고',
  description: '콘텐츠·SEO 마케팅, Claude Code 업무 자동화, ADsP 같은 자격증 공부 기록을 정리하는 레프의 마케팅 지식창고입니다.',
  shortDescription: '콘텐츠·SEO 마케팅, Claude Code 자동화, 자격증 공부 기록을 정리하는 마케팅 지식창고',
  ogImage: '/assets/img/og-default.png',
  googleVerification: 'gdfrXvGJt6Y3JZp6kloC7pqOFYaGpDImhtGKEk3gXN4',
  naverVerification: 'd14ead4303422fa8bd80655b018837d770826c6f',
  // 관리자 화면이 글을 커밋하는 저장소
  owner: 'seoyeon1011',
  repo: 'seoyeon1011.github.io',
  // 소개 페이지를 마지막으로 고친 날 (사이트맵 lastmod)
  aboutUpdated: '2026-11-05',
  launched: '2026-11-05',
} as const;

/** 페이지마다 openGraph를 지정하면 레이아웃 값이 통째로 바뀌므로 공통값을 각 페이지에 펼쳐 넣는다 */
export const OG_BASE: { siteName: string; locale: string; images: string[] } = { siteName: SITE.name, locale: 'ko_KR', images: [SITE.ogImage] };

export const RULE = { titleMin: 10, titleMax: 15, descMin: 120, descMax: 200, bodyMin: 2000, imgMin: 5, h2Min: 4, kwMin: 3, recentMax: 6 } as const;

export interface CatInfo {
  slug: CatSlug;
  /** 태그, 메뉴, 필터 버튼에 쓰는 짧은 이름 */
  label: string;
  group: 'knowledge' | 'portfolio' | 'diary';
  /** 분류 페이지 제목(h1)이자 홈 카드 제목 */
  title: string;
  metaDescription: string;
  ogDescription: string;
  /** 분류 페이지 머리말. 링크가 있어 HTML로 둔다 */
  intro: string;
  /** 홈 주제별 보기 카드 설명 */
  homeDesc: string;
  empty: string;
}

export const CATS: Record<CatSlug, CatInfo> = {
  'seo-content': {
    slug: 'seo-content',
    label: '콘텐츠·SEO',
    group: 'knowledge',
    title: '콘텐츠·SEO 마케팅',
    metaDescription: '검색 의도 분석, 키워드 선정, 상위 노출 글 구조, 메타 설명 작성까지 콘텐츠·SEO 마케팅을 공부하고 실습한 기록을 모았습니다.',
    ogDescription: '콘텐츠·SEO 마케팅 공부와 실습 기록',
    intro: '검색하는 사람이 원하는 답을 가장 잘 주는 글이 상위에 오릅니다. 검색 의도 분석, 키워드 선정, 글 구조 설계, 메타 설명 작성처럼 검색 유입을 만드는 콘텐츠 작성법을 공부하고 직접 실습한 내용을 정리합니다.',
    homeDesc: '검색 의도 분석, 키워드 선정, 상위 노출되는 글의 구조처럼 검색 유입을 만드는 콘텐츠 작성 지식',
    empty: '아직 올린 글이 없습니다.',
  },
  marketing: {
    slug: 'marketing',
    label: '마케팅 전략',
    group: 'knowledge',
    title: '마케팅 전략',
    metaDescription: '마케팅 문제 정의, 3C, SWOT, STP, 4P, IMC처럼 브랜드 전략을 세울 때 쓰는 마케팅 개념과 분석 틀을 쉬운 예시와 함께 정리한 지식 모음입니다.',
    ogDescription: '브랜드 전략에 쓰는 마케팅 개념과 분석 틀 모음',
    intro: '좋은 해결책은 정확한 문제 정의에서 나옵니다. 고객의 고민을 진짜 문제로 바꾸는 방법, 3C·SWOT·STP·4P 같은 분석 틀, 여러 채널에서 하나의 메시지를 전하는 IMC처럼 브랜드 전략을 세울 때 필요한 마케팅 지식을 정리합니다. 이 지식을 실제로 적용한 작업은 <a href="/category/project">프로젝트</a>에서 볼 수 있습니다.',
    homeDesc: '문제 정의, 3C·SWOT·STP·4P, IMC처럼 브랜드 전략을 세울 때 쓰는 마케팅 개념과 분석 틀',
    empty: '아직 올린 글이 없습니다.',
  },
  project: {
    slug: 'project',
    label: '프로젝트',
    group: 'portfolio',
    title: '기업 연계 프로젝트',
    metaDescription: '실제 기업의 고민을 마케팅 문제로 정의하고 3C, SWOT, STP, 4P 분석으로 해결책을 설계한 기업 연계 프로젝트 작업 기록을 모았습니다.',
    ogDescription: '기업 연계 마케팅 프로젝트 작업 기록',
    intro: '실제 기업의 고민을 듣고 마케팅 문제로 정의한 뒤, 분석과 해결책 설계까지 직접 진행한 작업 기록입니다. 프로젝트에 쓴 개념과 분석 틀은 <a href="/category/marketing">마케팅 전략</a>에 정리해 두었습니다.',
    homeDesc: '실제 기업의 고민을 마케팅 문제로 정의하고 분석과 해결책을 설계한 작업 기록',
    empty: '아직 올린 프로젝트 기록이 없습니다.',
  },
  automation: {
    slug: 'automation',
    label: '자동화 실습',
    group: 'portfolio',
    title: 'Claude Code 마케팅 자동화',
    metaDescription: '비개발자 마케터가 Claude Code 스킬로 블로그 작성, SNS 요약, 성과 분석, 주간 보고를 자동화한 실습 기록을 모았습니다.',
    ogDescription: '비개발자 마케터의 Claude Code 업무 자동화 기록',
    intro: '코딩을 몰라도 업무 절차를 글로 정리하면 반복 업무를 자동화할 수 있습니다. 콘텐츠 제작, 성과 분석, 주간 보고, 사내 문의 응대처럼 마케팅팀 업무를 Claude Code 스킬로 만든 과정과 시행착오를 기록합니다.',
    homeDesc: '비개발자가 Claude Code 스킬로 콘텐츠 제작, 성과 분석, 보고 업무를 자동화한 실습 기록',
    empty: '아직 올린 실습 기록이 없습니다.',
  },
  certificate: {
    slug: 'certificate',
    label: '자격증',
    group: 'portfolio',
    title: '자격증·공부 기록',
    metaDescription: 'ADsP 독학 후기처럼 마케터에게 도움이 되는 자격증 준비 과정과 공부법, 시험 후기를 정리했습니다.',
    ogDescription: '마케터의 자격증 준비 과정과 시험 후기',
    intro: '데이터를 읽고 근거로 말하는 마케터가 되기 위해 공부한 자격증과 그 과정을 기록합니다. 공부 기간, 교재, 과목별 공부법, 시험 당일 후기를 실제 경험 그대로 정리합니다.',
    homeDesc: 'ADsP 독학 후기처럼 마케터에게 필요한 자격증과 공부 과정 정리',
    empty: '아직 올린 자격증 기록이 없습니다.',
  },
  diary: {
    slug: 'diary',
    label: '일기',
    group: 'diary',
    title: '일기',
    metaDescription: '공부하고 일하며 느낀 것들을 편하게 남기는 레프의 일기입니다.',
    ogDescription: '공부하고 일하며 느낀 것들을 남기는 기록',
    intro: '공부하고 일하며 느낀 것들을 편하게 남기는 기록입니다.',
    homeDesc: '공부하고 일하며 느낀 것들을 편하게 남기는 기록',
    empty: '아직 쓴 일기가 없습니다.',
  },
};

/** 필터 버튼, 관리자 분류 선택, 사이트맵에 쓰는 순서 */
export const CAT_ORDER: CatSlug[] = ['seo-content', 'marketing', 'project', 'automation', 'certificate', 'diary'];

export const CAT_GROUPS: { key: CatInfo['group']; label: string }[] = [
  { key: 'knowledge', label: '마케팅 지식' },
  { key: 'portfolio', label: '포트폴리오' },
  { key: 'diary', label: '일기' },
];

export function isCat(s: string): s is CatSlug {
  return Object.prototype.hasOwnProperty.call(CATS, s);
}

// ---------- 주소 ----------
// Vercel은 .html 없는 주소로 페이지를 연다. 예전 .html 주소는 vercel.json 이 새 주소로 옮긴다
export const postPath = (slug: string) => `/posts/${slug}`;
export const catPath = (slug: CatSlug) => `/category/${slug}`;
export const abs = (p: string) => SITE.url + (p.startsWith('/') ? p : '/' + p);

// ---------- 날짜 ----------
const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
export function today(): string {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
export const dot = (d: string) => (d || '').replace(/-/g, '.');
export function rfc822(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const p = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return days[d.getUTCDay()] + ', ' + pad(p[2]) + ' ' + mons[p[1] - 1] + ' ' + p[0] + ' 09:00:00 +0900';
}
