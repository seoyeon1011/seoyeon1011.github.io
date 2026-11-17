import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { Bodoni_Moda } from 'next/font/google';
import Shell from '@/components/Shell';
import JsonLd from '@/components/JsonLd';
import { OG_BASE, SITE, abs } from '@/lib/site';
import './portfolio.css';

// 포트폴리오 상세페이지. 내용 원본은 Claude Docs "심서연 콘텐츠 마케터 포트폴리오 (Master)" 문서이며,
// 면접 대비 메모·회사별 변형 가이드·남은 할 일처럼 제출본에 넣지 않는 부분은 옮기지 않았다.
// 사진 자리는 <Ph> 로 표시한다. 실제 이미지를 넣을 때는 <Ph> 를 <figure className="pf-figure"><img .../></figure> 로 바꾼다.
// 연락처는 사용자가 공개를 요청한 것만 쓴다 (CLAUDE.md)

const display = Bodoni_Moda({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--pf-display', display: 'swap' });

const title = `포트폴리오 | 콘텐츠 마케터 심서연`;
const description = '타깃을 직접 파고들어 진짜 결정권자를 찾고, 공유하고 싶어지는 콘텐츠로 구매까지 연결하는 콘텐츠 마케터 심서연의 포트폴리오입니다. 광고비 0원 굿즈 완판, 학원 채널 전략, 스포츠센터 SNS 운영 사례를 담았습니다.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs('/about') },
  openGraph: { ...OG_BASE, type: 'profile', title, description: '콘텐츠 마케터 심서연 포트폴리오', url: abs('/about') },
};

/* ---------- 작은 부품 ---------- */

/** 사진 자리. ratio 는 가로/세로 비율 */
function Ph({ label, ratio = '4 / 3', tone = 'light' }: { label: string; ratio?: string; tone?: 'light' | 'dark' }) {
  return (
    <div className={`pf-ph pf-ph--${tone}`} style={{ aspectRatio: ratio } as CSSProperties} role="img" aria-label={`이미지 자리: ${label}`}>
      <span className="pf-ph-tag">IMAGE</span>
      <span className="pf-ph-label">{label}</span>
    </div>
  );
}

/** 아직 숫자가 없는 칸 */
function Fill({ children }: { children: ReactNode }) {
  return <span className="pf-fill">[직접 작성] {children}</span>;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pf-row">
      <h3 className="pf-row-label">{label}</h3>
      <div className="pf-row-body">{children}</div>
    </div>
  );
}

function Metrics({ items }: { items: { v: string; u?: string; t: string }[] }) {
  return (
    <ul className="pf-metrics">
      {items.map((m) => (
        <li key={m.t}>
          <strong><span className="pf-num">{m.v}</span>{m.u && <span className="pf-unit">{m.u}</span>}</strong>
          <span>{m.t}</span>
        </li>
      ))}
    </ul>
  );
}

function Cover({ no, id, kicker, title, lead, meta, glow }: { no: string; id: string; kicker: string; title: ReactNode; lead: string; meta: string[]; glow: 'a' | 'b' | 'c' | 'd' | 'e' }) {
  return (
    <header className={`pf-cover pf-dark pf-glow-${glow}`} id={id}>
      <div className="wrap">
        <p className="pf-cover-kicker"><span>{kicker}</span><i aria-hidden="true" /></p>
        <div className="pf-cover-no" aria-hidden="true">{no}</div>
        <h2 className="pf-cover-title">{title}</h2>
        <p className="pf-cover-lead">{lead}</p>
        {meta.length > 0 && <ul className="pf-cover-meta">{meta.map((m) => <li key={m}>{m}</li>)}</ul>}
      </div>
    </header>
  );
}

/* ---------- 데이터 ---------- */

const STATS = [
  { v: '1,500', u: '만 원', label: '매출', desc: '광고비 0원, 축제 이틀 만에 굿즈 3,000개 완판' },
  { v: '45', u: '%', label: '신규 등록', desc: '학원 신규 등록생 20명 중 9명이 내가 키운 강사 인스타그램으로 유입' },
  { v: '2', u: '배', label: '팔로워', desc: '스포츠센터 공식 계정 2,000명대 → 4,150명' },
];

