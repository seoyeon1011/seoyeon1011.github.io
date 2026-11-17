import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import JsonLd from '@/components/JsonLd';
import ThemeToggle from '@/components/ThemeToggle';
import { OG_BASE, SITE, abs } from '@/lib/site';
import './portfolio.css';

// 웹 포트폴리오 (/about). 내용 원본은 Claude Docs "심서연 콘텐츠 마케터 포트폴리오 (Master)"의 "웹 포트폴리오 구조" 탭.
// 면접관이 3초(히어로) / 30초(케이스 카드 상단) / 3분(자세히 보기) 순서로 보도록 쌓는다.
// 블로그 메뉴(Shell)는 쓰지 않고 포트폴리오 전용 내비만 둔다. 블로그 링크는 맨 아래 하나.
//
// 회사별 버전: /about?for=db, /about?for=univ
//   아래 VARIANT_SCRIPT 가 주소의 for 값을 <html data-pf="..."> 로 옮기고, 순서와 문구 전환은 portfolio.css 가 한다.
//   data-hide="db univ" : 그 버전에서 숨김 / data-show="db" : 그 버전에서만 보임
//
// 사진 자리는 <Ph> 로 표시한다. 실제 사진은 <figure className="pf-figure"><img src="/assets/img/..." alt="..." /></figure> 로 바꾼다.
// 연락처는 사용자가 공개를 요청한 것만 쓴다 (CLAUDE.md). 구조안에 따라 전화번호는 공개 페이지에서 뺐다.

/** PDF 포트폴리오 파일 주소. 파일을 public/ 에 넣고 경로를 적으면 히어로와 연락처에 다운로드 버튼이 생긴다 (예: '/portfolio-simseoyeon.pdf') */
const PDF_URL = '';

const title = '포트폴리오 | 콘텐츠 마케터 심서연';
const description = '진짜 결정권자를 찾아 공유되는 콘텐츠로 구매까지 연결하는 콘텐츠 마케터 심서연의 포트폴리오입니다. 광고비 0원 굿즈 매출 1,500만 원, 신규 등록 45% SNS 유입, 강사 계정 팔로워 84% 성장 사례를 담았습니다.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs('/about') },
  openGraph: { ...OG_BASE, type: 'profile', title, description: '콘텐츠 마케터 심서연 포트폴리오', url: abs('/about') },
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
  image: { label: string; ratio?: string };
  children: ReactNode;
}

