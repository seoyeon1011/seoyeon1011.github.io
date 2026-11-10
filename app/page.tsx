import type { Metadata } from 'next';
import type { CatSlug } from '@/lib/types';
import Shell from '@/components/Shell';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
import { CATS, CAT_ORDER, OG_BASE, SITE, abs, catPath } from '@/lib/site';
import { postsByCat, recentPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  alternates: { canonical: abs('/') },
  robots: { index: true, follow: true },
  openGraph: { ...OG_BASE, type: 'website', title: SITE.title, description: SITE.shortDescription, url: abs('/') },
};

function CatCard({ slug }: { slug: CatSlug }) {
  const c = CATS[slug];
  return (
    <article className="card cat-card">
      <span className="tag">{c.label}</span>
      <h3><a href={catPath(slug)}>{c.title}</a></h3>
      <p>{c.homeDesc}</p>
      <span className="count">글 {postsByCat(slug).length}개</span>
    </article>
  );
}

const inGroup = (g: 'knowledge' | 'portfolio' | 'diary') => CAT_ORDER.filter((c) => CATS[c].group === g);

export default function Home() {
  return (
    <Shell>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE.name,
        alternateName: '레프의 마케팅 지식창고',
        url: abs('/'),
        inLanguage: 'ko-KR',
        author: { '@type': 'Person', name: SITE.author, url: abs('/about.html') },
      }} />
      <main id="main">
        <section className="hero">
          <div className="wrap">
            <p className="eyebrow">Portfolio</p>
            <h1>SPARK:CLING,<br />반짝이는 생각을 끝까지 붙잡습니다.</h1>
            <p>
              spark:cling은 제가 일하는 방식입니다.<br />좋은 콘텐츠는 번뜩이는 아이디어(spark)에서 시작하지만, <br />결과는 끝까지 붙잡는 태도(cling)에서 나온다고 믿습니다.<br />
              사람들이 실제로 찾고 읽는 콘텐츠를 기획하고, 데이터를 보며 다시 고치고, <br />성과로 이어질 때까지 놓지 않습니다.<br />이곳에는 그렇게 만들어온 프로젝트와 그 과정을 담았습니다.
            </p>
            <div className="actions">
              <a className="btn btn-primary" href="/posts.html">전체 글 보기</a>
              <a className="btn btn-ghost" href="/about.html">포트폴리오 소개</a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head"><h2>마케팅 지식</h2></div>
            <div className="grid">{inGroup('knowledge').map((c) => <CatCard key={c} slug={c} />)}</div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <h2>포트폴리오</h2>
              <a href="/about.html">소개</a>
            </div>
            <div className="grid">{inGroup('portfolio').map((c) => <CatCard key={c} slug={c} />)}</div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head"><h2>일기</h2></div>
            <div className="grid">{inGroup('diary').map((c) => <CatCard key={c} slug={c} />)}</div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <h2>최근 글</h2>
              <a href="/posts.html">전체 글</a>
            </div>
            <div className="grid">{recentPosts().map((p) => <PostCard key={p.slug} post={p} />)}</div>
          </div>
        </section>
      </main>
    </Shell>
  );
}
