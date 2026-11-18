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
//   자기소개 문장(히어로 메인 카피)은 모든 버전에서 하나로 통일한다 (2026-11-18).
//
// 사진은 <Fig> (public/assets/img/portfolio/, '/' 로 시작하면 그 경로 그대로). 누르면 Lightbox.tsx 가 확대 팝업을 띄우고, href 를 주면 외부 링크로 연다.
// 아직 사진이 없는 자리는 <Ph> 로 표시한다.
// 연락처는 사용자가 공개를 요청한 것만 쓴다 (CLAUDE.md). 구조안에 따라 전화번호는 공개 페이지에서 뺐다.
//
// 수치 원칙: 사용자가 확정한 수치만 쓴다. 측정 방법이 있는 수치(설문 등)는 방법을 함께 적는다.
// REF 는 실제로 자동 운영 중인 범위(트렌드 수집, Slack 발송)와 직접 진행하는 범위(주제 선택, 제작, 성과 확인)를 배지로 구분한다.

/** PDF 포트폴리오 파일 주소. 파일을 public/ 에 넣고 경로를 적으면 히어로와 연락처에 다운로드 버튼이 생긴다 (예: '/portfolio-simseoyeon.pdf') */
const PDF_URL = '/portfolio-seoyeon.pdf';

const title = '포트폴리오 | 콘텐츠 마케터 심서연';
const description = '콘텐츠로 관심을 만들고 행동으로 연결하는 콘텐츠 마케터 심서연의 포트폴리오입니다. 유료 광고 없이 굿즈 3,000개 전량 판매(매출 1,500만 원), 신규 등록생 SNS 유입 45%, 강사 계정 팔로워 약 84.1% 증가 사례와 AI 콘텐츠 마케팅 자동화 프로젝트를 담았습니다.';

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

