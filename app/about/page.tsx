import type { Metadata } from 'next';
import Shell from '@/components/Shell';
import JsonLd from '@/components/JsonLd';
import { OG_BASE, SITE, abs } from '@/lib/site';

const title = `소개 | ${SITE.name} 콘텐츠·SEO 마케터 포트폴리오`;

export const metadata: Metadata = {
  title,
  description: '콘텐츠·SEO 마케팅과 Claude Code 업무 자동화를 공부하고 실습하는 레프(Ref)의 포트폴리오입니다. 역량, 사용 도구, 실습 기록을 정리했습니다.',
  alternates: { canonical: abs('/about.html') },
  openGraph: { ...OG_BASE, type: 'profile', title, description: '콘텐츠·SEO 마케팅과 Claude Code 자동화 포트폴리오', url: abs('/about.html') },
};

// 연락처는 사용자가 공개를 요청한 것만 쓴다 (CLAUDE.md)
const SKILLS = [
  { num: '01', title: 'Marketing', items: ['Content Marketing', 'SNS Marketing', 'Content Planning', 'SEO', 'Brand Communication', 'Performance Analysis'] },
  { num: '02', title: 'Content Creation', items: ['Short-form Video', 'Video Editing', 'Graphic Design', 'Copywriting', 'Channel Management', 'Visual Direction'] },
];
const TOOLS = [
  { title: 'Design & Video', items: ['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects', 'Figma'] },
  { title: 'AI', items: ['ChatGPT', 'Claude', 'Claude Code', 'NotebookLM'] },
];

function Group({ num, title, items }: { num?: string; title: string; items: string[] }) {
  return (
    <section className="skill-group">
      <h3>{num && <span className="num">{num}</span>}{title}</h3>
      <ul className="chips">{items.map((x) => <li key={x}>{x}</li>)}</ul>
    </section>
  );
}

export default function AboutPage() {
  return (
    <Shell current="about">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: SITE.author,
          url: abs('/about.html'),
          jobTitle: '콘텐츠·SEO 마케터',
          sameAs: ['https://github.com/seoyeon1011', 'https://www.instagram.com/ref.yeon/'],
          knowsAbout: ['SEO', '콘텐츠 마케팅', 'Claude Code', '마케팅 자동화', '데이터 분석'],
        },
      }} />
      <main id="main" className="wrap">
        <div className="read">
          <div className="page-head">
            <p className="eyebrow">ABOUT</p>
            <h1>아이디어에서 시작해<br />결과까지 책임지는 콘텐츠 마케터, 심서연입니다</h1>
            <p>Ref는 Reference(참고 자료)에서 따온 이름입니다. 공부하고 실습한 내용을 누군가 다시 찾아볼 수 있는 자료로 남기는 것이 이 사이트의 목표입니다.</p>
          </div>

          <div className="prose">
            <div className="todo">콘텐츠를 만드는 것을 넘어, 콘텐츠가 가진 가능성을 마케팅으로 연결하는 과정에 관심이 있습니다. 현재 콘텐츠 마케팅과 SEO를 공부하며 기획력과 데이터 기반의 마케팅 역량을 키워가고 있습니다.</div>

            <h2 id="skills">Skills</h2>
            <div className="skill-groups">{SKILLS.map((g) => <Group key={g.title} {...g} />)}</div>

            <h2 id="tools">Tools &amp; AI</h2>
            <div className="skill-groups">{TOOLS.map((g) => <Group key={g.title} {...g} />)}</div>

            <h2 id="practice">프로젝트</h2>
            <h3>프로젝트 이름</h3>
            <p>내용 채우기</p>
            <h3>프로젝트 이름</h3>
            <p>내용 채우기</p>

            <h2 id="contact">연락처</h2>
            <dl className="contact-list">
              <div><dt>Phone</dt><dd><a href="tel:010-8951-0170">010-8951-0170</a></dd></div>
              <div><dt>Email</dt><dd><a href="mailto:s.seoyeon1011@gmail.com">s.seoyeon1011@gmail.com</a></dd></div>
              <div><dt>Instagram</dt><dd><a href="https://www.instagram.com/ref.yeon/" rel="me noopener" target="_blank">@ref.yeon</a></dd></div>
              <div><dt>GitHub</dt><dd><a href="https://github.com/seoyeon1011" rel="me noopener" target="_blank">github.com/seoyeon1011</a></dd></div>
            </dl>
          </div>
        </div>
      </main>
    </Shell>
  );
}