function CaseCard({ id, no, meta, title, summary, tags, role, image, children }: CaseProps) {
  return (
    <article className="pf-card" id={id} aria-labelledby={`${id}-title`}>
      <p className="pf-card-meta"><b>CASE {no}</b> · {meta}</p>
      <div className="pf-card-top">
        <Ph label={image.label} ratio={image.ratio} />
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
          url: abs('/about'),
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
            <p className="pf-hero-kicker">CONTENT MARKETER · 심서연</p>
            <h1 id="pf-hero-title" className="pf-hero-title">
              <span data-hide="db univ">진짜 결정권자를 찾아,<br />공유되는 콘텐츠로 구매까지 연결합니다.</span>
              <span data-show="db">어려운 정보를 체감 언어로 바꿔,<br />행동까지 연결합니다.</span>
              <span data-show="univ">대학생만 아는 언어로,<br />온라인과 현장을 함께 움직입니다.</span>
            </h1>

            <ul className="pf-stats" aria-label="핵심 성과">
              <li className="pf-stat-sales"><a href="#case-1"><strong>1,500<small>만 원</small></strong><span>광고비 0원 굿즈 매출</span></a></li>
              <li className="pf-stat-45"><a href="#case-2"><strong>45<small>%</small></strong><span>신규 등록 중 SNS 유입</span></a></li>
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
              <p className="pf-eyebrow">How I Work</p>
              <h2 id="pf-how-title">이렇게 일합니다</h2>
              <p className="pf-motto"><b>spark:cling</b> 아이디어(spark)에서 시작해, 성과가 날 때까지 붙잡습니다(cling).</p>
            </div>
            <ol className="pf-steps">
              <li>
                <span className="pf-step-no">01</span>
                <h3>진짜 타깃을 찾는다</h3>
                <p>돈을 내는 사람과 고르는 사람은 다를 수 있다</p>
                <a href="#case-2">Case 02 →</a>
              </li>
              <li>
                <span className="pf-step-no">02</span>
                <h3>그들만 아는 이야기를 찾는다</h3>
                <p>공유된 경험에서 출발하면 광고비 없이도 퍼진다</p>
                <a href="#case-1">Case 01 →</a>
              </li>
              <li>
                <span className="pf-step-no">03</span>
                <h3>반응을 보고 바로 고친다</h3>
                <p>계획대로 안 되면 당일에 접점을 바꾼다</p>
                <a href="#case-3">Case 03 →</a>
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
                title="3,000명의 '확정하기' 버튼"
                summary="충남대생만 아는 수강신청을 굿즈로 만들어 광고비 없이 이틀 만에 완판"
                tags={['매출 1,500만 원', '3,000개 완판', '광고비 0원']}
                role="콘셉트 제안 · 런칭 카피 · 판매 둔화 시 전략 전환"
                image={{ label: '클리커와 수강신청 화면 나란히' }}
              >
                <dl className="pf-detail">
                  <Detail k="문제와 인사이트">이틀에 3,000개를 팔아야 했지만 시중 클리커는 뻔했습니다. 방문객 90% 이상이 재학생이라, 그들만 아는 고통인 수강신청 &lsquo;확정하기&rsquo; 버튼을 굿즈로 옮겼습니다.</Detail>
                  <Detail k="실행">&ldquo;딸-깍, 무선 수강신청의 시대는 왔다&rdquo;로 인스타그램과 학과 단톡방에 런칭. 둘째 날 판매가 둔화되자 현장 체험과 밈 카드뉴스 연속 발행으로 전환했습니다.</Detail>
                  <Detail k="결과">3,000개 완판, 런칭 게시물 조회수 1.5만 회(팔로워 대비 136%), &ldquo;또 팔아 달라&rdquo;는 설문 응답.</Detail>
                  <Detail k="배운 점">사람들은 물건이 아니라 &ldquo;우리끼리 아는 이야기&rdquo;를 산다.</Detail>
                </dl>
                <div className="pf-strip">
                  <Ph label="클리커 실물 사진" ratio="4 / 5" />
                  <Ph label="런칭 게시물" ratio="4 / 5" />
                  <Ph label="밈 카드뉴스" ratio="4 / 5" />
                  <Ph label="현장 부스 사진" ratio="4 / 5" />
                </div>
              </CaseCard>

              <CaseCard
                id="case-2" no="02" meta="학원 마케팅 · 2024.01~현재"
                title="학원을 고르는 건 학부모가 아니었다"
                summary="학생이 학원을 고른다는 걸 찾아내 강사 계정을 키우고 입소문을 만듦"
                tags={['재원생 20%↑', '신규 45% SNS 유입', '릴스 5.6만']}
                role="타깃 조사 · 채널 전략 · 릴스 기획·제작"
                image={{ label: '5.6만 회 릴스 캡처' }}
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
                  <Detail k="배운 점">친구에게 보여 주고 싶은 콘텐츠가 입소문의 재료가 된다.</Detail>
                </dl>
                <div className="pf-strip">
                  <Ph label="강사 계정 프로필" ratio="9 / 16" />
                  <Ph label="강사 굿즈 사진" ratio="9 / 16" />
                  <Ph label="인스타그램 인사이트 화면" ratio="9 / 16" />
                </div>
              </CaseCard>

              <CaseCard
                id="case-3" no="03" meta="스포츠센터 · 2025.01~현재"
                title="고객이 머무는 구조를 만들다"
                summary="비어 있던 문의 창구를 설계하고 콘텐츠와 행사로 계정을 2배 키움"
                tags={['컴플레인 0건', '팔로워 4,150', '행사 만족도 4.9']}
                role="CS 체계 설계 · SNS 총괄 · 행사 기획"
                image={{ label: 'Before/After 문의 창구' }}
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
                  <Detail k="결과">문의 컴플레인 0건, 팔로워 2,000명대→4,150명, 밈 릴스 7.1만 회, 수영 규칙 영상 1.1만 회.</Detail>
                  <Detail k="배운 점">콘텐츠의 성과는 문의·참여·재방문까지 이어질 때 완성된다.</Detail>
                </dl>
                <div className="pf-strip">
                  <Ph label="카카오톡 채널 화면" ratio="4 / 5" />
                  <Ph label="노션 FAQ 화면 (개인정보 가림)" ratio="4 / 5" />
                  <Ph label="7.1만 회 밈 릴스 캡처" ratio="4 / 5" />
                  <Ph label="수영대회 현장 사진" ratio="4 / 5" />
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
                <Ph label="알코올 함유량 비교 장표" ratio="16 / 10" />
                <div className="pf-tile-body">
                  <p className="pf-tile-meta">오비맥주 공모전 출품 · 4인 팀</p>
                  <h3>카스 0.0 「ㅋㅅㅇㅇ」</h3>
                  <p>숫자 &ldquo;0.05%&rdquo;를 간장·고추장과 비교해 체감 언어로 번역</p>
                  <p className="pf-tile-insight"><span>인사이트</span>거부감은 &ldquo;알코올이 들어 있다&rdquo;는 인지에서 온다 (자체 설문)</p>
                </div>
              </article>
              <article className="pf-tile pf-lab-sajik">
                <Ph label="사!직이네 메인 보드" ratio="16 / 10" />
                <div className="pf-tile-body">
                  <p className="pf-tile-meta">대홍기획 공모전 출품</p>
                  <h3>롯데 자이언츠 「사!직이네」</h3>
                  <p>모래(沙)와 부산 방언으로 야구장을 부산의 공간으로</p>
                  <p className="pf-tile-insight"><span>인사이트</span>2030 여성 팬은 현장 경험을 산다</p>
                  <p className="pf-tile-insight" data-show="univ"><span>제작</span>어도비 생성형 채우기(AI)로 공간 시안 이미지 제작</p>
                </div>
              </article>
            </div>
            <p className="pf-note">두 기획 모두 Case 01처럼, 타깃이 이미 가진 경험에서 출발했습니다.</p>
          </div>
        </section>

        {/* 6. Side Projects */}
        <section className="pf-section" aria-labelledby="pf-side-title">
          <div className="wrap">
            <div className="pf-head">
              <p className="pf-eyebrow">Side Projects</p>
              <h2 id="pf-side-title">일 밖에서도 실험합니다</h2>
            </div>
            <div className="pf-duo pf-side">
              <article className="pf-tile pf-tile-sm pf-side-ref">
                <Ph label="Ref 사이트 화면" ratio="16 / 9" />
                <div className="pf-tile-body">
                  <h3>Ref</h3>
                  <p>매일 트렌드를 수집해 SEO 콘텐츠로 만드는 1인 파이프라인. Claude Code 스킬 11개를 직접 만들어 운영 중.</p>
                  <a className="pf-link" href="https://marketing-ref.vercel.app/">사이트 보기 ↗</a>
                </div>
              </article>
              <article className="pf-tile pf-tile-sm pf-side-wish">
                <Ph label="영탑지 소원연못 사이트 화면" ratio="16 / 9" />
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
                {['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects', 'Figma', 'Notion', 'Claude Code'].map((t) => <li key={t}>{t}</li>)}
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
    </>
  );
}