const VARIANT_SCRIPT = "(function(){try{var v=new URLSearchParams(location.search).get('for');if(v==='db'||v==='univ')document.documentElement.dataset.pf=v;}catch(e){}window.addEventListener('beforeprint',function(){document.querySelectorAll('details.pf-details').forEach(function(d){d.open=true;});});})();";

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
function Fig({ src, alt, ratio = '16 / 9', href, linkLabel, newTab = true }: { src: string; alt: string; ratio?: string; href?: string; linkLabel?: string; newTab?: boolean }) {
  const image = <img src={src.startsWith('/') ? src : IMG + src} alt={alt} loading="lazy" decoding="async" />;
  return (
    <figure className="pf-figure" style={{ aspectRatio: ratio } as CSSProperties}>
      {href ? (
        <a className="pf-fig-link" href={href} {...(newTab ? { target: '_blank', rel: 'noopener' } : {})} aria-label={`${linkLabel ?? '링크 열기'}: ${alt}`}>
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

/** 자세히 보기 안의 단계. n 은 01~08 번호 */
function Step({ n, k, children }: { n: string; k: string; children: ReactNode }) {
  return (
    <div className="pf-detail-row">
      <dt><span className="pf-dt-no">{n}</span>{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

interface Kpi { v: string; u?: string; label: string; note?: string }
interface KpiGroup { title?: string; items: Kpi[] }

/** 자세히 보기 맨 위: 왼쪽 담당 업무, 오른쪽 핵심 성과(측정 기준 포함) */
function RoleResult({ roles, groups }: { roles: string[]; groups: KpiGroup[] }) {
  return (
    <div className="pf-rr">
      <div className="pf-rr-role">
        <p className="pf-rr-h">담당 업무</p>
        <ul>{roles.map((r) => <li key={r}>{r}</li>)}</ul>
      </div>
      <div className="pf-rr-result">
        <p className="pf-rr-h">핵심 성과</p>
        {groups.map((g, i) => (
          <div className="pf-kpi-group" key={g.title ?? i}>
            {g.title && <p className="pf-kpi-gt">{g.title}</p>}
            <ul className="pf-kpis">
              {g.items.map((k) => (
                <li key={k.label}>
                  <strong>{k.v}{k.u && <small>{k.u}</small>}</strong>
                  <span>{k.label}</span>
                  {k.note && <em>{k.note}</em>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
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

type Status = 'auto' | 'manual' | 'lab';
const STATUS_LABEL: Record<Status, string> = { auto: '자동 운영', manual: '직접 진행', lab: '실습 검증' };
function Badge({ s }: { s: Status }) {
  return <span className={`pf-badge pf-badge-${s}`}>{STATUS_LABEL[s]}</span>;
}

const SKILL_GROUPS: { key: string; name: string; skills: [string, string][] }[] = [
  {
    key: 'A', name: '콘텐츠 제작',
    skills: [
      ['블로그드래프트', '키워드 하나로 SEO 템플릿에 맞춘 블로그 초안 작성'],
      ['에스엔에스요약', '블로그 글을 150~200자 SNS 게시물과 해시태그로 요약'],
      ['카드뉴스', '슬라이드 템플릿 기준 카드뉴스 스크립트 작성'],
      ['에스엔에스콘텐츠삼단계', '기획서, 초안, 피드백을 세 단계로 작성'],
    ],
  },
  {
    key: 'B', name: '데이터 분석',
    skills: [
      ['성과분석', '콘텐츠 성과 CSV로 주제·형식·채널별 패턴과 다음 달 추천 도출'],
      ['리드스코어링', '기준표 배점으로 리드 점수를 매기고 핫·웜·콜드 등급 분류'],
      ['브이오씨분석', '설문 만족도·NPS 계산과 주관식 불만 유형 분류'],
    ],
  },
  {
    key: 'C', name: '운영 자동화',
    skills: [
      ['주간성과오케스트레이터', '채널별 ROAS·매출증감률로 정상·주의·위험 판정, 2주 연속 위험 감지'],
      ['데이터파이프라인오케스트레이터', '일별 원시 데이터 정리부터 보고서 작성, Slack 전송, 실행 이력 기록'],
      ['사내질문응대', 'FAQ에서 답을 찾으면 근거와 함께 답변, 없으면 담당 부서로 이관'],
      ['피드백피알디오케스트레이터', '고객 피드백 우선순위를 매기고 PRD 작성'],
    ],
  },
];

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
              <li><a href="#ref">REF</a></li>
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
              <span className="pf-hero-sub">콘텐츠로 관심을 만들고,<br />행동으로 연결하는 마케터 심서연입니다.</span>
            </h1>
            <p className="pf-hero-lead">타깃의 언어와 행동을 관찰해 콘텐츠를 기획하고, 실제 반응과 성과로 검증합니다.</p>
            <ul className="pf-hero-skills" aria-label="핵심 역량">
              <li>타깃 분석</li>
              <li>콘텐츠 기획</li>
              <li>채널 운영</li>
              <li>성과 개선</li>
            </ul>

            <ul className="pf-stats" aria-label="핵심 성과">
              <li className="pf-stat-sales"><a href="#case-1"><strong>1,500<small>만 원</small></strong><span>유료 광고 없이 굿즈 3,000개 전량 판매</span></a></li>
              <li className="pf-stat-45"><a href="#case-2"><strong>45<small>%</small></strong><span>신규 등록생 SNS 유입 비중 (설문 확인)</span></a></li>
              <li className="pf-stat-84" data-hide="db univ"><a href="#case-2"><strong>84.1<small>%↑</small></strong><span>강사 계정 팔로워 증가율 (약, 2025.12~2026.11)</span></a></li>
              <li className="pf-stat-reels" data-show="db"><a href="#case-2"><strong>5.6<small>만 회</small></strong><span>학원 강사 계정 최고 조회수 릴스</span></a></li>
              <li className="pf-stat-events" data-show="univ"><a href="#case-3"><strong>450<small>명</small></strong><span>직접 기획한 행사 두 건 참여</span></a></li>
            </ul>

            <div className="pf-hero-actions">
              <a className="pf-btn pf-btn-primary" href="#work">케이스 보기 ↓</a>
              {PDF_URL && <a className="pf-btn pf-btn-ghost" href={PDF_URL} download="심서연_포트폴리오.pdf">PDF 다운로드</a>}
            </div>
          </div>
        </section>

        {/* 3. 핵심 역량 */}
        <section className="pf-section pf-light" aria-labelledby="pf-how-title">
          <div className="wrap">
            <div className="pf-head">
              <p className="pf-eyebrow">Core Skills</p>
              <h2 id="pf-how-title">네 가지 역량으로 일합니다</h2>
            </div>
            <ol className="pf-steps pf-steps-4">
              <li>
                <span className="pf-step-no">01</span>
                <h3>타깃 분석</h3>
                <p>결제자와 결정자를 구분하고, 실제로 선택하는 사람을 조사로 확인합니다.</p>
                <span className="pf-step-links"><a href="#case-2">Case 02</a> · <a href="#case-1">Case 01 →</a></span>
              </li>
              <li>
                <span className="pf-step-no">02</span>
                <h3>콘텐츠 기획</h3>
                <p>타깃만 공유하는 경험과 언어에서 콘셉트를 찾아 상품과 콘텐츠로 만듭니다.</p>
                <span className="pf-step-links"><a href="#case-1">Case 01</a> · <a href="#case-2">Case 02 →</a></span>
              </li>
              <li>
                <span className="pf-step-no">03</span>
                <h3>채널 운영</h3>
                <p>타깃별로 채널을 나누고, 문의 창구와 SNS 계정을 함께 운영합니다.</p>
                <span className="pf-step-links"><a href="#case-3">Case 03</a> · <a href="#case-2">Case 02 →</a></span>
              </li>
              <li>
                <span className="pf-step-no">04</span>
                <h3>성과 개선</h3>
                <p>반응과 지표를 읽고 상황에 맞게 전략을 바꾸며, 반복 업무는 프로세스로 정리합니다.</p>
                <span className="pf-step-links"><a href="#case-1">Case 01</a> · <a href="#ref">REF →</a></span>
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
                id="case-1" no="01" meta="대학 축제 굿즈 · 2026"
                title="3,000명을 확정하게 만들다"
                summary="대학생의 수강신청 경험에서 발견한 인사이트를 굿즈로 구현하고, 유료 광고 없이 현장 판매 2일 만에 3,000개를 전량 판매"
                tags={['매출 1,500만 원', '3,000개 전량 판매', '유료 광고비 0원']}
                role="콘셉트 제안 · 런칭 카피 · 판매 둔화 시 전략 전환"
                contrib="90%"
                image={{ src: 'case1-main.jpg', alt: '수강신청 사이트의 신청 버튼과 확정하기 클리커를 나란히 놓은 비교 이미지' }}
              >
                <RoleResult
                  roles={[
                    '수강신청 확정하기 버튼을 옮긴 클리커 콘셉트 제안',
                    '런칭 카피 작성, 인스타그램·학과 단톡방 동시 런칭',
                    '판매 둔화 시 현장 체험 접점과 밈 카드뉴스로 전략 전환',
                  ]}
                  groups={[{
                    items: [
                      { v: '1,500', u: '만 원', label: '총매출', note: '개당 5,000원 × 3,000개' },
                      { v: '3,000', u: '개', label: '전량 판매', note: '총생산 3,000개 기준 판매율 100%' },
                      { v: '2', u: '일', label: '판매 기간', note: '축제 현장 판매' },
                      { v: '0', u: '원', label: '유료 광고비' },
                      { v: '1.5', u: '만 회', label: '런칭 게시물 도달', note: '팔로워 수의 136%' },
                    ],
                  }]}
                />
                <dl className="pf-detail">
                  <Step n="01" k="프로젝트 배경">대학 축제 2일 동안 클리커 굿즈 3,000개를 판매하는 것이 목표였습니다. 시중 클리커는 디자인 차별점이 없었습니다.</Step>
                  <Step n="02" k="타깃 인사이트">방문객의 90% 이상이 재학생이라는 점에 주목했습니다. 재학생이라면 누구나 겪는 수강신청은 학내 구성원만 공유하는 IP라고 판단했습니다.</Step>
                  <Step n="03" k="콘셉트 기획">수강신청 사이트의 <strong>확정하기</strong> 버튼을 그대로 옮긴 클리커를 제안했습니다. 제품 이름은 CSSD(CNU Smart SuGang Device)입니다.</Step>
                  <Step n="04" k="굿즈와 판매 전략">개당 5,000원, 총 3,000개를 생산해 유료 광고 없이 축제 현장에서 판매했습니다. 런칭 카피 <strong>딸-깍, 무선 수강신청의 시대는 왔다</strong>로 인스타그램과 학과 단톡방에 동시 런칭했습니다.</Step>
                  <Step n="05" k="판매 둔화와 대응">2일차에 판매 속도가 둔화되자, 현장 체험 접점과 밈 카드뉴스 연속 발행으로 전략을 바꿨습니다.</Step>
                  <Step n="06" k="현장 체험·밈 콘텐츠">현장에서 방문객이 직접 체험하는 접점을 만들고, 수강신청 상황을 패러디한 밈 카드뉴스를 연속 발행했습니다.</Step>
                  <Step n="07" k="최종 판매 성과">2일 동안 3,000개를 모두 판매해 매출 1,500만 원을 기록했고, 유료 광고비는 쓰지 않았습니다. 전략을 바꾼 뒤 남은 물량까지 판매를 마쳤습니다. 런칭 게시물은 팔로워 수의 136%인 1.5만 회 도달했고, 만족도 조사에서는 <strong>재판매 요청</strong>이 나왔습니다.</Step>
                  <Step n="08" k="프로젝트 인사이트">사람들은 물건보다 <strong>우리끼리 아는 이야기</strong>에 지갑을 연다는 것을 배웠습니다. 실무에서는 기획 초기에 타깃만 아는 순간과 단어를 먼저 모아 콘셉트의 재료로 쓰고, 런칭 첫날의 판매와 반응을 기준선으로 잡아 둔화되면 그날 바로 접점과 콘텐츠를 바꾸겠습니다.</Step>
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
                summary="학부모(결제자)와 학생(결정자)의 의사결정 구조를 분석하고, 타깃별 SNS 콘텐츠 전략으로 신규 등록까지 연결"
                tags={['신규 등록 45% SNS 유입', '팔로워 약 84.1%↑', '누적 조회수 19만 회']}
                role="타깃 조사 · 채널 전략 · 릴스 기획·제작"
                contrib="90%"
                image={{ src: 'case2-main.jpg', alt: '강사 인스타그램 계정 화면과 5.6만 회 릴스, 누적 조회수 19만' }}
              >
                <RoleResult
                  roles={[
                    '학군 조사로 학원 선택 과정과 결정자 확인',
                    '학부모·학생 타깃별 채널과 콘텐츠 전략 수립',
                    '강사 개인 인스타그램 운영, 릴스 기획·제작',
                  ]}
                  groups={[
                    {
                      title: 'SNS 성과 (강사 개인 인스타그램)',
                      items: [
                        { v: '1,001', u: '명', label: '팔로워 증가', note: '1,190 → 2,191명, 약 84.1% (2025.12~2026.11)' },
                        { v: '19', u: '만 회', label: '릴스 누적 조회수', note: '최고 조회수 5.6만 회' },
                      ],
                    },
                    {
                      title: '등록 성과',
                      items: [
                        { v: '45', u: '%', label: '신규 등록생 SNS 유입', note: '신규 20명 중 9명, 등록생 설문조사로 확인' },
                        { v: '120', u: '명', label: '재원생', note: '100명 → 120명 (20% 증가)' },
                      ],
                    },
                  ]}
                />
                <dl className="pf-detail">
                  <Step n="01" k="기존 상황과 문제">기존에는 학원에서 운영하는 플랫폼에만 의존하고 있었고, 직접 운영하는 온드 미디어가 없었습니다. 학원비는 학부모가 내지만 학원을 실제로 고르는 사람이 누구인지에 따라 콘텐츠의 방향이 달라지므로, 누구를 향해 콘텐츠를 만들지부터 확인했습니다.</Step>
                  <Step n="02" k="학부모와 학생의 역할 구분">학부모는 결제자, 학생은 결정자로 역할을 나눴습니다. 학부모에게는 믿고 맡길 수 있다는 신뢰가, 학생에게는 가 보고 싶다는 친밀감이 필요하다고 봤습니다.</Step>
                  <Step n="03" k="타깃 분석·학군 조사">학군 조사 결과, 학원을 고르는 사람은 학생이었고 친구 추천으로 학원을 정하고 있었습니다.</Step>
                  <Step n="04" k="타깃별 채널 전략">
                    학부모는 밴드·블로그로 신뢰를, 학생은 강사 개인 계정의 밈 릴스로 친밀감을 쌓았습니다.
                    <table className="pf-table">
                      <thead><tr><th scope="col">타깃</th><th scope="col">채널</th><th scope="col">콘텐츠</th></tr></thead>
                      <tbody>
                        <tr><th scope="row">학부모 <small>결제자</small></th><td>학원 밴드, 블로그, 사이트</td><td>수업 홍보, 학원 소식</td></tr>
                        <tr className="is-key"><th scope="row">학생 <small>결정자</small></th><td>강사 개인 인스타그램</td><td>밈 릴스, 친밀감 콘텐츠</td></tr>
                      </tbody>
                    </table>
                  </Step>
                  <Step n="05" k="강사 인스타그램 운영">학생이 친구에게 보여 줄 수 있는 채널로 강사 개인 인스타그램을 운영했습니다. 2025년 12월 1,190명이던 팔로워는 2026년 11월 2,191명이 됐습니다.</Step>
                  <Step n="06" k="릴스 기획·제작">학생들이 공감하는 밈과 친밀감 콘텐츠를 릴스로 기획하고 제작했습니다. 강사 계정 릴스는 누적 조회수 19만 회, 최고 5.6만 회를 기록했습니다.</Step>
                  <Step n="07" k="팔로워·신규 등록 성과">신규 등록생 20명 가운데 9명(45%)이 SNS를 통해 유입됐다고 설문에서 답했습니다. 재원생은 100명에서 120명으로 늘었고, 정규직 전환 제안도 받았습니다.</Step>
                  <Step n="08" k="프로젝트 인사이트">돈을 내는 사람과 고르는 사람은 다를 수 있고, 친구에게 보여 주고 싶은 콘텐츠가 입소문의 재료가 된다는 것을 배웠습니다. 실무에서도 결제자, 결정자, 추천자를 나눠 채널과 메시지를 따로 설계하고, 신규 고객의 유입 경로를 꼭 확인해 어떤 콘텐츠가 실제 전환을 만들었는지 따져 보겠습니다.</Step>
                </dl>
                <div className="pf-strip pf-strip-wide">
                  <Fig src="case2-cover.jpg" alt="강사 브랜딩 굿즈, 벨라영어 교재 커버" ratio="80 / 33" />
                </div>
              </CaseCard>

              <CaseCard
                id="case-3" no="03" meta="스포츠센터 · 2025.01~현재"
                title="고객 문의를 콘텐츠 자산으로 전환하다"
                summary="응대가 없던 고객 문의를 카카오톡 채널과 FAQ·매뉴얼로 체계화하고, SNS 콘텐츠와 오프라인 행사를 운영"
                tags={['컴플레인 0건 (2026.09~)', '팔로워 4,150명', '행사 만족도 4.9/5']}
                role="CS 체계 설계 · SNS 총괄 · 행사 기획"
                contrib="100%"
                image={{ src: 'case3-main.png', alt: '문의 창구 Before/After: 답변 없는 DM이 컴플레인으로 이어지던 상태에서 노션 CS 관리 체계 도입 후 컴플레인 0건' }}
              >
                <RoleResult
                  roles={[
                    'CS 체계 설계: 문의 창구 일원화, FAQ, 응대 매뉴얼',
                    'SNS 총괄: 공식 계정 콘텐츠 기획·운영',
                    '오프라인 행사 기획: 수영대회, 재학생 이벤트',
                  ]}
                  groups={[
                    {
                      title: 'CS 개선 성과',
                      items: [
                        { v: '0', u: '건', label: '문의 컴플레인', note: '2026년 9월부터' },
                      ],
                    },
                    {
                      title: 'SNS 운영 성과',
                      items: [
                        { v: '4,150', u: '명', label: '공식 계정 팔로워', note: '2,000명대에서 성장' },
                        { v: '7.3', u: '만 회', label: '밈 릴스 조회수', note: '눈동자 챌린지 밈 릴스' },
                        { v: '1.1', u: '만 회', label: '수영 규칙 영상 조회수', note: 'FAQ를 관람 에티켓 영상 패러디로 제작' },
                      ],
                    },
                    {
                      title: '행사 성과',
                      items: [
                        { v: '450', u: '명', label: '행사 두 건 참여', note: '수영대회 250명 · 중간고사 이벤트 200명' },
                        { v: '4.9', u: '/5', label: '중간고사 이벤트 만족도', note: '참여자 200명 설문 / 평균 만족도 4.9점(5점 만점)' },
                      ],
                    },
                  ]}
                />
                <dl className="pf-detail">
                  <Step n="01" k="기존 소통 문제">SNS DM 응대가 없어 컴플레인이 쌓이고 있었습니다. 현장 응대는 인포데스크 직원 개인 역량에 맡겨져 있었고, 문의 기록도 남지 않았습니다.</Step>
                  <Step n="02" k="문의 접점 통합">온라인 문의 창구를 카카오톡 채널 하나로 일원화했습니다.</Step>
                  <Step n="03" k="문의 기록·FAQ 구축">들어온 문의를 노션에 기록해 쌓고, 자주 묻는 내용을 FAQ로 정리해 배포했습니다.</Step>
                  <Step n="04" k="응대 매뉴얼 제작">
                    인포데스크와 종목별 팀장이 같은 기준으로 답할 수 있도록 응대 매뉴얼을 만들었습니다.
                    <table className="pf-table">
                      <thead><tr><th scope="col" /><th scope="col">Before</th><th scope="col">After</th></tr></thead>
                      <tbody>
                        <tr><th scope="row">온라인 문의</th><td>DM 응대 없음</td><td>카카오톡 채널로 창구 일원화</td></tr>
                        <tr><th scope="row">현장 응대</th><td>인포데스크 개인 역량</td><td>인포데스크·종목별 팀장용 매뉴얼</td></tr>
                        <tr><th scope="row">문의 관리</th><td>기록 없음</td><td>노션에 축적 후 FAQ 배포</td></tr>
                      </tbody>
                    </table>
                  </Step>
                  <Step n="05" k="SNS 콘텐츠 기획·운영">공식 SNS 계정을 총괄하며 밈 릴스와 정보형 영상을 기획했습니다. 눈동자 챌린지 밈 릴스는 7.3만 회 조회됐습니다. FAQ를 재미있게 전달할 방법을 고민하다가, 영화 상영 전에 나오는 관람 에티켓 영상을 패러디해 수영 규칙 영상을 만들었고 1.1만 회 조회됐습니다.</Step>
                  <Step n="06" k="오프라인 행사 기획">
                    오프라인 행사 두 건을 기획했습니다.
                    <ul className="pf-events">
                      <li><b>250명</b>제1회 SPOREX 수영대회<small>아레나코리아 협업 · 참여자 250명</small></li>
                      <li><b>200명</b>재학생 중간고사 이벤트<small>자체 기획 · 참여자 200명 설문 / 평균 만족도 4.9점(5점 만점)</small></li>
                    </ul>
                  </Step>
                  <Step n="07" k="소통·콘텐츠 성과">
                    <span className="pf-split"><b>CS 개선</b>2026년 9월부터 문의 컴플레인 0건</span>
                    <span className="pf-split"><b>SNS 운영</b>팔로워 2,000명대 → 4,150명, 밈 릴스 7.3만 회, 수영 규칙 영상 1.1만 회</span>
                    <span className="pf-split"><b>행사</b>수영대회 250명, 중간고사 이벤트 200명 참여 (이벤트 참여자 200명 설문 평균 만족도 4.9점)</span>
                  </Step>
                  <Step n="08" k="프로젝트 인사이트">콘텐츠의 성과는 문의, 참여, 재방문까지 이어질 때 완성된다는 것을 배웠습니다. 실무에서는 캠페인을 열기 전에 문의 창구와 FAQ부터 준비하고, 쌓인 반복 문의를 다음 콘텐츠의 주제로 되돌려 쓰겠습니다.</Step>
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

        {/* 5. REF 사이드 프로젝트: 전체 흐름 → 영역별 스킬 → 실제 활용 사례 */}
        <section className="pf-section pf-ref" id="ref" aria-labelledby="pf-ref-title">
          <div className="wrap">
            <div className="pf-head">
              <p className="pf-eyebrow">Side Project · REF</p>
              <h2 id="pf-ref-title">AI로 설계한 콘텐츠 마케팅 자동화 시스템</h2>
              <p className="pf-head-sub">콘텐츠 마케팅 업무를 단계별로 분해하고, 11개의 자동화 스킬을 설계해 트렌드 수집부터 콘텐츠 제작과 성과 분석까지 연결하는 개인 프로젝트입니다.</p>
            </div>

            <ul className="pf-legend" aria-label="운영 상태 표시">
              <li><Badge s="auto" />매일 자동으로 실행되는 단계</li>
              <li><Badge s="manual" />직접 판단하고 작업하는 단계</li>
              <li><Badge s="lab" />가상 브랜드 데이터로 설계·검증한 스킬</li>
            </ul>

            {/* 5-1. 전체 흐름 */}
            <div className="pf-ref-block">
              <h3 className="pf-ref-h"><span>01</span>전체 흐름</h3>
              <ol className="pf-flow">
                <li><Badge s="auto" /><b>트렌드·SEO 정보 수집</b><span>Claude Code가 웹 검색으로 릴스 트렌드, SEO·마케팅 지식, 콘텐츠 이슈를 찾습니다.</span></li>
                <li><Badge s="auto" /><b>Slack 트렌드 브리핑</b><span>매일 아침 주제 3개를 콘텐츠 아이디어와 출처까지 정리해 Slack으로 보냅니다.</span></li>
                <li><Badge s="manual" /><b>주제·아이디어 발굴</b><span>브리핑을 읽고 지금 다룰 만한 소재를 고릅니다.</span></li>
                <li><Badge s="manual" /><b>콘텐츠 기획·제작</b><span>고른 소재를 블로그 글로 기획·제작해 Ref에 발행합니다.</span></li>
                <li><Badge s="manual" /><b>성과 확인·개선</b><span>발행한 콘텐츠의 반응을 확인해 다음 주제 선정에 반영합니다.</span></li>
              </ol>
              <p className="pf-ref-note">자동으로 돌아가는 범위는 트렌드 수집과 Slack 발송까지입니다. 주제 선택, 콘텐츠 제작, 성과 확인은 직접 판단하고 진행합니다. 브리핑은 Windows 작업 스케줄러, Claude Code, Slack 웹훅으로 구성했고 실행 결과를 매일 기록합니다.</p>
            </div>

            {/* 5-2. 영역별 스킬 11개 */}
            <div className="pf-ref-block">
              <h3 className="pf-ref-h"><span>02</span>업무 단계별 스킬 11개</h3>
              <p className="pf-ref-lead">콘텐츠 마케팅 업무를 제작, 분석, 운영 세 영역으로 나누고 단계마다 스킬을 설계했습니다. 스킬마다 입력 자료, 작업 절차, 품질 체크리스트, 예외 처리 규칙을 정해 두어 같은 기준으로 반복할 수 있게 했습니다. 11개 스킬은 강의 실습에서 가상 화장품 브랜드 데이터로 설계하고 직접 실행해 검증했습니다.</p>
              <div className="pf-skill-groups">
                {SKILL_GROUPS.map((g) => (
                  <section className="pf-skill-group" key={g.key} aria-label={`${g.name} 스킬 ${g.skills.length}개`}>
                    <header>
                      <p><span>{g.key}</span>{g.name}</p>
                      <small>{g.skills.length}개</small>
                    </header>
                    <dl>
                      {g.skills.map(([name, desc]) => (
                        <div key={name}><dt>{name}</dt><dd>{desc}</dd></div>
                      ))}
                    </dl>
                    <Badge s="lab" />
                  </section>
                ))}
              </div>
              <p className="pf-ref-note">스킬끼리 이어지는 부분: 블로그드래프트가 초안을 마치면 에스엔에스요약이 이어서 SNS 게시물을 만들고, 데이터파이프라인오케스트레이터는 완성한 보고서를 Slack으로 전송합니다.</p>
            </div>

            {/* 5-3. 실제 활용 사례 */}
            <div className="pf-ref-block">
              <h3 className="pf-ref-h"><span>03</span>활용 사례: 브리핑 한 줄이 블로그 글이 되기까지</h3>
              <ol className="pf-usecase">
                <li>
                  <p className="pf-uc-step">STEP 01<Badge s="auto" /></p>
                  <h4>트렌드 탐색</h4>
                  <p>콘텐츠 제작에 필요한 트렌드와 SEO 이슈를 매일 수집합니다. 최근 14일 동안 보낸 주제는 빼고 골라 같은 이야기가 반복되지 않게 했습니다.</p>
                </li>
                <li>
                  <p className="pf-uc-step">STEP 02<Badge s="auto" /></p>
                  <h4>Slack 브리핑</h4>
                  <blockquote className="pf-brief">
                    <p className="pf-brief-h">2026.11.13 오늘의 콘텐츠 브리핑 · 2번 항목</p>
                    <p><b>SEO·마케팅 지식 | 구글 코어 업데이트 대응법</b></p>
                    <p>한 줄 정의: 코어 업데이트(core update)는 구글이 검색 순위를 매기는 핵심 시스템 전체를 크게 손보는 정기 업데이트입니다.</p>
                    <p>실무 적용: 서치 콘솔에서 11월 10일 이전 1주일을 기준 기간으로 저장해 둡니다.</p>
                  </blockquote>
                  <p className="pf-uc-cap">실제 브리핑 원문 일부를 옮겨 적었습니다 (화면 캡처 아님).</p>
                </li>
                <li>
                  <p className="pf-uc-step">STEP 03<Badge s="manual" /></p>
                  <h4>콘텐츠 제작</h4>
                  <Fig src="/assets/img/posts/google-core-update-2026-11-1.webp" alt="Ref 블로그 글 이미지: 2026년 구글 코어 업데이트 세 번(3월, 5월, 11월) 일정 정리" href="/posts/google-core-update-2026-11" linkLabel="글 보기" newTab={false} />
                  <p>같은 날 이 소재를 <a href="/posts/google-core-update-2026-11">구글 코어 업데이트 총정리</a> 글로 확장해 Ref에 발행했습니다. 업데이트 기간, 영향 확인 방법, 회복 방법까지 다뤘습니다.</p>
                </li>
                <li>
                  <p className="pf-uc-step">STEP 04<Badge s="manual" /></p>
                  <h4>성과 확인</h4>
                  <p>발행한 콘텐츠의 반응을 직접 확인하고 다음 주제를 고를 때 참고합니다. 성과 집계는 아직 자동화하지 않았습니다.</p>
                </li>
              </ol>
            </div>

            {/* 5-4. 이 프로젝트로 보여 주는 역량 */}
            <div className="pf-ref-foot">
              <Fig src="side-ref.png" alt="Ref 사이트 첫 화면" ratio="16 / 10" />
              <div>
                <p className="pf-rr-h">이 프로젝트로 보여 주는 역량</p>
                <ul className="pf-chips">
                  {['마케팅 업무 프로세스 분석', '반복 업무의 자동화 설계', 'AI 도구 활용 및 스킬 설계', '트렌드 기반 콘텐츠 기획', '콘텐츠 제작 프로세스 구축', '데이터 기반 성과 분석'].map((t) => <li key={t}>{t}</li>)}
                </ul>
                <a className="pf-link" href="https://marketing-ref.vercel.app/">Ref 사이트 보기 ↗</a>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Idea Lab */}
        <section className="pf-section pf-light" id="idea-lab" aria-labelledby="pf-lab-title">
          <div className="wrap">
            <div className="pf-head">
              <p className="pf-eyebrow">Idea Lab</p>
              <h2 id="pf-lab-title">같은 방법론, 다른 브랜드</h2>
              <p className="pf-head-sub">공모전 출품작</p>
            </div>
            <div className="pf-duo pf-lab">
              <article className="pf-tile pf-lab-cass">
                <Fig src="lab-cass.jpg" alt="카스 0.0 캠페인 전략 장표: 알코올 함유량을 간장, 고추장, 식빵과 비교" ratio="16 / 10" />
                <div className="pf-tile-body">
                  <p className="pf-tile-meta">공모전 · 오비맥주 공모전 출품 · 4인 팀<span className="pf-contrib">기여도 <b>40%</b></span></p>
                  <h3>카스 0.0 「ㅋㅅㅇㅇ」</h3>
                  <p>알코올 함유량 <strong>0.05%</strong>를 간장·고추장과 비교해 체감 언어로 번역</p>
                  <p className="pf-tile-insight"><span>인사이트</span>거부감은 <strong>알코올이 들어 있다는 인지</strong>에서 비롯됨 (자체 설문)</p>
                  <p className="pf-tile-insight"><span>내 역할</span>인사이트 도출 · 최종 디자인</p>
                </div>
              </article>
              <article className="pf-tile pf-lab-sajik">
                <Fig src="lab-sajik.jpg" alt="롯데 자이언츠 사!직이네 캠페인 메인 보드" ratio="16 / 10" />
                <div className="pf-tile-body">
                  <p className="pf-tile-meta">공모전 · 대홍기획 공모전 출품<span className="pf-contrib">기여도 <b>30%</b></span></p>
                  <h3>롯데 자이언츠 「사!직이네」</h3>
                  <p>모래(沙)와 부산 방언으로 야구장을 부산의 공간으로 재해석</p>
                  <p className="pf-tile-insight"><span>인사이트</span>2030 여성 팬은 경기보다 현장 경험을 소비함</p>
                  <p className="pf-tile-insight"><span>내 역할</span>인사이트 도출 · 최종 디자인</p>
                  <p className="pf-tile-insight" data-show="univ"><span>제작</span>어도비 생성형 채우기(AI)로 공간 시안 이미지 제작</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 7. 기타 개인 프로젝트 */}
        <section className="pf-section" aria-labelledby="pf-side-title">
          <div className="wrap">
            <div className="pf-head">
              <p className="pf-eyebrow">Side Projects</p>
              <h2 id="pf-side-title">실험은 계속됩니다</h2>
            </div>
            <article className="pf-tile pf-tile-row pf-side-wish">
              <Fig src="side-wish.jpg" alt="영탑지 소원연못 3D 웹사이트 화면" ratio="16 / 10" />
              <div className="pf-tile-body">
                <p className="pf-tile-meta">개인 프로젝트</p>
                <h3>영탑지 소원연못</h3>
                <p>온라인 절 트렌드를 충남대 영탑지로 옮긴 3D 웹사이트. 시즌에 맞춰 재런칭을 준비하고 있습니다.</p>
                <a className="pf-link" href="https://yeongtapji-wish.vercel.app/" rel="noopener" target="_blank">사이트 보기 ↗</a>
              </div>
            </article>
          </div>
        </section>

        {/* 8. More + Tools */}
        <section className="pf-section pf-light" aria-labelledby="pf-more-title">
          <div className="wrap pf-more">
            <div>
              <p className="pf-eyebrow">More</p>
              <h2 id="pf-more-title" className="pf-h2-sm">그 밖의 활동</h2>
              <ul className="pf-list">
                <li><span className="pf-kind">대외활동</span><b>외교부 해외안전여행 서포터즈 22기</b>공공 안전 정보를 1분 영상으로</li>
                <li><span className="pf-kind">대외활동</span><b>DBpia AI 마스터 1기</b>학술 AI 서비스를 숏폼으로</li>
                <li><span className="pf-kind">교내 활동</span><b>충남대 대동제 디자인 총괄 (2025)</b>3~4만 명 규모 축제</li>
              </ul>
            </div>
            <div>
              <p className="pf-eyebrow">Tools</p>
              <h2 className="pf-h2-sm">다루는 툴</h2>
              <dl className="pf-tools">
                {([
                  ['콘텐츠 제작', ['Photoshop', 'Illustrator', 'Premiere Pro']],
                  ['기획 및 협업', ['Figma', 'Notion']],
                  ['AI 및 자동화', ['Claude Code']],
                ] as [string, string[]][]).map(([k, tools]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd><ul className="pf-chips">{tools.map((t) => <li key={t}>{t}</li>)}</ul></dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* 9. Contact */}
        <section className="pf-contact pf-dark" id="contact" aria-labelledby="pf-contact-title">
          <div className="wrap">
            <p className="pf-eyebrow">Contact</p>
            <h2 id="pf-contact-title">끝까지 봐 주셔서 감사합니다</h2>
            <p className="pf-contact-lead">궁금하신 점이나 함께 이야기 나누고 싶은 부분이 있으시면 편하게 연락 주세요.<br />확인하는 대로 정성껏 답변드리겠습니다.</p>
            <div className="pf-contact-btns">
              <a className="pf-btn pf-btn-primary" href="mailto:s.seoyeon1011@gmail.com">이메일 보내기</a>
              <a className="pf-btn pf-btn-ghost" href="https://www.instagram.com/ref.yeon/" rel="me noopener" target="_blank">인스타그램</a>
              {PDF_URL && <a className="pf-btn pf-btn-ghost" href={PDF_URL} download="심서연_포트폴리오.pdf">PDF 다운로드</a>}
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