const PRINCIPLES = [
  { t: '진짜 타깃을 직접 확인합니다.', d: '결제하는 사람과 선택하는 사람이 다를 수 있다는 전제로, 현장 인터뷰와 커뮤니티 조사로 실제 결정권자를 찾습니다.' },
  { t: '그들만 아는 이야기를 콘셉트로 만듭니다.', d: '수강신청, 부산 사투리, 우리 쌤처럼 타깃끼리만 공유하는 경험에서 출발하면 광고비 없이도 공유가 일어납니다.' },
  { t: '반응을 보고 바로 고칩니다.', d: '판매가 둔화되면 당일에 접점을 바꾸고, 문의가 막히면 응대 체계를 새로 만듭니다.' },
];

const TOC = [
  { href: '#case-1', label: 'Case 01 클리커' },
  { href: '#case-2', label: 'Case 02 학원' },
  { href: '#case-3', label: 'Case 03 SPOREX' },
  { href: '#idea-lab', label: 'Idea Lab' },
  { href: '#side', label: 'Side Projects' },
  { href: '#more', label: 'More' },
  { href: '#contact', label: 'Contact' },
];

const MORE = [
  { name: '외교부 해외안전여행 서포터즈 22기', when: '2026.01 ~ 2026.12', what: '안전한 해외여행 정보를 1분 영상으로 제작 ("1분 만에 안전한 해외여행 가는 법"), 오프라인 행사 운영' },
  { name: 'DBpia AI 마스터 1기', when: '2026.07 ~ 2026.08', what: '학술 AI 서비스를 알리는 숏폼 콘텐츠 기획 및 제작' },
  { name: '충남대학교 총학생회 대동제 디자인 총괄', when: '2025', what: '3~4만 명 규모 축제의 홍보물부터 SNS까지 디자인 전반 총괄' },
  { name: '아모레퍼시픽 라네즈 공모전', when: '', what: '출품 (3인 팀)' },
];

const TOOLS = [
  { title: 'Design & Video', items: ['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects', 'Figma', 'Adobe 생성형 채우기'] },
  { title: 'Operation & AI', items: ['Notion', '카카오톡 채널 관리자', 'ChatGPT', 'Claude', 'Claude Code', 'NotebookLM'] },
];

/* ---------- 페이지 ---------- */

