import type { Metadata } from 'next';
import Shell from '@/components/Shell';
import JsonLd from '@/components/JsonLd';
import { OG_BASE, SITE, abs } from '@/lib/site';

// 공개 주소 /about: 포트폴리오 열람 요청 안내.
// 포트폴리오 본문은 링크를 받은 사람만 보는 비공개 주소(app/pf-*/)에 있고, 이 페이지에서는 그 주소를 절대 링크하지 않는다.
// 연락처는 사용자가 공개를 요청한 것만 쓴다 (CLAUDE.md): 이메일, 인스타그램.

const title = `포트폴리오 안내 | ${SITE.name}`;
const description = '콘텐츠 마케터 심서연의 포트폴리오는 링크를 공유받은 분만 볼 수 있습니다. 이메일이나 인스타그램으로 연락 주시면 바로 링크를 보내 드립니다.';
const MAIL = 's.seoyeon1011@gmail.com';
const MAIL_HREF = `mailto:${MAIL}?subject=${encodeURIComponent('포트폴리오 열람 요청')}`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs('/about') },
  openGraph: { ...OG_BASE, type: 'profile', title, description, url: abs('/about') },
};

export default function AboutPage() {
  return (
    <Shell current="about">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: '심서연',
          alternateName: SITE.author,
          url: abs('/about'),
          jobTitle: '콘텐츠 마케터',
          sameAs: ['https://github.com/seoyeon1011', 'https://www.instagram.com/ref.yeon/'],
        },
      }} />
      <main id="main" className="wrap">
        <div className="read">
          <div className="page-head">
            <p className="eyebrow">PORTFOLIO</p>
            <h1>포트폴리오는 링크를 받은 분께만 공개하고 있습니다</h1>
            <p>방문해 주셔서 감사합니다. 콘텐츠 마케터 심서연입니다.</p>
          </div>

          <div className="prose">
            <p>제 포트폴리오에는 함께 일한 곳의 실제 콘텐츠와 성과 자료가 담겨 있어, 링크를 직접 전달받은 분만 볼 수 있도록 비공개로 운영하고 있습니다.</p>
            <p>포트폴리오를 보고 싶으시다면 아래 이메일이나 인스타그램으로 편하게 연락 주세요. 확인하는 대로 바로 열람 링크를 보내 드리겠습니다.</p>

            <dl className="contact-list">
              <div><dt>Email</dt><dd><a href={MAIL_HREF}>{MAIL}</a></dd></div>
              <div><dt>Instagram</dt><dd><a href="https://www.instagram.com/ref.yeon/" rel="me noopener" target="_blank">@ref.yeon</a> (DM)</dd></div>
            </dl>

            <p style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
              <a className="btn btn-primary" href={MAIL_HREF}>이메일로 요청하기</a>
              <a className="btn btn-ghost" href="https://www.instagram.com/ref.yeon/" rel="me noopener" target="_blank">인스타그램 DM 보내기</a>
            </p>

            <p>기다리시는 동안 Ref에 정리해 둔 콘텐츠 트렌드와 마케팅 글을 둘러보셔도 좋습니다. <a href="/posts">전체 글 보기</a></p>
          </div>
        </div>
      </main>
    </Shell>
  );
}
