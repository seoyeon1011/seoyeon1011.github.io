// rss.xml: 빌드할 때 자동 생성 (네이버 서치어드바이저 RSS 제출용). 작성 중(noindex) 글은 넣지 않는다
import { CATS, SITE, abs, postPath, rfc822 } from '@/lib/site';
import { esc } from '@/lib/markdown';
import { getAllPosts, lastMod } from '@/lib/posts';

export const dynamic = 'force-static';

export function GET() {
  const posts = getAllPosts().filter((p) => p.indexable);
  const items = posts.map((p) => {
    const loc = abs(postPath(p.slug));
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${loc}</link>
      <guid>${loc}</guid>
      <description>${esc(p.desc.trim())}</description>
      <category>${CATS[p.category].label}</category>
      <pubDate>${rfc822(p.pubDate)}</pubDate>
    </item>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.title)}</title>
    <link>${abs('/')}</link>
    <description>${esc(SITE.shortDescription)}</description>
    <language>ko</language>
    <lastBuildDate>${rfc822(lastMod(posts, SITE.launched))}</lastBuildDate>
    <atom:link href="${abs('/rss.xml')}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