export default function AboutPage() {
  return (
    <Shell current="about">
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

      <main id="main" className={`pf ${display.variable}`}>

        {/* ===== 표지 ===== */}
        <section className="pf-hero pf-dark" aria-labelledby="pf-hero-title">
          <div className="wrap">
            <p className="pf-kicker"><span>Portfolio 2026</span><i aria-hidden="true" /></p>
            <h1 id="pf-hero-title" className="pf-hero-title">
              <span className="pf-hero-en" aria-hidden="true">Content<br />Marketer</span>
              <span className="pf-hero-ko">콘텐츠 마케터 심서연</span>
            </h1>
            <p className="pf-hero-lead">타깃을 직접 파고들어 진짜 결정권자를 찾고, 그들이 서로 공유하고 싶어지는 콘텐츠로 구매까지 연결합니다.</p>
            <div className="pf-hero-foot">
              <i aria-hidden="true" />
              <ul><li>Insight</li><li>Content</li><li>Conversion</li></ul>
            </div>
          </div>
        </section>

        {/* ===== 숫자 3개 ===== */}
        <section className="pf-stats pf-dark" aria-label="핵심 성과">
          <div className="wrap">
            <ul>
              {STATS.map((s) => (
                <li key={s.label}>
                  <span className="pf-stat-label">{s.label}</span>
                  <strong><span className="pf-num">{s.v}</span><span className="pf-unit">{s.u}</span></strong>
                  <p>{s.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===== 일하는 방식 ===== */}
        <section className="pf-light pf-how" aria-labelledby="pf-how-title">
          <div className="wrap">
            <p className="pf-eyebrow">How I Work</p>
            <h2 id="pf-how-title" className="pf-h2">저는 이렇게 일합니다</h2>
            <div className="pf-motto">
              <p className="pf-motto-word" aria-hidden="true"><span>spark</span>:<span>cling</span></p>
              <p>spark:cling은 제가 일하는 방식입니다. 좋은 콘텐츠는 번뜩이는 아이디어(spark)에서 시작하지만, 결과는 끝까지 붙잡는 태도(cling)에서 나온다고 믿습니다. 사람들이 실제로 찾고 읽는 콘텐츠를 기획하고, 데이터를 보며 다시 고치고, 성과로 이어질 때까지 놓지 않습니다.</p>
            </div>
            <ol className="pf-principles">
              {PRINCIPLES.map((p, i) => (
                <li key={p.t}>
                  <span className="pf-principle-no">0{i + 1}</span>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== 목차 ===== */}
        <nav className="pf-toc" aria-label="포트폴리오 목차">
          <div className="wrap">
            <ul>{TOC.map((t) => <li key={t.href}><a href={t.href}>{t.label}</a></li>)}</ul>
          </div>
        </nav>

        {/* ===== Case 1 ===== */}
        <article className="pf-case" aria-labelledby="case-1-title">
          <Cover
            no="01" id="case-1" kicker="Case 01" glow="a"
            title={<span id="case-1-title">3,000명의 &lsquo;확정하기&rsquo; 버튼</span>}
            lead="광고비 0원, 축제 이틀 만에 클리커 굿즈 3,000개 완판 (매출 1,500만 원)"
            meta={['충남대학교 총학생회 대동제', '2026', '축제준비위원회 굿즈제작팀', '콘셉트 기획 및 홍보 전략 리드']}
          />
          <div className="pf-light pf-body">
            <div className="wrap">
              <Ph label="클리커 실물 사진 (대표 이미지)" ratio="16 / 8" />
              <div className="pf-rows">
                <Row label="Problem">
                  <p>축제 이틀 동안 굿즈 3,000개를 팔아야 했습니다. 시장조사를 해 보니 시중 클리커는 네잎클로버 같은 뻔한 디자인뿐이라 차별점이 없었습니다.</p>
                </Row>
                <Row label="Insight">
                  <p>축제 방문객의 90% 이상은 재학생입니다. 이들을 묶는 건 &ldquo;충남대생만 아는 고통&rdquo;, 바로 수강신청이었습니다. 아침 일찍 일어나 간절하게 누르던 &lsquo;확정하기&rsquo; 버튼은 재학생 모두의 공통 기억입니다.</p>
                </Row>
                <Row label="Concept">
                  <p className="pf-concept">「무선 수강신청」</p>
                  <p>수강신청 사이트 UI를 그대로 옮긴 클리커로, 그 간절함을 웃음과 공감, 소장 욕구로 바꿨습니다.</p>
                  <Ph label="수강신청 사이트와 클리커 비교 컷" ratio="16 / 9" />
                </Row>
                <Row label="Execution">
                  <dl className="pf-dl">
                    <div><dt>채널 설계</dt><dd>인스타그램(메인), 학과 단톡방(재학생 직접 도달), 현장 부스(체험)</dd></div>
                    <div><dt>런칭 카피</dt><dd className="pf-quote">&ldquo;딸-깍, 무선 수강신청의 시대는 왔다&rdquo;</dd></div>
                    <div><dt>중간 개선</dt><dd>
                      첫날 50% 이상 팔린 뒤 둘째 날 판매가 둔화되자 두 가지를 바로 바꿨습니다.
                      <ul>
                        <li>현장 인력이 돌아다니며 직접 눌러 보게 하는 체험형 접점으로 전환 (클리커는 손맛이 구매 동기)</li>
                        <li>기존 밈에 클리커를 합성한 카드뉴스를 연속 발행해 노출 빈도 강화</li>
                      </ul>
                    </dd></div>
                  </dl>
                  <div className="pf-gallery pf-gallery-3">
                    <Ph label="런칭 게시물" ratio="4 / 5" />
                    <Ph label="밈 카드뉴스 1" ratio="4 / 5" />
                    <Ph label="밈 카드뉴스 2" ratio="4 / 5" />
                  </div>
                </Row>
                <Row label="Result">
                  <Metrics items={[
                    { v: '3,000', u: '개', t: '이틀 만에 전량 판매' },
                    { v: '1,500', u: '만 원', t: '매출 (개당 5,000원), 광고비 0원' },
                    { v: '1.5', u: '만 회', t: '런칭 게시물 조회수 (팔로워 1.1만 대비 136%, 비팔로워까지 확산)' },
                  ]} />
                  <p>현장에서는 친구끼리 와서 함께 구매하는 모습이 많았고, 만족도 조사 자유 응답에는 &ldquo;다음에도 팔아 달라&rdquo;는 요청이 나왔습니다.</p>
                  <Ph label="현장 부스 사진" ratio="16 / 9" />
                </Row>
                <Row label="My Role">
                  <ul className="pf-role">
                    <li><span>팀 결정</span>축제 굿즈 품목으로 클리커 선정</li>
                    <li className="is-mine"><span>내 결정</span>수강신청 UI 콘셉트 제안 및 채택, 런칭 카피, 둘째 날 카드뉴스 연속 발행 전략</li>
                    <li><span>실행</span>굿즈 디자인, SNS 콘텐츠 제작</li>
                  </ul>
                </Row>
                <Row label="Learning">
                  <p className="pf-learning">사람들은 물건이 아니라 <strong>&ldquo;우리끼리 아는 이야기&rdquo;</strong>를 삽니다. 타깃만 공유하는 경험을 찾으면 광고비 없이도 자발적인 확산이 일어납니다. 그리고 반응은 계획대로 오지 않기 때문에, 판매 흐름을 보고 바로 접점을 바꾸는 실행력이 콘셉트만큼 중요합니다.</p>
                </Row>
              </div>
            </div>
          </div>
        </article>

        {/* ===== Case 2 ===== */}
        <article className="pf-case" aria-labelledby="case-2-title">
          <Cover
            no="02" id="case-2" kicker="Case 02" glow="b"
            title={<span id="case-2-title">학원을 고르는 건 학부모가 아니었다</span>}
            lead="결제자와 결정자를 분리한 채널 전략으로 재원생 20% 성장"
            meta={['대전 온율학원 벨라영어', '2024.01 ~ 현재', '마케팅 담당 (정규직 전환 제안)']}
          />
          <div className="pf-light pf-body">
            <div className="wrap">
              <div className="pf-rows">
                <Row label="Insight">
                  <p>학원비는 학부모가 내지만, 이 학군에서 학원을 고르는 건 학생이었습니다. 인스타그램, 네이버 카페, 학생 인터뷰로 학군 문화를 조사해 보니 학생들은 친구 추천으로 학원을 정했습니다.</p>
                </Row>
                <Row label="Strategy">
                  <div className="pf-split">
                    <div className="pf-split-card">
                      <p className="pf-split-role">학부모 <span>결제자 · 신뢰</span></p>
                      <dl>
                        <div><dt>채널</dt><dd>학원 밴드, 블로그, 사이트</dd></div>
                        <div><dt>콘텐츠</dt><dd>수업 홍보, 학원 소식</dd></div>
                      </dl>
                    </div>
                    <div className="pf-split-card is-key">
                      <p className="pf-split-role">학생 <span>결정자 · 선택</span></p>
                      <dl>
                        <div><dt>채널</dt><dd>강사 개인 인스타그램</dd></div>
                        <div><dt>콘텐츠</dt><dd>밈 릴스, 친밀감 콘텐츠</dd></div>
                      </dl>
                    </div>
                  </div>
                  <p>학부모 홍보 비중을 줄이고 학생 노출을 늘렸습니다. &ldquo;강사도 브랜드&rdquo;라는 관점에서 강사 개인 계정을 키워 친밀도와 인지도를 높였습니다.</p>
                </Row>
                <Row label="Execution">
                  <ul>
                    <li>밈을 활용한 강사 릴스 기획, 촬영, 편집</li>
                    <li>강사 굿즈 제작</li>
                    <li>학원 공식 채널(밴드, 블로그, 사이트) 콘텐츠 제작</li>
                  </ul>
                  <div className="pf-gallery pf-gallery-3">
                    <Ph label="5.6만 회 릴스 캡처 (조회수 보이게)" ratio="9 / 16" />
                    <Ph label="강사 계정 프로필" ratio="9 / 16" />
                    <Ph label="강사 굿즈 사진" ratio="9 / 16" />
                  </div>
                </Row>
                <Row label="Result">
                  <Metrics items={[
                    { v: '100→120', u: '명', t: '재원생 순증 20명 (20%↑)' },
                    { v: '45', u: '%', t: '신규 등록생 20명 중 9명이 강사 인스타그램 콘텐츠로 유입 (친구가 계정을 공유)' },
                    { v: '2,191', u: '명', t: '강사 계정 팔로워, 약 1,190명에서 84%↑ (2026.11.17 기준)' },
                    { v: '5.6', u: '만 회', t: '최고 조회수 릴스 (팔로워의 약 25배 도달)' },
                  ]} />
                  <ul>
                    <li>예비소집일 전단 배포 현장에서 학생들이 &ldquo;벨라쌤이다! 인스타에서 봤어요&rdquo;라고 먼저 알아봄</li>
                    <li>내부 평가로 정규직 전환 제안</li>
                  </ul>
                  <Ph label="인스타그램 인사이트 화면" ratio="16 / 9" />
                </Row>
                <Row label="Learning">
                  <p className="pf-learning">돈을 내는 사람과 선택하는 사람은 다를 수 있습니다. 진짜 결정권자를 찾아 그들의 언어로 말하고, 친구에게 보여 주고 싶은 콘텐츠를 만들면 콘텐츠가 입소문의 재료가 됩니다.</p>
                </Row>
              </div>
            </div>
          </div>
        </article>

        {/* ===== Case 3 ===== */}
        <article className="pf-case" aria-labelledby="case-3-title">
          <Cover
            no="03" id="case-3" kicker="Case 03" glow="c"
            title={<span id="case-3-title">고객이 머무는 구조를 만들다</span>}
            lead="문의 응대 체계 구축으로 컴플레인 0건, 공식 계정 팔로워 2배"
            meta={['충남대학교 SPOREX 스포츠 복합센터', '2025.01 ~ 현재', '콘텐츠·SNS 마케팅 총괄 (교내 근로)']}
          />
          <div className="pf-light pf-body">
            <div className="wrap">
              <div className="pf-rows">
                <Row label="Problem">
                  <p>인스타그램은 운영되고 있었지만 DM 응대가 전혀 없어 컴플레인이 들어오고 있었습니다. 문의 대응은 현장 인포데스크에만 의존했습니다.</p>
                </Row>
                <Row label="01 Touchpoint">
                  <p className="pf-sub">고객 접점 재설계</p>
                  <div className="pf-ba" role="table" aria-label="고객 접점 Before After">
                    <div className="pf-ba-head" role="row"><span role="columnheader" /><span role="columnheader">Before</span><span role="columnheader">After</span></div>
                    {[
                      ['온라인 문의', 'DM 응대 없음, 컴플레인 발생', '카카오톡 채널 개설, 문의 창구 일원화'],
                      ['현장 응대', '인포데스크 개인 역량에 의존', '인포데스크용, 종목별 팀장용 응대 매뉴얼'],
                      ['문의 관리', '기록 없음', '노션으로 문의 축적 후 FAQ 배포'],
                    ].map(([k, b, a]) => (
                      <div className="pf-ba-row" role="row" key={k}>
                        <span role="rowheader">{k}</span><span role="cell" className="pf-ba-before">{b}</span><span role="cell" className="pf-ba-after">{a}</span>
                      </div>
                    ))}
                    <div className="pf-ba-row pf-ba-result" role="row">
                      <span role="rowheader">결과</span><span role="cell" className="pf-ba-before">컴플레인 발생</span><span role="cell" className="pf-ba-after"><strong>문의 관련 컴플레인 0건</strong></span>
                    </div>
                  </div>
                  <div className="pf-gallery pf-gallery-2">
                    <Ph label="카카오톡 채널 화면" ratio="4 / 3" />
                    <Ph label="노션 FAQ 화면 (개인정보 가림)" ratio="4 / 3" />
                  </div>
                </Row>
                <Row label="02 Content">
                  <p className="pf-sub">콘텐츠로 키운 계정</p>
                  <Metrics items={[
                    { v: '4,150', u: '명', t: '공식 계정 팔로워, 2,000명대에서 약 2배' },
                    { v: '7.1', u: '만 회', t: '밈 릴스 조회수 (팔로워의 약 17배 도달)' },
                    { v: '1.1', u: '만 회', t: '수영대회 규칙 안내 영상: 딱딱한 규칙을 금호타이어 광고 패러디로 풀어 끝까지 보게 만듦' },
                  ]} />
                  <div className="pf-gallery pf-gallery-2 pf-gallery-narrow">
                    <Ph label="7.1만 회 밈 릴스 캡처" ratio="9 / 16" />
                    <Ph label="수영 규칙 안내 영상 캡처" ratio="9 / 16" />
                  </div>
                </Row>
                <Row label="03 Offline">
                  <p className="pf-sub">외부 기관 협업과 오프라인 행사</p>
                  <ul className="pf-events">
                    <li>
                      <h4>제1회 SPOREX 수영대회</h4>
                      <p>협업 · 아레나코리아</p>
                      <div><span><b>250</b>명 참여</span><span><b>4.9</b>/5 만족도</span></div>
                    </li>
                    <li>
                      <h4>재학생 대상 중간고사 이벤트</h4>
                      <p>자체 기획</p>
                      <div><span><b>200</b>명 참여</span><span><b>4.9</b>/5 만족도</span></div>
                    </li>
                  </ul>
                  <p>촬영, 영상 편집, 업로드, 행사 기획까지 직접 주도해 운영했습니다.</p>
                  <Ph label="수영대회 현장 사진" ratio="16 / 9" />
                </Row>
                <Row label="Learning">
                  <p className="pf-learning">콘텐츠는 관심을 끄는 데서 끝나지 않습니다. 문의하고, 참여하고, 다시 찾아오는 경험까지 이어질 때 비로소 성과가 됩니다.</p>
                </Row>
              </div>
            </div>
          </div>
        </article>

        {/* ===== Idea Lab ===== */}
        <section className="pf-case" aria-labelledby="idea-lab-title">
          <Cover
            no="Lab" id="idea-lab" kicker="Idea Lab" glow="d"
            title={<span id="idea-lab-title">같은 방법론, 다른 브랜드</span>}
            lead="공모전 출품작 2편입니다. 두 팀 모두에서 인사이트 도출과 최종 디자인 정리를 맡았습니다."
            meta={[]}
          />
          <div className="pf-light pf-body">
            <div className="wrap">
              <div className="pf-ideas">
                <article className="pf-idea">
                  <p className="pf-idea-meta">오비맥주 공모전 출품 · 4인 팀</p>
                  <h3>카스 0.0 「ㅋㅅㅇㅇ」</h3>
                  <p className="pf-idea-lead">숫자 &ldquo;0.05%&rdquo;를 일상의 체감 언어로 번역하다</p>
                  <dl className="pf-dl">
                    <div><dt>Insight</dt><dd>2030 대상 자체 설문조사를 해 보니, 논알콜 맥주에 대한 거부감은 &ldquo;알코올이 들어 있다&rdquo;는 인지에서 왔습니다. 설명으로는 못 바꾸고, 직접 느끼게 해야 한다고 판단했습니다.</dd></div>
                    <div><dt>Concept</dt><dd>「ㅋㅅㅇㅇ, 클 수 없음? 카스 0.0!」 카스 0.0(0.05% 미만)이 간장, 고추장, 식빵보다도 알코올이 적다는 사실을 눈으로 비교하게 했습니다.</dd></div>
                    <div><dt>Execution</dt><dd>편의점 식품 진열대에 나란히 놓는 ㅋㅅㅇㅇ존, 지하철역 렌티큘러 OOH와 알코올 저울 홈페이지, ㅋㅅㅇㅇ맵 인증 이벤트, ㅇㅇ티콘</dd></div>
                  </dl>
                  <div className="pf-gallery pf-gallery-2">
                    <Ph label="카스 인사이트 장표" ratio="16 / 9" />
                    <Ph label="알코올 함유량 비교 장표" ratio="16 / 9" />
                  </div>
                </article>
                <article className="pf-idea">
                  <p className="pf-idea-meta">대홍기획 공모전 출품</p>
                  <h3>롯데 자이언츠 「사!직이네」</h3>
                  <p className="pf-idea-lead">부산 사람만 아는 말로 야구장을 부산의 공간으로 바꾸다</p>
                  <dl className="pf-dl">
                    <div><dt>Insight</dt><dd>프로야구 팬층이 2030 여성 중심으로 바뀌며 현장 경험이 중요해졌지만, 사직야구장에는 체험 요소와 부산다움이 부족했습니다.</dd></div>
                    <div><dt>Concept</dt><dd>모래(沙)와 &ldquo;끝내준다&rdquo;는 뜻의 부산 방언 &lsquo;직이네&rsquo;를 합친 「사!직이네」</dd></div>
                    <div><dt>Execution</dt><dd>외야석에 모래사장과 파라솔로 만든 썸머라운지존, 해시태그 #사!직이네 &ldquo;직이는 ___&rdquo; UGC 캠페인과 입장권 추첨</dd></div>
                    <div><dt>Tool</dt><dd>어도비 생성형 채우기(AI)로 공간 시안 이미지 제작</dd></div>
                  </dl>
                  <Ph label="사!직이네 메인 보드" ratio="16 / 9" />
                </article>
              </div>
              <aside className="pf-common">
                <p className="pf-eyebrow">두 기획의 공통점</p>
                <p>카스는 &ldquo;누구나 아는 일상 식품&rdquo;으로, 사직은 &ldquo;부산 사람만 아는 말&rdquo;로 출발했습니다. Case 1의 수강신청과 같은 방법론입니다. <strong>타깃이 이미 가진 경험에서 말을 걸면 설득이 아니라 공감이 됩니다.</strong></p>
              </aside>
            </div>
          </div>
        </section>

        {/* ===== Side Projects ===== */}
        <section className="pf-case" aria-labelledby="side-title">
          <Cover
            no="Side" id="side" kicker="Side Projects" glow="e"
            title={<span id="side-title">일 밖에서도 계속 만듭니다</span>}
            lead="성과보다 실험에 가까운 개인 프로젝트 2개입니다. 두 사이트 모두 직접 기획하고 제작했습니다."
            meta={[]}
          />
          <div className="pf-light pf-body">
            <div className="wrap">
              <div className="pf-ideas">
                <article className="pf-idea">
                  <p className="pf-idea-meta">2026.11 ~ 진행 중</p>
                  <h3>Ref</h3>
                  <p className="pf-idea-lead">AI 자동화로 운영하는 SEO 마케팅 지식창고</p>
                  <p><a className="pf-link" href="https://marketing-ref.vercel.app/">marketing-ref.vercel.app</a></p>
                  <Ph label="Ref 사이트 메인 화면" ratio="16 / 10" />
                  <dl className="pf-dl">
                    <div><dt>구조</dt><dd>매일 트렌드 수집(Claude Code로 만든 스킬 → 슬랙) → SEO 콘텐츠 제작 → 구글 서치콘솔 모니터링</dd></div>
                    <div><dt>자동화</dt><dd>블로그 작성, 성과 분석, 주간 리포트용 Claude Code 스킬 11개를 비개발자로서 직접 제작</dd></div>
                    <div><dt>현재</dt><dd>글 7편 (이미지 SEO, 구글 코어 업데이트, SEO 글쓰기 구조 등) <Fill>색인 페이지 수 / 노출수</Fill></dd></div>
                    <div><dt>측정 계획</dt><dd>색인 → 노출 → 클릭률 → 체류 순서로 검색 유입 구조를 검증</dd></div>
                  </dl>
                </article>
                <article className="pf-idea">
                  <p className="pf-idea-meta">온라인 절 트렌드를 충남대식으로</p>
                  <h3>영탑지 소원연못</h3>
                  <p className="pf-idea-lead">충남대생만 아는 장소에서 출발한 3D 소원 웹사이트</p>
                  <p><a className="pf-link" href="https://yeongtapji-wish.vercel.app/" rel="noopener" target="_blank">yeongtapji-wish.vercel.app</a></p>
                  <Ph label="영탑지 소원연못 사이트 화면" ratio="16 / 10" />
                  <dl className="pf-dl">
                    <div><dt>Concept</dt><dd>유행하는 온라인 절 포맷에 충남대생만 아는 장소 &lsquo;영탑지&rsquo;를 결합. Case 1 클리커와 같은 방법론</dd></div>
                    <div><dt>Execution</dt><dd>과잠 입은 캐릭터, 108배, 종이배·연등 소원 띄우기, 로그인 없이 링크로 참여하는 3D 웹사이트를 직접 제작하고 SNS로 홍보</dd></div>
                    <div><dt>Result</dt><dd><Fill>게시물 조회수, 사이트 방문</Fill> 기대보다 낮은 반응</dd></div>
                    <div><dt>배운 점</dt><dd><Fill>원인 분석</Fill></dd></div>
                    <div><dt>다음 실험</dt><dd>기말고사나 수강신청처럼 간절함이 커지는 시즌에 재런칭하고 에브리타임·학과 단톡방으로 채널 확장</dd></div>
                  </dl>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ===== More ===== */}
        <section className="pf-light pf-more" id="more" aria-labelledby="more-title">
          <div className="wrap">
            <p className="pf-eyebrow">More</p>
            <h2 id="more-title" className="pf-h2">어떤 톤으로든 말할 수 있습니다</h2>
            <p className="pf-h2-lead">학술 AI 툴, 공공 안전 정보, 대학 축제까지 성격이 다른 브랜드의 톤을 다뤄 보았습니다.</p>
            <ol className="pf-timeline">
              {MORE.map((m) => (
                <li key={m.name}>
                  <span className="pf-when">{m.when || 'Contest'}</span>
                  <div><h3>{m.name}</h3><p>{m.what}</p></div>
                </li>
              ))}
            </ol>
            <h3 className="pf-tools-title">Tools</h3>
            <div className="pf-tools">
              {TOOLS.map((g) => (
                <div key={g.title}>
                  <p>{g.title}</p>
                  <ul>{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 연락처 ===== */}
        <section className="pf-contact pf-dark" id="contact" aria-labelledby="contact-title">
          <svg className="pf-flow" viewBox="0 0 600 1200" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="pfFlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2f6bff" stopOpacity=".2" />
                <stop offset=".55" stopColor="#1f5cff" />
                <stop offset="1" stopColor="#dfe9ff" />
              </linearGradient>
              <filter id="pfBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
            </defs>
            <path d="M120 -40 C 260 220, 380 420, 360 640 C 340 860, 260 980, 420 1260 L -60 1260 L -60 -40 Z" fill="url(#pfFlow)" filter="url(#pfBlur)" opacity=".85" />
          </svg>
          <div className="wrap">
            <p className="pf-kicker"><span>Contact</span><i aria-hidden="true" /></p>
            <h2 id="contact-title" className="pf-contact-title"><span aria-hidden="true">Let&rsquo;s talk.</span><span className="pf-sr">연락처</span></h2>
            <p className="pf-contact-lead">함께 만들 이야기가 있다면 편하게 연락 주세요.</p>
            <dl className="pf-contact-list">
              <div><dt>Phone</dt><dd><a href="tel:010-8951-0170">010-8951-0170</a></dd></div>
              <div><dt>Email</dt><dd><a href="mailto:s.seoyeon1011@gmail.com">s.seoyeon1011@gmail.com</a></dd></div>
              <div><dt>Instagram</dt><dd><a href="https://www.instagram.com/ref.yeon/" rel="me noopener" target="_blank">@ref.yeon</a></dd></div>
              <div><dt>GitHub</dt><dd><a href="https://github.com/seoyeon1011" rel="me noopener" target="_blank">github.com/seoyeon1011</a></dd></div>
            </dl>
          </div>
        </section>
      </main>
    </Shell>
  );
}
