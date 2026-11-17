import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import JsonLd from '@/components/JsonLd';
import ThemeToggle from '@/components/ThemeToggle';
import Lightbox from './Lightbox';
import { OG_BASE, SITE, abs } from '@/lib/site';
import './portfolio.css';

// 웹 포트폴리오 (비공개 주소 /portfolio-seoyeon). 공개 주소 /about 은 열람 요청 안내 페이지다. 내용 원본은 Claude Docs "심서연 콘텐츠 마케터 포트폴리오 (Master)"의 "웹 포트폴리오 구조" 탭.
// 면접관이 3초(히어로) / 30초(케이스 카드 상단) / 3분(자세히 보기) 순서로 보도록 쌓는다.
// 블로그 메뉴(Shell)는 쓰지 않고 포트폴리오 전용 내비만 둔다. 블로그 링크는 맨 아래 하나.
//
// 회사별 버전: /portfolio-seoyeon?for=db, /portfolio-seoyeon?for=univ
//   아래 VARIANT_SCRIPT 가 주소의 for 값을 <html data-pf="..."> 로 옮기고, 순서와 문구 전환은 portfolio.css 가 한다.
//   data-hide="db univ" : 그 버전에서 숨김 / data-show="db" : 그 버전에서만 보임
//
// 사진은 <Fig> (public/assets/img/portfolio/). 누르면 Lightbox.tsx 가 확대 팝업을 띄우고, href 를 주면 외부 링크로 연다.
// 아직 사진이 없는 자리는 <Ph> 로 표시한다.
// 연락처는 사용자가 공개를 요청한 것만 쓴다 (CLAUDE.md). 구조안에 따라 전화번호는 공개 페이지에서 뺐다.

/** PDF 포트폴리오 파일 주소. 파일을 public/ 에 넣고 경로를 적으면 히어로와 연락처에 다운로드 버튼이 생긴다 (예: '/portfolio-simseoyeon.pdf') */
const PDF_URL = '';

const title = '포트폴리오 | 콘텐츠 마케터 심서연';
const description = '공유되는 콘텐츠로 구매까지 연결하는 콘텐츠 마케터 심서연의 포트폴리오입니다. 광고비 0원 굿즈 매출 1,500만 원, 신규 등록 45% SNS 유입, 강사 계정 팔로워 84% 성장 사례를 담았습니다.';

// 링크를 받은 사람만 보는 비공개 주소. 검색 제외, 사이트맵·사이트 메뉴에 넣지 않는다.
// 주소를 바꾸려면 이 폴더 이름과 PF_PATH 를 함께 고친다.
const PF_PATH = '/portfolio-seoyeon';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  alternates: { canonical: abs(PF_PATH) },
  openGraph: { ...OG_BASE, type: 'profile', title, description: '콘텐츠 마케터 심서연 포트폴리오', url: abs(PF_PATH) },
};

const VARIANT_SCRIPT = "(function(){try{var v=new URLSearchParams(location.search).get('for');if(v==='db'||v==='univ')document.documentElement.dataset.pf=v;}catch(e){}})();";

/* ---------- 부품 ---------- */

function Ph({ label, ratio = '16 / 9' }: { label: string; ratio?: string }) {
  return (
    <div className="pf-ph" style={{ aspectRatio: ratio } as CSSProperties} role="img" aria-label={`이미지 자리: ${label}`}>
      <span className="pf-ph-tag">IMAGE</span>
      <span className="pf-ph-label">{label}</span>
    </div>
  );
}

const IMG = '/assets/img/portfolio/';

/** 사진. 누르면 Lightbox 가 크게 띄운다. href 를 주면 확대 대신 그 주소(예: 인스타그램 릴스)로 이동한다 */
function Fig({ src, alt, ratio = '16 / 9', href, linkLabel }: { src: string; alt: string; ratio?: string; href?: string; linkLabel?: string }) {
  const image = <img src={IMG + src} alt={alt} loading="lazy" decoding="async" />;
  return (
    <figure className="pf-figure" style={{ aspectRatio: ratio } as CSSProperties}>
      {href ? (
        <a className="pf-fig-link" href={href} target="_blank" rel="noopener" aria-label={`${linkLabel ?? '링크 열기'}: ${alt}`}>
          {image}
          <span className="pf-fig-badge">{linkLabel ?? '보기'} ↗</span>
        </a>
      ) : (
        <button type="button" className="pf-zoom" data-zoom aria-label={`크게 보기: ${alt}`}>
          {image}
        </button>
      )}
    </figure>
  );
}

