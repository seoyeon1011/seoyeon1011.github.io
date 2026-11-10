// 관리자 화면 본문 문법(간단한 마크다운)을 HTML로 바꾼다.
// 빌드할 때(글 페이지)와 관리자 화면(미리보기, SEO 점검)이 같은 함수를 쓴다.
import { SITE } from './site';

export interface RenderImage {
  no: number;
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export interface RenderResult {
  html: string;
  h2: number;
  used: number[];
  text: string;
  firstPara: string;
}

export function esc(s: unknown): string {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const noSpaceLen = (s: string) => s.replace(/\s/g, '').length;

export function shortText(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;
}

/** 본문 링크 주소 정리: 내 글은 "파일명.html"만 써도 /posts/파일명.html 로 연결한다 */
export function resolveHref(url: string): string {
  if (/^[a-z0-9-]+\.html(#.*)?$/.test(url)) return '/posts/' + url;
  if (url.startsWith('../')) return '/' + url.slice(3);
  return url;
}

export function inline(src: string): string {
  let s = esc(src);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
    const ext = /^https?:/.test(url) && url.indexOf(SITE.url) !== 0;
    return '<a href="' + resolveHref(url) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + text + '</a>';
  });
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  return s;
}

const stripLinks = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

export function renderBody(md: string, images: RenderImage[]): RenderResult {
  const lines = (md || '').replace(/\r/g, '').split('\n');
  const out: string[] = [];
  const plain: string[] = [];
  const used: number[] = [];
  let para: string[] = [];
  let h2 = 0;
  let i = 0;
  let firstPara: string | null = null;
  const byNo = (no: number) => images.find((im) => im.no === no);

  function flush() {
    if (!para.length) return;
    const t = para.join(' ');
    out.push('<p>' + inline(t) + '</p>');
    plain.push(t);
    if (firstPara === null) firstPara = t;
    para = [];
  }

  while (i < lines.length) {
    const L = lines[i];
    let m: RegExpMatchArray | null;
    if (!L.trim()) { flush(); i++; continue; }
    if ((m = L.trim().match(/^\[\[이미지(\d+)\]\]$/))) {
      flush();
      const no = +m[1];
      const im = byNo(no);
      if (im) {
        used.push(no);
        out.push('<figure><img src="' + esc(im.src) + '" alt="' + esc(im.alt) + '" width="' + im.width + '" height="' + im.height + '" loading="lazy" decoding="async">' +
          (im.caption ? '<figcaption>' + esc(im.caption) + '</figcaption>' : '') + '</figure>');
      } else {
        out.push('<div class="todo">[이미지' + no + ' 없음: 이미지 목록에서 번호를 확인하세요]</div>');
      }
      i++; continue;
    }
    if ((m = L.match(/^##\s+(.+)/)) && !/^###/.test(L)) { flush(); h2++; out.push('<h2 id="s' + h2 + '">' + inline(m[1].trim()) + '</h2>'); plain.push(m[1]); i++; continue; }
    if ((m = L.match(/^###\s+(.+)/))) { flush(); out.push('<h3>' + inline(m[1].trim()) + '</h3>'); plain.push(m[1]); i++; continue; }
    if (/^\s*[-*]\s+/.test(L)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { const t = lines[i].replace(/^\s*[-*]\s+/, ''); items.push('<li>' + inline(t) + '</li>'); plain.push(t); i++; }
      out.push('<ul>' + items.join('') + '</ul>'); continue;
    }
    if (/^\s*\d+[.)]\s+/.test(L)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { const t = lines[i].replace(/^\s*\d+[.)]\s+/, ''); items.push('<li>' + inline(t) + '</li>'); plain.push(t); i++; }
      out.push('<ol>' + items.join('') + '</ol>'); continue;
    }
    if (/^>\s?/.test(L)) {
      flush();
      const q: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push('<blockquote><p>' + inline(q.join(' ')) + '</p></blockquote>'); plain.push(q.join(' ')); continue;
    }
    if (/^\s*\|.*\|\s*$/.test(L)) {
      flush();
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      if (rows.length) {
        const head = '<tr>' + rows[0].map((c) => { plain.push(c); return '<th>' + inline(c) + '</th>'; }).join('') + '</tr>';
        const bodyRows = rows.slice(1).map((r) => '<tr>' + r.map((c) => { plain.push(c); return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>');
        out.push('<div class="table-wrap"><table><thead>' + head + '</thead><tbody>' + bodyRows.join('') + '</tbody></table></div>');
      }
      continue;
    }
    para.push(L.trim()); i++;
  }
  flush();
  const text = stripLinks(plain.join('\n')).replace(/\*\*|`/g, '');
  return { html: out.join('\n'), h2, used, text, firstPara: stripLinks(firstPara || '') };
}

// ---------- HTML 본문 도구 ----------
export function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

/** 본문 HTML의 id 있는 h2로 목차를 만든다 */
export function tocFromHtml(html: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  const re = /<h2[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push({ id: m[1], text: stripTags(m[2]).replace(/\s+/g, ' ').trim() });
  return out;
}

export function imagesFromHtml(html: string): string[] {
  const out: string[] = [];
  const re = /<img[^>]*\ssrc="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

export function readMinutes(text: string): number {
  return Math.max(1, Math.round(noSpaceLen(text) / 500));
}
