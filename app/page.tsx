import type { Metadata } from 'next';
import Shell from '@/components/Shell';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
import GroupTabs from '@/components/GroupTabs';
import { CAT_GROUPS, OG_BASE, SITE, abs, catPath, catsInGroup } from '@/lib/site';
import { getAllPosts, recentPosts, toCard } from '@/lib/posts';

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  alternates: { canonical: abs('/') },
  robots: { index: true, follow: true },
  openGraph: { ...OG_BASE, type: 'website', title: SITE.title, description: SITE.shortDescription, url: abs('/') },
};

export default function Home() {
  const all = getAllPosts();
  const recent = recentPosts().map(toCard);
  const groups = CAT_GROUPS.map((g) => {
    const cats = catsInGroup(g.key);
    // 묶음 전체 보기: 분류가 하나면 그 분류 페이지, 여럿이면 첫 분류 페이지
    return { key: g.key, posts: all.filter((p) => cats.includes(p.category)).map(toCard), href: catPath(cats[0]) };
  });

  return (
    <Shell>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE.name,
        alternateName: '레프의 마케팅 지식창고',
        url: abs('/'),
        inLanguage: 'ko-KR',
        author: { '@type': 'Person', name: SITE.author, url: abs('/about') },
      }} />
      <main id="main">
        <section className="hero">
          <div className="wrap">
            <p className="eyebrow">Content Trend &amp; Marketing Note</p>
            <h1><span className="spark">SPARK:CLING</span><br />번뜩였다 사라지는 생각을,<br />쓸 수 있는 전략으로</h1>
            <div className="actions">
              <a className="btn btn-primary" href="/posts">전체 글 보기</a>
              <a className="btn btn-ghost" href="/about">포트폴리오 소개</a>
            </div>
            <ul className="hero-chips" aria-label="주제">
              {CAT_GROUPS.map((g) => (
                <li key={g.key}><a className={'chip g-' + g.key} href={catPath(catsInGroup(g.key)[0])}>{g.label}</a></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <h2>최신 글</h2>
              <a href="/posts">전체 글</a>
            </div>
            <div className="bento">
              {recent.map((p, i) => <PostCard key={p.slug} post={p} size={i === 0 ? 'lg' : undefined} eager={i === 0} />)}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head"><h2>주제별로 보기</h2></div>
            <GroupTabs groups={groups} />
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="cta-band">
              <div>
                <p className="eyebrow">Instagram</p>
                <h2>인스타그램에서도 만나요</h2>
                <p>레프의 콘텐츠 이야기는 인스타그램 {SITE.instagramHandle}에서도 볼 수 있습니다.</p>
              </div>
              <a className="btn btn-primary" href={SITE.instagram} rel="me noopener" target="_blank">{SITE.instagramHandle} 팔로우</a>
            </div>
          </div>
        </section>
      </main>
    </Shell>
  );
}
