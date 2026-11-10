'use client';
// 전체 글: 검색 + 분류 필터. 처음 HTML에는 모든 카드가 들어 있어 검색엔진이 그대로 읽는다.
// 글이 없는 분류는 필터 버튼을 보여 주지 않는다.
import { useEffect, useState } from 'react';
import type { CatSlug } from '@/lib/types';
import { CATS, CAT_ORDER, dot } from '@/lib/site';
import PostCard, { type CardData } from './PostCard';

export interface FilterItem extends CardData {
  keywords: string;
}

export default function PostFilter({ posts }: { posts: FilterItem[] }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'all' | CatSlug>('all');
  const cats = CAT_ORDER.filter((c) => posts.some((p) => p.category === c));

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('cat');
    if (c && (CAT_ORDER as string[]).includes(c)) setCat(c as CatSlug);
  }, []);

  const query = q.trim().toLowerCase();
  const visible = posts.map((p) => {
    const okCat = cat === 'all' || p.category === cat;
    const hay = [CATS[p.category].label, p.title, p.cardText, dot(p.pubDate), p.keywords].join(' ').toLowerCase();
    return okCat && (!query || hay.includes(query));
  });
  const shown = visible.filter(Boolean).length;

  const btn = (key: 'all' | CatSlug, label: string) => (
    <button key={key} type="button" aria-pressed={cat === key} onClick={() => setCat(key)}>{label}</button>
  );

  return (
    <>
      <div className="filter">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="예: 숏폼, SEO, ADsP" aria-label="글 검색" />
        <div className="filter-buttons">
          {btn('all', '전체')}
          {cats.map((c) => btn(c, CATS[c].label))}
        </div>
      </div>
      <div className="grid">
        {posts.map((p, i) => <PostCard key={p.slug} post={p} hidden={!visible[i]} />)}
      </div>
      <p className="empty" style={{ display: shown ? 'none' : 'block' }}>조건에 맞는 글이 없습니다.</p>
    </>
  );
}
