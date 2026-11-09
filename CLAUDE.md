# CLAUDE.md

Ref(레프) 콘텐츠·SEO 마케팅 지식창고 사이트. 빌드 도구 없는 순수 HTML 정적 사이트이고 GitHub Pages(`seoyeon1011/seoyeon1011.github.io` 저장소)로 배포한다. 주소는 `https://seoyeon1011.github.io`.

## 작업 규칙

- 항상 한국어로 답한다. 이모지와 `**` 강조는 쓰지 않는다
- 사이트 안의 파일명은 날짜를 붙이지 않는다. 파일명이 URL이므로 영문 소문자와 하이픈만 쓴다
- 사용자의 경험, 수치, 점수, 기간, 교재명은 지어내지 않는다. 모르는 부분은 `<div class="todo">[직접 작성] ...</div>` 로 남긴다
- 시험 기준, 일정처럼 바뀔 수 있는 외부 정보는 공식 출처 확인을 권하는 문장을 함께 쓴다
- 연락처는 사용자가 직접 공개를 요청한 것만 쓴다 (about.html: 전화, 이메일 s.seoyeon1011@gmail.com, 인스타그램 @ref.yeon, GitHub). 그 밖의 개인정보는 넣지 않는다

## 글 작성과 SEO 기준

글을 쓰거나 점검할 때는 `.claude/skills/레프글작성/SKILL.md` 를 따른다. 핵심 기준은 다음과 같다.

- SEO 타이틀(title 태그) 10~15자, 공백 포함, 사이트명 접미사 없음
- 메타 디스크립션 120~200자
- 본문 공백 제외 2000자 이상
- 본문 이미지 5장 이상, 모두 alt 작성

이 기준을 바꾸면 스킬 파일과 `admin/admin.js` 의 `RULE` 값을 함께 고친다.

## 글을 올리는 두 가지 방법

1. 관리자 화면 `/admin/`: 사용자가 브라우저에서 직접 쓰고 GitHub 토큰으로 게시한다. 게시하면 `posts/슬러그.html`, `_source/슬러그.json`(다시 불러오기용 원본), 이미지, 목록, 사이트맵, RSS가 한 커밋으로 갱신된다
2. Claude Code: 레프글작성 스킬 절차로 로컬 파일을 만들고, 사용자가 GitHub에 올린다

글 페이지의 "수정" 버튼은 `assets/js/main.js` 가 `.post-meta` 끝에 붙인다. 관리자 화면에 로그인하면 localStorage에 `ref_admin=1` 표시가 생기고(토큰은 저장하지 않음), 그 브라우저에서만 버튼이 보인다. 버튼은 `/admin/?edit=슬러그` 로 이동해 `_source/슬러그.json` 을 자동으로 불러온다. 버튼 노출은 편의 기능일 뿐이고 실제 권한은 토큰이 막는다.

`_source/슬러그.json` 이 있는 글은 관리자 화면이 원본이다. 파일을 직접 고치면 다음 관리자 수정 때 덮어써지므로 JSON도 같이 고친다.

## 자동 삽입 위치 표시 (지우지 말 것)

관리자 화면과 스킬이 아래 표시를 기준으로 카드를 끼워 넣는다.

| 파일 | 표시 |
| --- | --- |
| posts.html | `data-post-list` 속성이 있는 div |
| index.html | `<!-- recent:start -->`, `<!-- recent:end -->`, `data-count="카테고리"` |
| category/*.html | `data-cat-list` 속성이 있는 div |
| rss.xml | `<atom:link` 줄 다음에 새 item |

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

헤더 메뉴 순서: 전체 글 / 마케팅 지식(콘텐츠·SEO, 마케팅 전략) / 포트폴리오(프로젝트, 자동화 실습, 자격증, 소개) / 일기. 묶음은 `li.has-sub` 안의 `button.sub-toggle` 과 `ul.sub` 로 만든다.

카테고리를 새로 만들면 모든 페이지의 헤더 메뉴, `_templates/post-template.html` 메뉴, `category/슬러그.html`, posts.html 필터 버튼, index.html 주제별 보기(`data-count`), sitemap.xml, `admin/index.html` 의 분류 선택, `admin/admin.js` 의 `CATS` 와 `navHtml` 을 함께 고친다.
