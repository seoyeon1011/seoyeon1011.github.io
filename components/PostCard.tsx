import type { CatSlug } from '@/lib/types';
import { CATS, dot, postPath } from '@/lib/site';

export interface CardData {
  slug: string;
  category: CatSlug;
  title: string;
  cardText: string;
  pubDate: string;
}

export default function PostCard({ post, hidden }: { post: CardData; hidden?: boolean }) {
  return (
    <article className="card" style={hidden ? { display: 'none' } : undefined}>
      <span className="tag">{CATS[post.category].label}</span>
      <h3><a href={postPath(post.slug)}>{post.title}</a></h3>
      <p>{post.cardText}</p>
      <span className="meta"><time dateTime={post.pubDate}>{dot(post.pubDate)}</time></span>
    </article>
  );
}

/** 함께 읽으면 좋은 글: 태그와 제목만 */
export function RelatedCard({ post }: { post: Pick<CardData, 'slug' | 'category' | 'title'> }) {
  return (
    <article className="card">
      <span className="tag">{CATS[post.category].label}</span>
      <h3><a href={postPath(post.slug)}>{post.title}</a></h3>
    </article>
  );
}
