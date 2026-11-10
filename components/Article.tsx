// 글 본문 화면. 글 페이지(빌드)와 관리자 미리보기가 함께 쓴다. 훅을 쓰지 않아 서버·브라우저 어디서든 그려진다.
import type { CatSlug, FaqItem } from '@/lib/types';
import { CATS, SITE, catPath, dot, postPath } from '@/lib/site';
import { inline, tocFromHtml } from '@/lib/markdown';
import { RelatedCard, Tag } from './PostCard';
import EditLink from './EditLink';

export interface ArticleView {
  slug?: string;
  category: CatSlug;
  crumb: string;
  title: string;
  pubDate: string;
  modDate?: string;
  minutes: number;
  summary: string;
  bodyHtml: string;
  faqs: FaqItem[];
  related: { slug: string; category: CatSlug; title: string }[];
  /** 수정 버튼을 붙일지 (글 페이지에서만) */
  editable?: boolean;
  /** 이전 글(더 오래된 글), 다음 글(더 최근 글) */
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
}

export default function Article({ view }: { view: ArticleView }) {
  const cat = CATS[view.category];
  const sum = view.summary.split('\n').map((x) => x.trim()).filter(Boolean);
  const faqs = view.faqs.filter((f) => f.q.trim() && f.a.trim());
  const toc = tocFromHtml(view.bodyHtml);
  return (
    <article className="read">
      <header className="page-head">
        <nav className="breadcrumb" aria-label="현재 위치">
          <ol>
            <li><a href="/">홈</a></li>
            <li><a href={catPath(view.category)}>{cat.label}</a></li>
            <li>{view.crumb}</li>
          </ol>
        </nav>
        <Tag category={view.category} />
        <h1>{view.title}</h1>
        <div className="post-meta">
          <span>{SITE.author}</span>
          <time dateTime={view.pubDate}>{dot(view.pubDate)} 작성</time>
          {view.modDate && view.modDate !== view.pubDate && <time dateTime={view.modDate}>{dot(view.modDate)} 수정</time>}
          <span>읽는 시간 약 {view.minutes}분</span>
          {view.editable && view.slug && <EditLink slug={view.slug} />}
        </div>
      </header>

      {sum.length > 0 && (
        <div className="summary">
          <strong>핵심 요약</strong>
          <ul>{sum.map((x, i) => <li key={i} dangerouslySetInnerHTML={{ __html: inline(x) }} />)}</ul>
        </div>
      )}

      {toc.length >= 3 && (
        <nav className="toc" aria-label="목차">
          <p>목차</p>
          <ol>{toc.map((h) => <li key={h.id}><a href={'#' + h.id}>{h.text}</a></li>)}</ol>
        </nav>
      )}

      <div className="prose" dangerouslySetInnerHTML={{ __html: view.bodyHtml }} />

      {faqs.length > 0 && (
        <section className="faq" aria-labelledby="faq-title">
          <h2 id="faq-title">자주 묻는 질문</h2>
          {faqs.map((f, i) => (
            <details key={i}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </section>
      )}

      <aside className="author-box">
        <div className="avatar" aria-hidden="true">R</div>
        <div>
          <p><strong>{SITE.author}</strong></p>
          <p>콘텐츠·SEO 마케팅을 공부하며 Claude Code로 마케팅 업무를 자동화하고 있습니다. <a href="/about">소개 보기</a></p>
        </div>
      </aside>

      {view.related.length > 0 && (
        <section className="related">
          <h2>함께 읽으면 좋은 글</h2>
          <div className="grid">{view.related.map((p) => <RelatedCard key={p.slug} post={p} />)}</div>
        </section>
      )}

      {(view.prev || view.next) && (
        <nav className="post-nav" aria-label="이전 글과 다음 글">
          {view.prev ? <a className="prev" href={postPath(view.prev.slug)}><small>이전 글</small>{view.prev.title}</a> : <span />}
          {view.next ? <a className="next" href={postPath(view.next.slug)}><small>다음 글</small>{view.next.title}</a> : <span />}
        </nav>
      )}
    </article>
  );
}
