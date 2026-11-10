// 빌드할 때 content/posts/*.json 을 읽어 글 목록을 만든다. 서버(빌드)에서만 쓴다.
import fs from 'node:fs';
import path from 'node:path';
import type { CatSlug, PostSource } from './types';
import { CATS, RULE, abs, isCat } from './site';
import { imagesFromHtml, readMinutes, renderBody, shortText, stripTags, tocFromHtml } from './markdown';

const DIR = path.join(process.cwd(), 'content', 'posts');

export interface Post extends PostSource {
  title: string;
  bodyHtml: string;
  text: string;
  minutes: number;
  cardText: string;
  searchText: string;
  crumb: string;
  /** 본문 이미지 절대 주소 */
  imageUrls: string[];
  toc: { id: string; text: string }[];
  /** 관리자 화면에서 수정할 수 있는 글인지 */
  editable: boolean;
}

function load(file: string): Post {
  const src = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8')) as PostSource;
  const expected = file.replace(/\.json$/, '');
  if (src.slug !== expected) throw new Error(`content/posts/${file}: slug(${src.slug})가 파일 이름과 다릅니다.`);
  if (!isCat(src.category)) throw new Error(`content/posts/${file}: 알 수 없는 분류 ${src.category}`);

  let bodyHtml: string;
  let text: string;
  if (src.bodyFile) {
    bodyHtml = fs.readFileSync(path.join(DIR, src.bodyFile), 'utf8');
    text = stripTags(bodyHtml);
  } else {
    const r = renderBody(src.body || '', (src.images || []).map((im) => ({ ...im, src: '/' + im.path })));
    bodyHtml = r.html;
    text = r.text;
  }
  const title = src.h1.trim() || src.seoTitle.trim();
  return {
    ...src,
    faqs: src.faqs || [],
    images: src.images || [],
    title,
    bodyHtml,
    text,
    minutes: src.readMinutes || readMinutes(text),
    cardText: src.excerpt || shortText(src.desc.trim(), 90),
    searchText: src.searchKeywords || src.keyword,
    crumb: src.breadcrumbTitle || src.seoTitle.trim() || title,
    imageUrls: imagesFromHtml(bodyHtml).map((u) => (/^https?:/.test(u) ? u : abs(u))),
    toc: tocFromHtml(bodyHtml),
    editable: !src.bodyFile,
  };
}

let cache: Post[] | null = null;

/** 발행일 최신순 (같은 날은 슬러그 역순) */
export function getAllPosts(): Post[] {
  if (cache && process.env.NODE_ENV === 'production') return cache;
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith('.json')) : [];
  const posts = files.map(load);
  posts.sort((a, b) => (a.pubDate === b.pubDate ? (a.slug < b.slug ? 1 : -1) : a.pubDate < b.pubDate ? 1 : -1));
  cache = posts;
  return posts;
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function postsByCat(cat: CatSlug): Post[] {
  return getAllPosts().filter((p) => p.category === cat);
}

export function recentPosts(): Post[] {
  return getAllPosts().slice(0, RULE.recentMax);
}

/** 함께 읽으면 좋은 글: 지정한 글이 있으면 그대로, 없으면 같은 분류 우선 2개 */
export function getRelated(post: Post): Post[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  if (post.related && post.related.length) {
    return post.related.map((s) => all.find((p) => p.slug === s)).filter((p): p is Post => !!p);
  }
  return all.filter((p) => p.category === post.category).concat(all.filter((p) => p.category !== post.category)).slice(0, 2);
}

export function lastMod(posts: Post[], fallback: string): string {
  return posts.reduce((max, p) => {
    const d = p.modDate || p.pubDate;
    return d > max ? d : max;
  }, fallback);
}

export const catLabel = (c: CatSlug) => CATS[c].label;
