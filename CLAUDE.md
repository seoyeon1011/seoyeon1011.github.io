# CLAUDE.md

Ref(레프) 콘텐츠·SEO 마케팅 지식창고 사이트. Next.js(App Router, TypeScript) 정적 내보내기(`output: 'export'`)로 만든다. 코드는 GitHub 저장소 `seoyeon1011/seoyeon1011.github.io` 에 있고, 이 저장소에 연결된 Vercel이 main 커밋마다 빌드해 배포한다. GitHub Pages는 쓰지 않는다. 사이트 주소는 `lib/site.ts` 의 `SITE.url` 이 기준이며, 주소가 바뀌면 이 값과 `public/robots.txt` 의 Sitemap 줄을 함께 고친다.

## 작업 규칙

- 항상 한국어로 답한다. 이모지와 `**` 강조는 쓰지 않는다
- 사이트 안의 파일명은 날짜를 붙이지 않는다. 글 파일명이 URL이므로 영문 소문자와 하이픈만 쓴다
- 사용자의 경험, 수치, 점수, 기간, 교재명은 지어내지 않는다. 모르는 부분은 `<div class="todo">[직접 작성] ...</div>` 로 남긴다
- 시험 기준, 일정처럼 바뀔 수 있는 외부 정보는 공식 출처 확인을 권하는 문장을 함께 쓴다
- 연락처는 사용자가 직접 공개를 요청한 것만 쓴다 (app/about/page.tsx: 전화, 이메일 s.seoyeon1011@gmail.com, 인스타그램 @ref.yeon, GitHub). 그 밖의 개인정보는 넣지 않는다

## 명령

