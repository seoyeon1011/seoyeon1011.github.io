# Ref(레프) 콘텐츠·SEO 마케팅 지식창고

Next.js로 만든 정적 사이트입니다. 글은 `content/posts/` 의 JSON 파일로 관리하고, GitHub 저장소에 올리면 연결된 Vercel이 자동으로 빌드해 배포합니다.

## 폴더 구조

| 경로 | 역할 |
| --- | --- |
| content/posts/ | 글 원본 (슬러그.json, 관리자 화면 밖에서 만든 글은 본문 슬러그.html 포함) |
| app/ | 페이지 (홈, 전체 글, 글, 카테고리, 소개, 관리자, 404, 사이트맵, RSS) |
| components/ | 헤더, 푸터, 카드, 글 본문 같은 공통 화면 조각 |
| lib/ | 사이트 설정·분류·SEO 기준(site.ts), 글 읽기(posts.ts), 본문 변환(markdown.ts), SEO 점검(seo.ts) |
| public/ | 이미지(assets/img), robots.txt |
| .claude/skills/레프글작성/ | SEO 기준이 담긴 글쓰기 스킬 |

전체 글 목록, 카테고리 페이지, 홈 최근 글과 글 개수, sitemap.xml, rss.xml, 함께 읽으면 좋은 글은 모두 빌드할 때 글 JSON에서 자동으로 만들어집니다. 손으로 목록을 고칠 필요가 없습니다.

## SEO 글쓰기 기준

| 항목 | 기준 |
| --- | --- |
| SEO 타이틀 (title 태그) | 10~15자 (공백 포함) |
| 메타 디스크립션 | 120~200자 |
| 본문 | 공백 제외 2000자 이상 |
| 이미지 | 5장 이상, 모두 대체 텍스트(alt) 작성 |

기준값은 `lib/site.ts` 의 `RULE` 에 있고, 관리자 화면이 이 값으로 실시간 점검합니다. Claude Code는 레프글작성 스킬로 같은 기준을 적용합니다.

## 배포 (Vercel)

1. GitHub 저장소 내용을 이 폴더의 내용으로 바꿉니다 (`node_modules`, `.next`, `out`, `.vercel` 폴더는 올리지 않습니다. `.gitignore` 에 적혀 있습니다)
2. https://vercel.com 에 GitHub 계정으로 가입 > Add New > Project > 저장소 Import > 설정은 기본값(Next.js) 그대로 Deploy
3. 생긴 주소(예: `프로젝트명.vercel.app`)를 `lib/site.ts` 의 `SITE.url` 과 `public/robots.txt` 의 Sitemap 줄에 넣고 다시 올립니다
4. 새 주소가 잘 열리면 저장소 Settings > Pages 에서 GitHub Pages 게시를 끕니다 (같은 글이 두 주소에 있으면 중복 콘텐츠가 됩니다)
5. 구글 서치콘솔과 네이버 서치어드바이저에 새 주소를 등록하고 사이트맵을 제출합니다

이후에는 저장소 main 브랜치에 커밋할 때마다(관리자 화면 게시 포함) Vercel이 자동으로 다시 배포합니다. 빌드가 실패하면 Vercel 프로젝트의 Deployments 화면에서 오류 내용을 볼 수 있습니다.

## 내 컴퓨터에서 미리 보기

