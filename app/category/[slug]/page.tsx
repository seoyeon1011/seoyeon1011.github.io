import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Shell from '@/components/Shell';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
import { CATS, CAT_ORDER, OG_BASE, SITE, abs, catPath, isCat } from '@/lib/site';
import { postsByCat } from '@/lib/posts';

export const dynamicParams = false;

export function generateStaticParams() {
  return CAT_ORDER.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  if (!isCat(slug)) return {};
  const c = CATS[slug];
  const title = `${c.title} | ${SITE.name}`;
  return {
    title,
    description: c.metaDescription,
    alternates: { canonical: abs(catPath(slug)) },
    // 글이 하나도 없는 분류 페이지는 얇은 페이지로 보이지 않게 검색에서 뺀다 (글이 생기면 자동으로 노출)
    robots: postsByCat(slug).length ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { ...OG_BASE, type: 'website', title, description: c.ogDescription, url: abs(catPath(slug)) },
  };
}

export default async function CategoryPage({ params }: Props) {
  const slug = (await params).slug;
  if (!isCat(slug)) notFound();
  const c = CATS[slug];
  const posts = postsByCat(slug);
  return (
    <Shell current={slug}>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: abs('/') },
          { '@type': 'ListItem', position: 2, name: c.label, item: abs(catPath(slug)) },
        ],
      }} />
      <main id="main" className="wrap">
        <div className="page-head">
          <nav className="breadcrumb" aria-label="현재 위치"><ol><li><a href="/">홈</a></li><li>{c.label}</li></ol></nav>
          <h1>{c.title}</h1>
          <p dangerouslySetInnerHTML={{ __html: c.intro }} />
        </div>
        <div className="grid" data-cat-list>{posts.map((p) => <PostCard key={p.slug} post={p} />)}</div>
        <p className="cat-empty">{c.empty}</p>
      </main>
    </Shell>
  );
}
