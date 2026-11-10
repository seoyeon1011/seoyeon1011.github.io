'use client';
// 헤더 메뉴. 순서: 전체 글 / 콘텐츠 트렌드 / 마케팅 지식 / 포트폴리오(+소개) / 일기
// 묶음과 분류는 lib/site.ts 의 CAT_GROUPS, CATS 에서 만든다. 분류가 하나뿐인 묶음은 펼침 메뉴 없이 바로 링크한다.
import { useEffect, useState } from 'react';
import type { CatSlug } from '@/lib/types';
import { CATS, CAT_GROUPS, catPath, catsInGroup } from '@/lib/site';
import ThemeToggle from './ThemeToggle';

export type NavKey = CatSlug | 'posts' | 'about';

interface Item { key: NavKey; href: string; label: string }

const catItem = (c: CatSlug): Item => ({ key: c, href: catPath(c), label: CATS[c].label });
const MENU = CAT_GROUPS.map((g) => ({
  label: g.label,
  items: [...catsInGroup(g.key).map(catItem), ...(g.key === 'portfolio' ? [{ key: 'about' as NavKey, href: '/about', label: '소개' }] : [])],
}));

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
        <div className="header-right">
          <nav className={'nav' + (navOpen ? ' open' : '')} id="site-nav" aria-label="주요 메뉴">
            <ul>
              {link({ key: 'posts', href: '/posts', label: '전체 글' })}
              {MENU.map((g) => {
                if (g.items.length === 1) return link({ ...g.items[0], label: g.label });
                const open = openGroup === g.label;
                return (
                  <li key={g.label} className={'has-sub' + (open ? ' open' : '')}>
                    <button type="button" className="sub-toggle" aria-expanded={open} onClick={() => setOpenGroup(open ? null : g.label)}>{g.label}</button>
                    <ul className="sub">{g.items.map(link)}</ul>
                  </li>
                );
              })}
            </ul>
          </nav>
          <ThemeToggle />
          <button className="nav-toggle" aria-expanded={navOpen} aria-controls="site-nav" onClick={() => setNavOpen((v) => !v)}>메뉴</button>
        </div>
      </div>
    </header>
  );
}
