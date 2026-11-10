import type { Metadata } from 'next';
import Shell from '@/components/Shell';
import PostFilter from '@/components/PostFilter';
import { OG_BASE, SITE, abs } from '@/lib/site';
import { getAllPosts, toCard } from '@/lib/posts';

const title = `전체 글 | ${SITE.name}`;

export const metadata: Metadata = {
  title,
  description: '콘텐츠·SEO 마케팅, Claude Code 자동화, 자격증 공부 기록까지 레프의 지식창고에 있는 모든 글을 주제별로 찾아볼 수 있습니다.',
  alternates: { canonical: abs('/posts') },
  openGraph: { ...OG_BASE, type: 'website', title, description: '콘텐츠·SEO 마케팅, Claude Code 자동화, 자격증 공부 기록 모음', url: abs('/posts') },
};

export default function PostsPage() {
  const items = getAllPosts().map((p) => ({ ...toCard(p), keywords: p.searchText }));
  return (
    <Shell current="posts">
      <main id="main" className="wrap">
        <div className="page-head">
          <h1>전체 글</h1>
          <p>제목이나 키워드로 검색하거나 주제를 눌러 골라 보세요.</p>
        </div>
        <PostFilter posts={items} />
      </main>
    </Shell>
  );
}
