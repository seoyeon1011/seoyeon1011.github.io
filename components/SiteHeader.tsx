'use client';
// 헤더 메뉴. 메뉴 순서: 전체 글 / 마케팅 지식(콘텐츠·SEO, 마케팅 전략) / 포트폴리오(프로젝트, 자동화 실습, 자격증, 소개) / 일기
import { useEffect, useState } from 'react';
import type { CatSlug } from '@/lib/types';
import { CATS, CAT_ORDER, catPath } from '@/lib/site';

export type NavKey = CatSlug | 'posts' | 'about';

interface Item { key: NavKey; href: string; label: string }

const catItem = (c: CatSlug): Item => ({ key: c, href: catPath(c), label: CATS[c].label });
const GROUPS: { label: string; items: Item[] }[] = [
  { label: '마케팅 지식', items: CAT_ORDER.filter((c) => CATS[c].group === 'knowledge').map(catItem) },
  { label: '포트폴리오', items: [...CAT_ORDER.filter((c) => CATS[c].group === 'portfolio').map(catItem), { key: 'about', href: '/about.html', label: '소개' }] },
];
const DIARY: Item[] = CAT_ORDER.filter((c) => CATS[c].group === 'diary').map(catItem);

export default function SiteHeader({ current }: { current?: NavKey }) {
  const [navOpen, setNavOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest('.has-sub')) setOpenGroup(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenGroup(null); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, []);

  const link = (it: Item) => (
    <li key={it.key}>
      <a href={it.href} aria-current={current === it.key ? 'page' : undefined}>{it.label}</a>
    </li>
  );

  return (
    <header className="site-header">
      <div className="wrap">
        <a className="logo" href="/">Ref<span>.</span></a>
        <button className="nav-toggle" aria-expanded={navOpen} aria-controls="site-nav" onClick={() => setNavOpen((v) => !v)}>메뉴</button>
        <nav className={'nav' + (navOpen ? ' open' : '')} id="site-nav" aria-label="주요 메뉴">
          <ul>
            {link({ key: 'posts', href: '/posts.html', label: '전체 글' })}
            {GROUPS.map((g) => {
              const open = openGroup === g.label;
              return (
                <li key={g.label} className={'has-sub' + (open ? ' open' : '')}>
                  <button type="button" className="sub-toggle" aria-expanded={open} onClick={() => setOpenGroup(open ? null : g.label)}>{g.label}</button>
                  <ul className="sub">{g.items.map(link)}</ul>
                </li>
              );
            })}
            {DIARY.map(link)}
          </ul>
        </nav>
      </div>
    </header>
  );
}
