export type CatSlug = 'seo-content' | 'marketing' | 'project' | 'automation' | 'certificate' | 'diary';

export interface PostImage {
  no: number;
  /** 사이트 기준 경로. 예: assets/img/posts/slug-1.webp (저장소에서는 public/ 아래에 있다) */
  path: string;
  type?: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * content/posts/슬러그.json 형식.
 * 관리자 화면이 쓰는 필드(body가 마크다운)와, 관리자 화면 밖에서 만든 글에만 쓰는 선택 필드(bodyFile 등)로 나뉜다.
 */
export interface PostSource {
  slug: string;
  category: CatSlug;
  keyword: string;
  seoTitle: string;
  h1: string;
  desc: string;
  /** 핵심 요약. 한 줄에 하나 */
  summary: string;
  /** 관리자 화면 글: 간단한 마크다운 본문 */
  body?: string;
  faqs: FaqItem[];
  indexable: boolean;
  pubDate: string;
  modDate?: string;
  images: PostImage[];
  nextImg?: number;
  published?: boolean;

  // ---- 관리자 화면 밖에서 만든 글 전용 (선택) ----
  /** 본문 HTML 파일 이름. content/posts 안에 있다. 이 값이 있으면 관리자 화면에서 불러올 수 없다 */
  bodyFile?: string;
  /** 카드에 보일 짧은 소개. 없으면 디스크립션을 90자로 줄여 쓴다 */
  excerpt?: string;
  /** 전체 글 검색에 쓰는 키워드. 없으면 keyword */
  searchKeywords?: string;
  /** 구조화 데이터 keywords. 없으면 keyword */
  ldKeywords?: string;
  /** 이동경로 마지막 칸. 없으면 seoTitle */
  breadcrumbTitle?: string;
  /** 읽는 시간(분). 없으면 본문 글자수로 계산 */
  readMinutes?: number;
  /** 함께 읽으면 좋은 글 슬러그. 없으면 같은 분류 우선 2개 자동 */
  related?: string[];
  /** false면 FAQ는 화면에만 보이고 FAQPage 구조화 데이터는 넣지 않는다 (답변 작성 전) */
  faqSchema?: boolean;
}