function Detail({ k, children }: { k: string; children: ReactNode }) {
  return <div className="pf-detail-row"><dt>{k}</dt><dd>{children}</dd></div>;
}

interface CaseProps {
  id: string;
  no: string;
  meta: string;
  title: string;
  summary: string;
  tags: string[];
  role: string;
  contrib: string;
  image: { src: string; alt: string };
  children: ReactNode;
}

function CaseCard({ id, no, meta, title, summary, tags, role, contrib, image, children }: CaseProps) {
  return (
    <article className="pf-card" id={id} aria-labelledby={`${id}-title`}>
      <div className="pf-card-meta">
        <p><b>CASE {no}</b> · {meta}</p>
        <p className="pf-contrib">기여도 <b>{contrib}</b></p>
      </div>
      <div className="pf-card-top">
        <Fig src={image.src} alt={image.alt} />
        <div className="pf-card-text">
          <h3 id={`${id}-title`}>{title}</h3>
          <p className="pf-card-sum">{summary}</p>
          <ul className="pf-tags">{tags.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="pf-card-role"><span>내 역할</span>{role}</p>
        </div>
      </div>
      <details className="pf-details">
        <summary>자세히 보기</summary>
        <div className="pf-details-body">{children}</div>
      </details>
    </article>
  );
}

/* ---------- 페이지 ---------- */

export default function AboutPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: VARIANT_SCRIPT }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: '심서연',
          alternateName: SITE.author,
          url: abs(PF_PATH),
          jobTitle: '콘텐츠 마케터',
          sameAs: ['https://github.com/seoyeon1011', 'https://www.instagram.com/ref.yeon/'],
          knowsAbout: ['콘텐츠 마케팅', 'SNS 마케팅', '숏폼 콘텐츠', 'SEO', '마케팅 자동화'],
        },
      }} />
      <a className="skip-link" href="#main">본문 바로가기</a>

      {/* 1. 포트폴리오 전용 내비 */}
      <header className="pf-nav">
        <div className="wrap">
          <a className="pf-nav-name" href="#top">심서연<span>Portfolio</span></a>
          <nav aria-label="포트폴리오 메뉴">
            <ul>
              <li><a href="#work">Work</a></li>
              <li><a href="#idea-lab">Idea Lab</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="pf">

        {/* 2. Hero */}
        <section className="pf-hero pf-dark" id="top" aria-labelledby="pf-hero-title">
          <div className="wrap">
            <p className="pf-hero-kicker">CONTENT MARKETER PORTFOLIO</p>
            <h1 id="pf-hero-title" className="pf-hero-title">
              <span className="pf-hero-word">SPARK:CLING</span>
              <span className="pf-hero-mean"><b>SPARK</b> 번뜩이는 아이디어로 시작하고, <b>CLING</b> 성과가 날 때까지 끝까지 붙잡습니다.</span>
              <span className="pf-hero-sub" data-hide="db univ">공유되는 콘텐츠로 구매까지 연결하는 마케터, 심서연입니다.</span>
              <span className="pf-hero-sub" data-show="db">어려운 정보를 체감 언어로 바꿔,<br />행동까지 연결하는 마케터, 심서연입니다.</span>
              <span className="pf-hero-sub" data-show="univ">대학생만 아는 언어로,<br />온라인과 현장을 함께 움직이는 마케터, 심서연입니다.</span>
            </h1>

            <ul className="pf-stats" aria-label="핵심 성과">
              <li className="pf-stat-sales"><a href="#case-1"><strong>1,500<small>만 원</small></strong><span>유료 광고 0원 굿즈 매출</span></a></li>
              <li className="pf-stat-45"><a href="#case-2"><strong>45<small>%</small></strong><span>신규 등록생 SNS 유입 비중</span></a></li>
              <li className="pf-stat-84" data-hide="db univ"><a href="#case-2"><strong>84<small>%↑</small></strong><span>강사 계정 팔로워 성장률</span></a></li>
              <li className="pf-stat-reels" data-show="db"><a href="#case-2"><strong>5.6<small>만 회</small></strong><span>최고 조회수 릴스</span></a></li>
              <li className="pf-stat-events" data-show="univ"><a href="#case-3"><strong>450<small>명</small></strong><span>직접 기획한 행사 참여</span></a></li>
            </ul>

            <div className="pf-hero-actions">
              <a className="pf-btn pf-btn-primary" href="#work">케이스 보기 ↓</a>
              {PDF_URL && <a className="pf-btn pf-btn-ghost" href={PDF_URL} download>PDF 다운로드</a>}
            </div>
          </div>
        </section>

        {/* 3. How I Work */}
        <section className="pf-section pf-light" aria-labelledby="pf-how-title">
          <div className="wrap">
            <div className="pf-head">
              <p className="pf-eyebrow">Working Principles</p>
              <h2 id="pf-how-title">세 가지 원칙으로 일합니다</h2>
            </div>
            <ol className="pf-steps">
              <li>
                <span className="pf-step-no">01</span>
                <h3>타깃 검증</h3>
                <p>결제자와 결정자를 구분해, 실제로 선택하는 사람을 조사로 확인합니다.</p>
                <span className="pf-step-links"><a href="#case-2">Case 02 →</a></span>
              </li>
              <li>
                <span className="pf-step-no">02</span>
                <h3>인사이트 기반 콘셉트</h3>
                <p>타깃만 공유하는 경험에서 콘셉트를 도출해, 자발적인 공유를 이끕니다.</p>
                <span className="pf-step-links"><a href="#case-1">Case 01 →</a></span>
              </li>
              <li>
                <span className="pf-step-no">03</span>
                <h3>데이터 기반 기민한 대응</h3>
                <p>사전에 정한 지표로 반응을 읽고, 준비해 둔 대안으로 빠르게 전환합니다.</p>
                <span className="pf-step-links"><a href="#case-1">Case 01</a> · <a href="#case-3">Case 03 →</a></span>
              </li>
            </ol>
          </div>
        </section>

        {/* 4. Case 01~03 */}
        <section className="pf-section pf-work" id="work" aria-labelledby="pf-work-title">
          <div className="wrap">
            <div className="pf-head">
              <p className="pf-eyebrow">Work</p>
              <h2 id="pf-work-title">실무 케이스</h2>
            </div>
            <div className="pf-cases">
              <CaseCard
                id="case-1" no="01" meta="대학 축제 · 2026"
                title="3,000명을 확정하게 만들다"
                summary="학내 구성원만 공유하는 IP인 수강신청을 굿즈로 기획해, 유료 광고 없이 2일 만에 3,000개 전량 판매"
                tags={['매출 1,500만 원', '판매율 100%', '유료 광고비 0원']}
                role="콘셉트 제안 · 런칭 카피 · 판매 둔화 시 전략 전환"
                contrib="90%"
                image={{ src: 'case1-main.jpg', alt: '수강신청 사이트의 신청 버튼과 확정하기 클리커를 나란히 놓은 비교 이미지' }}
              >
                <dl className="pf-detail">
                  <Detail k="문제와 인사이트">2일간 3,000개 판매가 목표였으나, 시중 클리커는 디자인 차별점이 없었습니다. 방문객의 90% 이상이 재학생이라는 점에 주목해, 학내 구성원만 공유하는 IP인 수강신청 사이트의 <strong>확정하기</strong> 버튼을 굿즈로 기획했습니다.</Detail>
                  <Detail k="실행">런칭 카피 <strong>딸-깍, 무선 수강신청의 시대는 왔다</strong>로 인스타그램과 학과 단톡방에 동시 런칭했습니다. 2일차 판매 속도가 둔화되자 현장 체험 접점과 밈 카드뉴스 연속 발행으로 전환했습니다.</Detail>
                  <Detail k="결과">판매율 100%(3,000개), 매출 1,500만 원, 유료 광고비 0원. 런칭 게시물은 팔로워 수의 136%인 1.5만 회 도달했고, 만족도 조사에서는 <strong>재판매 요청</strong>이 나왔습니다.</Detail>
                  <Detail k="배운 점">사람들은 물건보다 <strong>우리끼리 아는 이야기</strong>에 지갑을 연다는 것을 배웠습니다. 실무에서는 기획 초기에 타깃만 아는 순간과 단어를 먼저 모아 콘셉트의 재료로 쓰고, 런칭 첫날의 판매와 반응을 기준선으로 잡아 둔화되면 그날 바로 접점과 콘텐츠를 바꾸겠습니다.</Detail>
                </dl>
                <div className="pf-strip">
                  <Fig src="case1-clicker.jpg" alt="손에 든 확정하기 클리커, CSSD(CNU Smart SuGang Device) 소개 이미지" ratio="4 / 5" />
                  <Fig src="case1-launch.jpg" alt="가방에 쏙 들어가는 컴팩트 사이즈를 보여 주는 런칭 게시물" ratio="4 / 5" />
                  <Fig src="case1-meme.jpg" alt="수강신청 중독 진료 장면을 패러디한 밈 카드뉴스" ratio="4 / 5" />
                </div>
              </CaseCard>

              <CaseCard
                id="case-2" no="02" meta="학원 마케팅 · 2024.01~현재"
                title="학원을 고르는 건 학부모가 아니었다"
                summary="실제 결정권자가 학생임을 발견하고, 강사 퍼스널 브랜딩으로 추천 유입 구조를 설계"
                tags={['재원생 20%↑', '신규 45% SNS 유입', '릴스 5.6만']}
                role="타깃 조사 · 채널 전략 · 릴스 기획·제작"
                contrib="90%"
                image={{ src: 'case2-main.jpg', alt: '강사 인스타그램 계정 화면과 5.6만 회 릴스, 누적 조회수 19만' }}
              >
                <dl className="pf-detail">
                  <Detail k="문제와 인사이트">결제는 학부모가 하지만, 학군 조사 결과 학원을 고르는 건 학생이었고 친구 추천으로 정했습니다.</Detail>
                  <Detail k="실행">
                    학부모는 밴드·블로그로 신뢰를, 학생은 강사 개인 계정의 밈 릴스로 친밀감을 쌓았습니다.
                    <table className="pf-table">
                      <thead><tr><th scope="col">타깃</th><th scope="col">채널</th><th scope="col">콘텐츠</th></tr></thead>
                      <tbody>
                        <tr><th scope="row">학부모 <small>결제자</small></th><td>학원 밴드, 블로그, 사이트</td><td>수업 홍보, 학원 소식</td></tr>
                        <tr className="is-key"><th scope="row">학생 <small>결정자</small></th><td>강사 개인 인스타그램</td><td>밈 릴스, 친밀감 콘텐츠</td></tr>
                      </tbody>
                    </table>
                  </Detail>
                  <Detail k="결과">재원생 100→120명, 신규 20명 중 9명이 강사 인스타로 유입, 팔로워 84%↑, 정규직 전환 제안.</Detail>
                  <Detail k="배운 점">돈을 내는 사람과 고르는 사람은 다를 수 있고, 친구에게 보여 주고 싶은 콘텐츠가 입소문의 재료가 된다는 것을 배웠습니다. 실무에서도 결제자, 결정자, 추천자를 나눠 채널과 메시지를 따로 설계하고, 신규 고객의 유입 경로를 꼭 확인해 어떤 콘텐츠가 실제 전환을 만들었는지 따져 보겠습니다.</Detail>
                </dl>
                <div className="pf-strip pf-strip-wide">
                  <Fig src="case2-cover.jpg" alt="강사 브랜딩 굿즈, 벨라영어 교재 커버" ratio="80 / 33" />
                </div>
              </CaseCard>

              <CaseCard
                id="case-3" no="03" meta="스포츠센터 · 2025.01~현재"
                title="고객이 머무는 구조를 만들다"
                summary="부재했던 고객 문의 접점을 체계화하고, 콘텐츠와 오프라인 행사로 공식 계정을 2배 성장"
                tags={['컴플레인 0건', '팔로워 4,150', '행사 만족도 4.9']}
                role="CS 체계 설계 · SNS 총괄 · 행사 기획"
                contrib="100%"
                image={{ src: 'case3-main.png', alt: '문의 창구 Before/After: 답변 없는 DM이 컴플레인으로 이어지던 상태에서 노션 CS 관리 체계 도입 후 컴플레인 0건' }}
              >
                <dl className="pf-detail">
                  <Detail k="문제">DM 응대가 없어 컴플레인이 쌓이고 있었습니다.</Detail>
                  <Detail k="실행">
                    <table className="pf-table">
                      <thead><tr><th scope="col" /><th scope="col">Before</th><th scope="col">After</th></tr></thead>
                      <tbody>
                        <tr><th scope="row">온라인 문의</th><td>DM 응대 없음</td><td>카카오톡 채널로 창구 일원화</td></tr>
                        <tr><th scope="row">현장 응대</th><td>인포데스크 개인 역량</td><td>인포데스크·종목별 팀장용 매뉴얼</td></tr>
                        <tr><th scope="row">문의 관리</th><td>기록 없음</td><td>노션에 축적 후 FAQ 배포</td></tr>
                      </tbody>
                    </table>
                    <ul className="pf-events">
                      <li><b>250명</b>제1회 SPOREX 수영대회<small>아레나코리아 협업 · 만족도 4.9/5</small></li>
                      <li><b>200명</b>재학생 중간고사 이벤트<small>자체 기획 · 만족도 4.9/5</small></li>
                    </ul>
                  </Detail>
                  <Detail k="결과">문의 컴플레인 0건, 팔로워 2,000명대→4,150명, 밈 릴스 7.3만 회, 수영 규칙 영상 1.1만 회.</Detail>
                  <Detail k="배운 점">콘텐츠의 성과는 문의, 참여, 재방문까지 이어질 때 완성된다는 것을 배웠습니다. 실무에서는 캠페인을 열기 전에 문의 창구와 FAQ부터 준비하고, 쌓인 반복 문의를 다음 콘텐츠의 주제로 되돌려 쓰겠습니다.</Detail>
                </dl>
                <div className="pf-strip">
                  <Fig src="case3-kakao.jpg" alt="CNU SPOREX 카카오톡 채널 화면" ratio="4 / 5" />
                  <Fig src="case3-faq.png" alt="노션 FAQ 페이지 화면 (세부 내용은 가림 처리)" ratio="4 / 5" />
                  <Fig src="case3-reel.jpg" alt="조회수 7.3만 회 CNU SPOREX 눈동자 챌린지 밈 릴스" ratio="4 / 5" href="https://www.instagram.com/reel/DWp1Bs9D55j/" linkLabel="릴스 보기" />
                  <Fig src="case3-shoot.jpg" alt="수영장 콘텐츠 촬영 현장" ratio="4 / 5" />
                </div>
              </CaseCard>
            </div>
          </div>
        </section>

        {/* 5. Idea Lab */}
        <section className="pf-section pf-light" id="idea-lab" aria-labelledby="pf-lab-title">
          <div className="wrap">
            <div className="pf-head">
              <p className="pf-eyebrow">Idea Lab</p>
              <h2 id="pf-lab-title">같은 방법론, 다른 브랜드</h2>
              <p className="pf-head-sub">공모전 출품작 · 인사이트 도출과 최종 디자인 담당</p>
            </div>
            <div className="pf-duo pf-lab">
              <article className="pf-tile pf-lab-cass">
                <Fig src="lab-cass.jpg" alt="카스 0.0 캠페인 전략 장표: 알코올 함유량을 간장, 고추장, 식빵과 비교" ratio="16 / 10" />
                <div className="pf-tile-body">
                  <p className="pf-tile-meta">오비맥주 공모전 출품 · 4인 팀<span className="pf-contrib">기여도 <b>40%</b></span></p>
                  <h3>카스 0.0 「ㅋㅅㅇㅇ」</h3>
                  <p>알코올 함유량 <strong>0.05%</strong>를 간장·고추장과 비교해 체감 언어로 번역</p>
                  <p className="pf-tile-insight"><span>인사이트</span>거부감은 <strong>알코올이 들어 있다는 인지</strong>에서 비롯됨 (자체 설문)</p>
                </div>
              </article>
              <article className="pf-tile pf-lab-sajik">
                <Fig src="lab-sajik.jpg" alt="롯데 자이언츠 사!직이네 캠페인 메인 보드" ratio="16 / 10" />
                <div className="pf-tile-body">
                  <p className="pf-tile-meta">대홍기획 공모전 출품<span className="pf-contrib">기여도 <b>30%</b></span></p>
                  <h3>롯데 자이언츠 「사!직이네」</h3>
                  <p>모래(沙)와 부산 방언으로 야구장을 부산의 공간으로 재해석</p>
                  <p className="pf-tile-insight"><span>인사이트</span>2030 여성 팬은 경기보다 현장 경험을 소비함</p>
                  <p className="pf-tile-insight" data-show="univ"><span>제작</span>어도비 생성형 채우기(AI)로 공간 시안 이미지 제작</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 6. Side Projects */}
        <section className="pf-section" aria-labelledby="pf-side-title">
          <div className="wrap">
            <div className="pf-head">
              <p className="pf-eyebrow">Side Projects</p>
              <h2 id="pf-side-title">실험은 계속됩니다</h2>
            </div>
            <div className="pf-duo pf-side">
              <article className="pf-tile pf-tile-sm pf-side-ref">
                <Fig src="side-ref.png" alt="Ref 사이트 첫 화면" ratio="16 / 10" />
                <div className="pf-tile-body">
                  <h3>Ref · AI로 설계한 콘텐츠 마케팅 파이프라인</h3>
                  <p>직접 만든 Claude Code 스킬이 매일 아침 트렌드와 SEO 이슈를 슬랙으로 브리핑하고, 이를 토대로 SEO 콘텐츠를 기획·발행합니다. 트렌드 수집, 블로그 작성, 성과 분석, 주간 리포트까지 업무 단계별 스킬 11개를 AI로 직접 설계해 운영하고 있습니다.</p>
                  <a className="pf-link" href="https://marketing-ref.vercel.app/">사이트 보기 ↗</a>
                </div>
              </article>
              <article className="pf-tile pf-tile-sm pf-side-wish">
                <Fig src="side-wish.jpg" alt="영탑지 소원연못 3D 웹사이트 화면" ratio="16 / 10" />
                <div className="pf-tile-body">
                  <h3>영탑지 소원연못</h3>
                  <p>온라인 절 트렌드를 충남대 영탑지로 옮긴 3D 웹사이트. 시즌에 맞춰 재런칭을 준비하고 있습니다.</p>
                  <a className="pf-link" href="https://yeongtapji-wish.vercel.app/" rel="noopener" target="_blank">사이트 보기 ↗</a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 7. More + Tools */}
        <section className="pf-section pf-light" aria-labelledby="pf-more-title">
          <div className="wrap pf-more">
            <div>
              <p className="pf-eyebrow">More</p>
              <h2 id="pf-more-title" className="pf-h2-sm">그 밖의 활동</h2>
              <ul className="pf-list">
                <li><b>외교부 해외안전여행 서포터즈 22기</b>공공 안전 정보를 1분 영상으로</li>
                <li><b>DBpia AI 마스터 1기</b>학술 AI 서비스를 숏폼으로</li>
                <li><b>충남대 대동제 디자인 총괄 (2025)</b>3~4만 명 규모 축제</li>
              </ul>
            </div>
            <div>
              <p className="pf-eyebrow">Tools</p>
              <h2 className="pf-h2-sm">다루는 툴</h2>
              <ul className="pf-chips">
                {['Photoshop', 'Illustrator', 'Premiere Pro', 'Figma', 'Notion', 'Claude Code'].map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* 8. Contact */}
        <section className="pf-contact pf-dark" id="contact" aria-labelledby="pf-contact-title">
          <div className="wrap">
            <p className="pf-eyebrow">Contact</p>
            <h2 id="pf-contact-title">함께 이야기 나눠요</h2>
            <div className="pf-contact-btns">
              <a className="pf-btn pf-btn-primary" href="mailto:s.seoyeon1011@gmail.com">이메일 보내기</a>
              <a className="pf-btn pf-btn-ghost" href="https://www.instagram.com/ref.yeon/" rel="me noopener" target="_blank">인스타그램</a>
              {PDF_URL && <a className="pf-btn pf-btn-ghost" href={PDF_URL} download>PDF 포트폴리오</a>}
              <a className="pf-btn pf-btn-ghost" href="/">Ref 블로그</a>
            </div>
            <p className="pf-contact-mail">s.seoyeon1011@gmail.com</p>
          </div>
        </section>
      </main>

      <footer className="pf-footer">
        <div className="wrap">
          <span>&copy; 2026 심서연</span>
          <a href="/">Ref 블로그 보기 →</a>
        </div>
      </footer>
      <Lightbox />
    </>
  );
}
