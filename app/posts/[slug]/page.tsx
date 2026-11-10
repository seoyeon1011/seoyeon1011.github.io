import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Shell from '@/components/Shell';
import Article from '@/components/Article';
import JsonLd from '@/components/JsonLd';
import ReadingProgress from '@/components/ReadingProgress';
import { CATS, OG_BASE, SITE, abs, catPath, postPath } from '@/lib/site';
import { getAdjacent, getAllPosts, getPost, getRelated } from '@/lib/posts';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return {};
  const url = abs(postPath(p.slug));
  const ogImage = p.imageUrls[0] || abs(SITE.ogImage);
  return {
    title: p.seoTitle.trim(),
    description: p.desc.trim(),
    alternates: { canonical: url },
    robots: p.indexable ? { index: true, follow: true, 'max-image-preview': 'large' } : { index: false, follow: true },
    openGraph: {
      ...OG_BASE,
      type: 'article',
      title: p.title,
      description: p.desc.trim(),
      url,
      images: [ogImage],
      publishedTime: p.pubDate,
      modifiedTime: p.modDate || p.pubDate,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const url = abs(postPath(p.slug));
  const cat = CATS[p.category];
  const faqs = p.faqs.filter((f) => f.q.trim() && f.a.trim());
  const adj = getAdjacent(p);

  const ld: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.desc.trim(),
      datePublished: p.pubDate,
      dateModified: p.modDate || p.pubDate,
      inLanguage: 'ko-KR',
      keywords: p.ldKeywords || p.keyword.trim(),
      image: p.imageUrls.length ? p.imageUrls : [abs(SITE.ogImage)],
      mainEntityOfPage: url,
      author: { '@type': 'Person', name: SITE.author, url: abs('/about') },
      publisher: { '@type': 'Person', name: SITE.author },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: abs('/') },
        { '@type': 'ListItem', position: 2, name: cat.label, item: abs(catPath(p.category)) },
        { '@type': 'ListItem', position: 3, name: p.crumb },
      ],
    },
  ];
  if (faqs.length && p.faqSchema !== false) {
    ld.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q.trim(), acceptedAnswer: { '@type': 'Answer', text: f.a.trim() } })),
    });
  }

  return (
    <Shell current={p.category}>
      <ReadingProgress />
      <JsonLd data={ld} />
      <main id="main" className="wrap">
        <Article view={{
          slug: p.slug,
          category: p.category,
          crumb: p.crumb,
          title: p.title,
          pubDate: p.pubDate,
          modDate: p.modDate,
          minutes: p.minutes,
          summary: p.summary,
          bodyHtml: p.bodyHtml,
          faqs: p.faqs,
          related: getRelated(p).map((r) => ({ slug: r.slug, category: r.category, title: r.title })),
          editable: true,
          prev: adj.prev && { slug: adj.prev.slug, title: adj.prev.title },
          next: adj.next && { slug: adj.next.slug, title: adj.next.title },
        }} />
      </main>
    </Shell>
  );
}
