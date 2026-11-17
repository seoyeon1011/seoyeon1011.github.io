'use client';

import { useEffect, useRef, useState } from 'react';

// 포트폴리오 사진 확대 팝업. [data-zoom] 버튼을 누르면 그 안의 이미지를 크게 띄운다.
// 버튼은 서버 컴포넌트(page.tsx 의 Fig)가 그리고, 여기서는 문서 전체 클릭만 듣는다.
export default function Lightbox() {
  const ref = useRef<HTMLDialogElement>(null);
  const [img, setImg] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-zoom]');
      if (!btn) return;
      const el = btn.querySelector('img');
      if (!el) return;
      setImg({ src: el.currentSrc || el.src, alt: el.alt });
      ref.current?.showModal();
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <dialog
      ref={ref}
      className="pf-lightbox"
      aria-label={img ? `확대 이미지: ${img.alt}` : '확대 이미지'}
      onClick={() => ref.current?.close()}
      onClose={() => setImg(null)}
    >
      {img && (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt={img.alt} />
          <figcaption>{img.alt}</figcaption>
        </figure>
      )}
      <button type="button" className="pf-lightbox-close" onClick={() => ref.current?.close()} aria-label="닫기">닫기 ✕</button>
    </dialog>
  );
}