1. Node.js 20 이상 설치 (https://nodejs.org 에서 LTS 버전)
2. 이 폴더에서 터미널을 열고 `npm install` (처음 한 번)
3. `npm run dev` 후 http://localhost:3000 접속
4. 배포 전에 `npm run build` 가 오류 없이 끝나는지 확인. 결과물은 `out/` 폴더에 생깁니다

## 관리자 화면으로 글 쓰고 게시하기

주소: `https://marketing-ref.vercel.app/admin` (메뉴에는 없으니 즐겨찾기 해 두세요)

처음 한 번 토큰 만들기:
1. GitHub 프로필 > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token
2. Repository access: Only select repositories > seoyeon1011.github.io
3. Repository permissions > Contents: Read and write
4. 만든 토큰을 관리자 화면 로그인 칸에 붙여넣기

글 쓰기:
1. 카테고리, 타깃 키워드, SEO 타이틀, 메타 디스크립션, 본문을 입력합니다. 본문 쓰는 법은 화면의 "본문 쓰는 법"을 펼치면 나옵니다
2. 이미지를 올리고 대체 텍스트를 쓴 뒤 "본문 커서 위치에 넣기"를 누릅니다 (자동으로 가로 1600px 이하 WebP로 줄여서 올라갑니다)
3. 오른쪽 SEO 점검이 모두 O가 되면 "게시하기". 글 JSON과 이미지가 커밋되고, Vercel 빌드가 끝나면(보통 1~2분) 사이트에 반영됩니다
4. 게시한 글은 위쪽 "게시한 글 수정하기"에서 불러와 고칠 수 있습니다

안전하게 쓰는 법:
- 토큰은 이 저장소 하나, Contents 권한 하나만 주고 만료 기간을 두세요. 토큰이 없으면 아무도 게시할 수 없습니다
- 공용 PC에서는 "로그인 유지"를 체크하지 말고, 다 쓰면 로그아웃하세요
- 토큰이 유출된 것 같으면 GitHub에서 바로 삭제(Revoke)하고 새로 만드세요
- 처음 5개 글처럼 관리자 화면 밖에서 만든 글(JSON에 `bodyFile` 이 있는 글)은 관리자 화면에서 불러올 수 없습니다. Claude Code로 고치세요

## 들어 있는 SEO 설정

| 항목 | 설명 |
| --- | --- |
| title, meta description | 페이지마다 따로 작성 |
| canonical | 중복 주소 방지. 예전 .html 주소로 들어오면 새 주소로 영구 이동(vercel.json) |
| Open Graph | 카카오톡, SNS 공유 미리보기 |
| 구조화 데이터(JSON-LD) | 홈 WebSite, 글 BlogPosting + BreadcrumbList + FAQPage, 소개 ProfilePage |
| 이동경로, 목차 | 글마다 이동경로 표시, 소제목(h2)이 3개 이상이면 목차를 빌드할 때 생성 |
| 내부 링크 | 글 하단 "함께 읽으면 좋은 글"(지정하지 않으면 같은 분류 우선 2개 자동), 카테고리 허브 페이지 |
| noindex | 작성 중인 글과 404 페이지는 검색에 안 나오게 처리 |
| 콘텐츠가 HTML에 직접 들어 있음 | 정적 내보내기라 자바스크립트 없이도 검색엔진이 본문을 바로 읽음 (네이버 수집에 유리) |

## 검색엔진 등록

1. 구글 서치콘솔: 새 주소로 속성을 추가하고, 받은 소유 확인 코드를 `lib/site.ts` 의 `googleVerification` 에 넣습니다 (marketing-ref.vercel.app 용 코드 반영 완료, 2026-11-11). Sitemaps 메뉴에 `sitemap.xml` 제출
2. 네이버 서치어드바이저: HTML 태그 방식으로 소유 확인이 필요하면 `app/layout.tsx` 의 `verification` 에 `other: { 'naver-site-verification': '값' }` 을 추가합니다. 사이트맵 `https://marketing-ref.vercel.app/sitemap.xml`, RSS `https://marketing-ref.vercel.app/rss.xml` 제출
3. GA4가 필요하면 측정 ID(G-XXXX)를 발급받아 Claude Code에 "GA4 G-XXXX 넣어줘"라고 요청

## 새 글 발행 (Claude Code)

이 폴더에서 Claude Code를 열고 "새 글 발행해줘: 주제 OOO, 카테고리 OOO"라고 하면 레프글작성 스킬 절차대로 `content/posts/` 에 글을 만듭니다. 목록, 사이트맵, RSS는 빌드할 때 자동으로 갱신되므로 글 파일만 올리면 됩니다.

작성 중인 글(ADsP 후기, 마케팅 문제 정의)은 내용을 다 채운 뒤 JSON의 `indexable` 을 `true` 로 바꾸면 검색 노출과 사이트맵, RSS 포함이 함께 적용됩니다. ADsP 후기는 FAQ 답변을 채운 뒤 `faqSchema` 줄을 지우면 FAQ 구조화 데이터도 붙습니다.

## 포트폴리오로 쓰는 법

- 글마다 발행일, 타깃 키워드, 매주 서치콘솔 노출수·클릭수·평균 순위를 기록해 두기
- 제목, 내부 링크를 바꿨다면 바꾼 날짜와 내용을 같이 메모해 전후 변화를 비교하기
- 한 달에 한 번 운영 회고 글을 써서 "직접 사이트를 키워 본 경험"을 수치로 보여 주기
