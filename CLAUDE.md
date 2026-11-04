# CLAUDE.md

Ref(레프) 콘텐츠·SEO 마케팅 지식창고 사이트. 빌드 도구 없는 순수 HTML 정적 사이트이고 GitHub Pages(`seoyeon1011/seoyeon1011.github.io` 저장소)로 배포한다. 주소는 `https://seoyeon1011.github.io`.

## 작업 규칙

- 항상 한국어로 답한다. 이모지와 `**` 강조는 쓰지 않는다
- 사이트 안의 파일명은 날짜를 붙이지 않는다. 파일명이 URL이므로 영문 소문자와 하이픈만 쓴다
- 사용자의 경험, 수치, 점수, 기간, 교재명은 지어내지 않는다. 모르는 부분은 `<div class="todo">[직접 작성] ...</div>` 로 남긴다
- 시험 기준, 일정처럼 바뀔 수 있는 외부 정보는 공식 출처 확인을 권하는 문장을 함께 쓴다
- 사용자 이메일은 사이트에 노출하지 않는다. 연락처는 GitHub(`https://github.com/seoyeon1011`)만 쓴다

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

| 슬러그 | 표시 이름 |
| --- | --- |
| seo-content | 콘텐츠·SEO |
| automation | 자동화 |
| certificate | 자격증 |

카테고리를 새로 만들면 모든 페이지의 헤더 메뉴, posts.html 필터 버튼, index.html 주제별 보기, sitemap.xml, `admin/index.html` 의 카테고리 선택, `admin/admin.js` 의 `CATS` 를 함께 고친다.
