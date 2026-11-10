'use client';
// 글 수정 버튼: 이 브라우저에서 관리자 화면에 로그인한 적이 있을 때만 보인다.
// 버튼이 보여도 실제 수정·게시는 GitHub 토큰이 있어야 가능하다.
import { useEffect, useState } from 'react';

export default function EditLink({ slug }: { slug: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(localStorage.getItem('ref_admin') === '1'); } catch { /* 저장소 접근이 막힌 브라우저 */ }
  }, []);
  if (!show) return null;
  return <a className="edit-link" href={'/admin.html?edit=' + slug} rel="nofollow">수정</a>;
}
