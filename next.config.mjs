// GitHub Pages에 올릴 정적 파일(out 폴더)로 내보낸다.
// 공개 주소는 기존 사이트와 같은 .html 형식을 유지한다 (/posts/슬러그.html, /category/분류.html, /posts.html, /about.html).
// next build 결과물이 정확히 그 이름의 파일로 만들어지므로 배포 후에는 별도 설정 없이 같은 주소로 열린다.
// 개발 서버(next dev)는 .html 주소를 모르므로 개발할 때만 주소를 연결해 준다.
const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  ...(isDev && {
    async rewrites() {
      return [
        { source: '/index.html', destination: '/' },
        { source: '/:page(posts|about|admin)\\.html', destination: '/:page' },
        { source: '/posts/:slug([a-z0-9-]+)\\.html', destination: '/posts/:slug' },
        { source: '/category/:slug([a-z0-9-]+)\\.html', destination: '/category/:slug' },
      ];
    },
  }),
};

export default nextConfig;
