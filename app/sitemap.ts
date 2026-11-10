// sitemap.xml: 빌드할 때 자동 생성. 작성 중(noindex) 글은 넣지 않는다
import type { MetadataRoute } from 'next';
import { CAT_ORDER, SITE, abs, catPath, postPath } from '@/lib/site';
import { getAllPosts, lastMod } from '@/lib/posts';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().filter((p) => p.indexable);
  const latest = lastMod(posts, SITE.launched);
  return [
    { url: abs('/'), lastModified: latest },
    { url: abs('/posts.html'), lastModified: latest },
    { url: abs('/about.html'), lastModified: SITE.aboutUpdated },
    ...CAT_ORDER.map((c) => ({ url: abs(catPath(c)), lastModified: lastMod(posts.filter((p) => p.category === c), SITE.launched) })),
    ...posts.map((p) => ({ url: abs(postPath(p.slug)), lastModified: p.modDate || p.pubDate })),
  ];
}
