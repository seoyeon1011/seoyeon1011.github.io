// 공개 페이지 공통 틀: 본문 바로가기, 헤더, 푸터
import type { ReactNode } from 'react';
import SiteHeader, { type NavKey } from './SiteHeader';
import { SITE } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <a className="logo" href="/">Ref<span>.</span></a>
          <p>{SITE.tagline}</p>
        </div>
        <ul>
          <li><a href="/about">소개</a></li>
          <li><a href={SITE.instagram} rel="me noopener" target="_blank">인스타그램</a></li>
          <li><a href="/rss.xml">RSS</a></li>
          <li><a href="/sitemap.xml">사이트맵</a></li>
        </ul>
        <p className="copy">&copy; 2026 {SITE.name}</p>
      </div>
    </footer>
  );
}

export default function Shell({ current, children }: { current?: NavKey; children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">본문 바로가기</a>
      <SiteHeader current={current} />
      {children}
      <SiteFooter />
    </>
  );
}
