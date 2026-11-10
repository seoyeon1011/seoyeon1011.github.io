// 글 카드. 썸네일이 없으면 분류 색으로 칠한 카드에 분류 이름을 크게 넣는다.
import type { CatSlug } from '@/lib/types';
import { CATS, dot, postPath } from '@/lib/site';

export interface CardData {
  slug: string;
  category: CatSlug;
  title: string;
  cardText: string;
  pubDate: string;
  thumb?: string;
}

export function Tag({ category }: { category: CatSlug }) {
  return <span className={'tag g-' + CATS[category].group}>{CATS[category].label}</span>;
}

function Thumb({ post, eager }: { post: CardData; eager?: boolean }) {
  const cat = CATS[post.category];
  if (post.thumb) {
    return (
      <div className="thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.thumb} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" />
      </div>
    );
  }
  return (
    <div className={'thumb thumb-empty g-' + cat.group} aria-hidden="true">
      <span>{cat.label}</span>
    </div>
  );
}

export default function PostCard({ post, hidden, size, eager }: { post: CardData; hidden?: boolean; size?: 'lg'; eager?: boolean }) {
  return (
    <article className={'card' + (size === 'lg' ? ' card-lg' : '')} style={hidden ? { display: 'none' } : undefined}>
      <Thumb post={post} eager={eager} />
      <div className="card-body">
        <Tag category={post.category} />
        <h3><a href={postPath(post.slug)}>{post.title}</a></h3>
        <p>{post.cardText}</p>
        <span className="meta"><time dateTime={post.pubDate}>{dot(post.pubDate)}</time></span>
      </div>
    </article>
  );
}

/** 함께 읽으면 좋은 글: 태그와 제목만 */
export function RelatedCard({ post }: { post: Pick<CardData, 'slug' | 'category' | 'title'> }) {
  return (
    <article className="card card-mini">
      <div className="card-body">
        <Tag category={post.category} />
        <h3><a href={postPath(post.slug)}>{post.title}</a></h3>
      </div>
    </article>
  );
}
