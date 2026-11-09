// Ref(레프) 지식창고 공통 스크립트. 콘텐츠는 모두 HTML에 들어 있고, 이 파일은 편의 기능만 담당한다.
(function () {
  // 모바일 메뉴
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // 메뉴 묶음: 클릭(터치)으로 열고 닫기. 마우스를 올리거나 키보드로 들어가도 열린다(CSS)
  var groups = document.querySelectorAll('.nav .has-sub');
  function closeGroups(except) {
    groups.forEach(function (g) {
      if (g === except) return;
      g.classList.remove('open');
      g.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false');
    });
  }
  groups.forEach(function (g) {
    var btn = g.querySelector('.sub-toggle');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = g.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      closeGroups(g);
    });
  });
  document.addEventListener('click', function () { closeGroups(null); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeGroups(null); });

  // 목차: 본문 h2에 id가 있으면 자동 생성
  var toc = document.querySelector('[data-toc]');
  var heads = document.querySelectorAll('.prose h2[id]');
  if (toc && heads.length >= 3) {
    var ol = document.createElement('ol');
    heads.forEach(function (h) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      ol.appendChild(li);
    });
    toc.appendChild(ol);
    toc.hidden = false;
  }

  // 글 수정 버튼: 이 브라우저에서 관리자 화면(/admin/)에 로그인한 적이 있을 때만 보인다.
  // 버튼이 보여도 실제 수정·게시는 GitHub 토큰이 있어야 가능하다.
  var isAdmin = false;
  try { isAdmin = localStorage.getItem('ref_admin') === '1'; } catch (e) {}
  var slugMatch = location.pathname.match(/\/posts\/([a-z0-9-]+)\.html$/);
  var meta = document.querySelector('.post-meta');
  if (isAdmin && slugMatch && meta) {
    var edit = document.createElement('a');
    edit.className = 'edit-link';
    edit.href = '/admin/?edit=' + slugMatch[1];
    edit.textContent = '수정';
    edit.rel = 'nofollow';
    meta.appendChild(edit);
  }

  // 전체 글 페이지: 검색 + 카테고리 필터
  var list = document.querySelector('[data-post-list]');
  if (list) {
    var input = document.querySelector('[data-search]');
    var buttons = document.querySelectorAll('[data-filter]');
    var empty = document.querySelector('.empty');
    var current = 'all';
    var params = new URLSearchParams(location.search);
    if (params.get('cat')) current = params.get('cat');

    function apply() {
      var q = (input.value || '').trim().toLowerCase();
      var shown = 0;
      list.querySelectorAll('.card').forEach(function (card) {
        var okCat = current === 'all' || card.dataset.cat === current;
        var okText = !q || card.textContent.toLowerCase().indexOf(q) !== -1 || (card.dataset.keywords || '').toLowerCase().indexOf(q) !== -1;
        var show = okCat && okText;
        card.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.filter === current ? 'true' : 'false'); });
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { current = b.dataset.filter; apply(); });
    });
    input.addEventListener('input', apply);
    apply();
  }
})();
