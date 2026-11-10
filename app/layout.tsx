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
  verification: { google: SITE.googleVerification },
  openGraph: { siteName: SITE.name, locale: 'ko_KR', images: [SITE.ogImage] },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="alternate" type="application/rss+xml" title={`${SITE.name} RSS`} href="/rss.xml" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
