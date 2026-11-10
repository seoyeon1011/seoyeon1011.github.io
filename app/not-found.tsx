import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: `페이지를 찾을 수 없습니다 | ${SITE.name}`,
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="wrap">
      <div className="hero">
        <p className="eyebrow">404</p>
        <h1>찾는 페이지가 없습니다</h1>
        <p>주소가 바뀌었거나 삭제된 글일 수 있습니다.</p>
        <div className="actions">
          <a className="btn btn-primary" href="/">홈으로</a>
          <a className="btn btn-ghost" href="/posts.html">전체 글 보기</a>
        </div>
      </div>
    </main>
  );
}
