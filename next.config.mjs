// 정적 파일로 내보낸다. Vercel이 저장소 main 커밋마다 빌드해 배포한다.
// 예전 .html 주소(/posts/슬러그.html 등)를 새 주소로 옮기는 설정은 vercel.json 에 있다.

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
};

export default nextConfig;