- `npm install` 처음 한 번
- `npm run dev` 개발 서버 (http://localhost:3000)
- `npm run build` 정적 파일을 `out/` 에 생성. 글 JSON 형식 오류, 슬러그와 파일명 불일치, 알 수 없는 분류는 여기서 빌드 오류로 드러난다
- 테스트와 린트 설정은 없다. 고친 뒤에는 `npm run build` 통과를 확인한다

## 구조

| 경로 | 역할 |
| --- | --- |
| content/posts/슬러그.json | 글 원본. 사이트의 모든 글 목록·카테고리·홈 최근 글·사이트맵·RSS가 이 파일들에서 빌드할 때 자동 생성된다 |
| content/posts/슬러그.html | 관리자 화면 밖에서 만든 글의 본문 HTML (JSON의 `bodyFile` 이 가리킴) |
| lib/site.ts | 사이트 설정, 분류(CATS), 메뉴 묶음, SEO 기준(RULE), 주소 함수 |
| lib/posts.ts | 글 JSON 읽기, 정렬, 관련 글 계산 (빌드 전용) |
| lib/markdown.ts | 관리자 본문 문법 변환. 빌드와 관리자 화면이 같은 함수를 쓴다 |
| lib/seo.ts | 관리자 화면 SEO 점검 |
| components/ | 헤더, 푸터, 카드, 글 본문(Article), 전체 글 필터 |
| app/ | 페이지. posts/[slug], category/[slug], about, admin, sitemap.ts, rss.xml/route.ts, not-found(404) |
| public/ | 이미지(assets/img), robots.txt |
| vercel.json | 예전 .html 주소를 새 주소로 옮기는 영구 이동(301) 설정 |

공개 주소는 `.html` 없는 형식이다 (`/posts/슬러그`, `/category/분류`, `/posts`, `/about`, `/admin`). Vercel은 `.html` 주소로 페이지를 열지 않으므로 사이트 안 링크에 `.html` 을 붙이지 않는다. 예전 GitHub Pages 시절 `.html` 주소로 들어오면 vercel.json 이 새 주소로 옮긴다. 사이트 안 링크는 `lib/site.ts` 의 `postPath`, `catPath` 로 만들고 `<a>` 를 쓴다.

## 글 JSON 형식

`lib/types.ts` 의 `PostSource` 가 기준이다. 두 종류가 있다.

1. 관리자 화면 글: `body` 에 간단한 마크다운 본문, `images` 에 이미지 목록(`path` 는 `assets/img/posts/...`, 실제 파일은 `public/` 아래). 관리자 화면에서 다시 불러와 고칠 수 있다
2. 관리자 화면 밖에서 만든 글: `bodyFile` 로 본문 HTML 파일을 가리킨다. 관리자 화면에서 불러올 수 없고 Claude Code로 고친다. `excerpt`, `searchKeywords`, `ldKeywords`, `breadcrumbTitle`, `readMinutes`, `related`, `faqSchema` 선택 필드를 쓸 수 있다

`indexable: false` 인 글(작성 중)은 사이트에는 보이지만 noindex가 붙고 사이트맵·RSS에서 빠진다. 본문 HTML 안의 내부 링크와 이미지는 `/posts/슬러그`, `/assets/img/...` 처럼 `/` 로 시작하는 절대 경로로 쓴다.

## 글 작성과 SEO 기준

글을 쓰거나 점검할 때는 `.claude/skills/레프글작성/SKILL.md` 를 따른다. 핵심 기준은 다음과 같다.

- SEO 타이틀(title 태그) 10~15자, 공백 포함, 사이트명 접미사 없음
- 메타 디스크립션 120~200자
- 본문 공백 제외 2000자 이상
- 본문 이미지 5장 이상, 모두 alt 작성

이 기준을 바꾸면 `lib/site.ts` 의 `RULE` 과 스킬 파일을 함께 고친다. 관리자 화면은 `RULE` 을 그대로 읽는다.

## 글을 올리는 두 가지 방법

1. 관리자 화면 `/admin`: 사용자가 브라우저에서 직접 쓰고 GitHub 토큰으로 게시한다. 게시하면 `content/posts/슬러그.json` 과 이미지(`public/assets/img/posts/`)만 한 커밋으로 올라가고, Vercel 빌드가 끝나면(보통 1~2분) 목록·사이트맵·RSS까지 반영된다
2. Claude Code: 레프글작성 스킬 절차로 `content/posts/` 에 글 파일을 만들고 `npm run build` 로 확인한 뒤, 사용자가 GitHub에 올린다

글 페이지의 "수정" 버튼은 `components/EditLink.tsx` 가 붙인다. 관리자 화면에 로그인하면 localStorage에 `ref_admin=1` 표시가 생기고(토큰은 저장하지 않음), 그 브라우저에서만 버튼이 보인다. 버튼은 `/admin?edit=슬러그` 로 이동해 글 JSON을 자동으로 불러온다. 버튼 노출은 편의 기능일 뿐이고 실제 권한은 토큰이 막는다.

## 카테고리

| 슬러그 | 표시 이름 | 메뉴 묶음 |
| --- | --- | --- |
| seo-content | 콘텐츠·SEO | 마케팅 지식 |
| marketing | 마케팅 전략 | 마케팅 지식 |
| project | 프로젝트 | 포트폴리오 |
| automation | 자동화 실습 | 포트폴리오 |
| certificate | 자격증 | 포트폴리오 |
| diary | 일기 | (단독 메뉴) |

묶음 기준: 마케팅 지식은 내 경험과 무관하게 읽히는 정보성 글, 포트폴리오는 내가 직접 한 작업 기록(프로젝트, 실습, 자격증)이다. 새 글의 분류는 이 기준으로 정한다.

헤더 메뉴 순서: 전체 글 / 마케팅 지식(콘텐츠·SEO, 마케팅 전략) / 포트폴리오(프로젝트, 자동화 실습, 자격증, 소개) / 일기.

카테고리를 새로 만들 때는 `lib/types.ts` 의 `CatSlug`, `lib/site.ts` 의 `CATS` 와 `CAT_ORDER` 두 곳만 고치면 메뉴, 분류 페이지, 필터 버튼, 홈 주제별 보기, 사이트맵, 관리자 분류 선택에 모두 반영된다.
