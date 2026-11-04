# Ref(레프) 콘텐츠·SEO 마케팅 지식창고

설치나 빌드 없이 HTML 파일만으로 돌아가는 정적 사이트입니다. GitHub Pages에 무료로 배포합니다.

## 폴더 구조

| 경로 | 역할 |
| --- | --- |
| index.html | 홈 (소개 문구, 주제별 보기, 최근 글) |
| posts.html | 전체 글 목록 (검색, 카테고리 필터) |
| category/ | 카테고리 허브 페이지 3개 (seo-content, automation, certificate) |
| posts/ | 글 본문. 파일명이 곧 URL |
| about.html | 소개, 포트폴리오 (역량, 프로젝트, 자격증, 연락처) |
| 404.html | 없는 주소로 들어왔을 때 보이는 페이지 |
| sitemap.xml, robots.txt, rss.xml | 검색엔진 제출용 파일 |
| assets/ | CSS, JS, 파비콘, 공유 이미지(og-default.png) |
| _templates/post-template.html | 새 글 템플릿 (배포되지 않음) |
| admin/ | 나만 쓰는 글쓰기·게시 화면 (검색 비노출, 토큰 필요) |
| _source/ | 관리자 화면으로 게시한 글의 원본. 게시하면 자동 생성 (배포되지 않음) |
| .claude/skills/레프글작성/ | SEO 기준이 담긴 글쓰기 스킬 |

## SEO 글쓰기 기준

| 항목 | 기준 |
| --- | --- |
| SEO 타이틀 (title 태그) | 10~15자 (공백 포함) |
| 메타 디스크립션 | 120~200자 |
| 본문 | 공백 제외 2000자 이상 |
| 이미지 | 5장 이상, 모두 대체 텍스트(alt) 작성 |

관리자 화면은 이 기준을 실시간으로 점검하고, Claude Code는 레프글작성 스킬로 같은 기준을 적용합니다.

## 관리자 화면으로 글 쓰고 게시하기

주소: `https://seoyeon1011.github.io/admin/` (메뉴에는 없으니 즐겨찾기 해 두세요)

처음 한 번 토큰 만들기:
1. GitHub 프로필 > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token
2. Repository access: Only select repositories > seoyeon1011.github.io
3. Repository permissions > Contents: Read and write
4. 만든 토큰을 관리자 화면 로그인 칸에 붙여넣기

글 쓰기:
1. 카테고리, 타깃 키워드, SEO 타이틀, 메타 디스크립션, 본문을 입력합니다. 본문 쓰는 법은 화면의 "본문 쓰는 법"을 펼치면 나옵니다
2. 이미지를 올리고 대체 텍스트를 쓴 뒤 "본문 커서 위치에 넣기"를 누릅니다 (자동으로 가로 1600px 이하 WebP로 줄여서 올라갑니다)
3. 오른쪽 SEO 점검이 모두 O가 되면 "게시하기". 1~2분 뒤 사이트에 반영됩니다
4. 게시한 글은 위쪽 "게시한 글 수정하기"에서 불러와 고칠 수 있습니다

안전하게 쓰는 법:
- 토큰은 이 저장소 하나, Contents 권한 하나만 주고 만료 기간을 두세요. 토큰이 없으면 아무도 게시할 수 없습니다
- 공용 PC에서는 "로그인 유지"를 체크하지 말고, 다 쓰면 로그아웃하세요
- 토큰이 유출된 것 같으면 GitHub에서 바로 삭제(Revoke)하고 새로 만드세요
- 처음 3개 글처럼 관리자 화면 밖에서 만든 글은 관리자 화면에서 불러올 수 없습니다. Claude Code로 고치세요

## 들어 있는 SEO 설정

| 항목 | 설명 |
| --- | --- |
| title, meta description | 페이지마다 따로 작성 |
| canonical | 중복 주소 방지 |
| Open Graph | 카카오톡, SNS 공유 미리보기 |
| 구조화 데이터(JSON-LD) | 홈 WebSite, 글 BlogPosting + BreadcrumbList + FAQPage, 소개 ProfilePage |
| 이동경로, 목차 | 글마다 이동경로 표시, 소제목(h2)이 3개 이상이면 목차 자동 생성 |
| 내부 링크 | 글 하단 "함께 읽으면 좋은 글", 카테고리 허브 페이지 |
| noindex | 작성 중인 글(ADsP 후기)과 404 페이지는 검색에 안 나오게 처리 |
| 콘텐츠가 HTML에 직접 들어 있음 | 자바스크립트 없이도 검색엔진이 본문을 바로 읽음 (네이버 수집에 유리) |

