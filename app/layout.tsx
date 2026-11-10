import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SITE } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  authors: [{ name: SITE.author }],
  icons: { icon: { url: '/assets/img/favicon.svg', type: 'image/svg+xml' } },
  verification: { google: SITE.googleVerification, other: { 'naver-site-verification': SITE.naverVerification } },
  openGraph: { siteName: SITE.name, locale: 'ko_KR', images: [SITE.ogImage] },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 고른 테마를 화면이 그려지기 전에 적용해 깜빡임을 막는다 (components/ThemeToggle.tsx) */}
        <script dangerouslySetInnerHTML={{ __html: "(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}})();" }} />
        <link rel="alternate" type="application/rss+xml" title={`${SITE.name} RSS`} href="/rss.xml" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