## 처음 한 번만 하는 배포 (GitHub Pages)

1. https://github.com 가입
2. 오른쪽 위 + 버튼 > New repository
   - Repository name을 정확히 `seoyeon1011.github.io` 로 입력
   - Public 선택 후 Create repository
3. 만들어진 저장소 화면에서 "uploading an existing file" 링크 클릭
4. 이 폴더 안의 파일과 폴더를 전부 끌어다 놓기 (폴더 자체가 아니라 안의 내용물. index.html이 저장소 맨 위에 있어야 함)
5. 아래 Commit changes 클릭
6. 저장소 Settings > Pages에서 Source가 "Deploy from a branch", Branch가 main / (root)인지 확인
7. 1~2분 뒤 `https://seoyeon1011.github.io` 접속

저장소 이름을 다르게 지으면 주소가 `seoyeon1011.github.io/저장소명/` 이 되어 404 페이지 디자인이 깨지고 사이트맵 주소도 바꿔야 합니다. 꼭 `seoyeon1011.github.io` 로 만드세요.

### 배포 전에 할 일

- 노란 칸 `[직접 작성]` 채우기. 특히 about.html과 Claude Code 자동화 글의 노란 칸은 공개 전에 채우거나 지우기

### 수정한 뒤 다시 올리기

저장소에서 Add file > Upload files로 바뀐 파일을 같은 위치에 다시 올리면 덮어써집니다. 폴더 안 파일은 폴더째 끌어다 놓으면 경로가 유지됩니다.

## 검색엔진 등록

1. 구글 서치콘솔 (https://search.google.com/search-console)
   - 속성 추가 > URL 접두어에 `https://seoyeon1011.github.io/` 입력
   - 확인 방법에서 HTML 태그 선택 > content 값을 복사
   - index.html의 `google-site-verification` 줄 주석을 풀고 값을 넣어 다시 업로드 > 확인
   - 왼쪽 Sitemaps 메뉴에 `sitemap.xml` 제출
2. 네이버 서치어드바이저 (https://searchadvisor.naver.com)
   - 웹마스터 도구 > 사이트 등록 > HTML 태그 방식으로 소유 확인 (index.html의 naver-site-verification 줄)
   - 요청 > 사이트맵 제출에 `https://seoyeon1011.github.io/sitemap.xml`
   - 요청 > RSS 제출에 `https://seoyeon1011.github.io/rss.xml`
3. GA4가 필요하면 측정 ID(G-XXXX)를 발급받아 Claude Code에 "모든 페이지에 GA4 G-XXXX 넣어줘"라고 요청

## 새 글 발행 체크리스트

이 폴더에서 Claude Code를 열고 "새 글 발행해줘: 주제 OOO, 카테고리 OOO"라고 하면 CLAUDE.md 규칙대로 아래 작업을 대신합니다. 직접 할 때는 다음 순서를 따릅니다.

1. `_templates/post-template.html` 을 `posts/영문-슬러그.html` 로 복사해 `{{ }}` 채우기
2. posts.html 목록 맨 위에 카드 추가 (data-cat, data-keywords 포함)
3. index.html 최근 글 맨 앞에 카드 추가 (최근 글은 3~6개 유지)
4. 해당 category/*.html 목록 맨 위에 카드 추가, index.html 주제별 보기의 "글 N개" 숫자 수정
5. sitemap.xml에 url 추가
6. rss.xml 첫 item 위에 item 추가, lastBuildDate 수정
7. 기존 관련 글의 "함께 읽으면 좋은 글"에 새 글 링크 추가

작성 중인 ADsP 후기 글은 내용을 다 채운 뒤 robots를 index로 바꾸고 sitemap.xml, rss.xml에 추가하면 공개됩니다.

## 포트폴리오로 쓰는 법

- 글마다 발행일, 타깃 키워드, 매주 서치콘솔 노출수·클릭수·평균 순위를 기록해 두기
- 제목, 내부 링크를 바꿨다면 바꾼 날짜와 내용을 같이 메모해 전후 변화를 비교하기
- 한 달에 한 번 운영 회고 글을 써서 "직접 사이트를 키워 본 경험"을 수치로 보여 주기
