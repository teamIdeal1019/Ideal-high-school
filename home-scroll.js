/*
 * 홈 · 시각적 중앙 스크롤
 * 공지사항/이상광장의 실제 경계와 전체 뷰포트 중앙을 사용합니다.
 * 첫 화면·모집 섹션의 크기를 변경하거나 다른 페이지의 스크롤을 가로채지 않습니다.
 */
"use strict";
(() => {
  if (document.body.dataset.page !== 'home') return;

  const root = document.documentElement;
  const ids = ['notices', 'plaza'];
  const media = window.matchMedia('(min-width: 881px) and (min-height: 651px) and (prefers-reduced-motion: no-preference)');
  const prefersMotion = () => media.matches;
  const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const clamp = value => Math.max(0, Math.min(maxScroll(), value));
  const position = element => {
    const rect = element.getBoundingClientRect();
    return clamp(window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2);
  };

  let timer = 0;
  let frame = 0;
  let animating = false;
  let ready = false;
  let suspendedUntil = 0;
  let previousY = window.scrollY;
  const now = () => performance.now();
  const cancelTimer = () => { clearTimeout(timer); timer = 0; };

  // 사용자의 입력은 프로그램 이동보다 우선합니다.
  function cancelAnimation() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    animating = false;
    root.style.scrollBehavior = '';
  }

  function suspend(ms = 550) {
    cancelTimer();
    cancelAnimation();
    suspendedUntil = now() + ms;
  }

  // 네이티브 smooth가 CSS 설정과 충돌하지 않도록 직접 보간합니다.
  // 이미지를 포함한 실제 레이아웃을 측정하므로 콘텐츠 높이가 변해도 보정됩니다.
  function moveTo(element) {
    // 외부에서도 사용할 수 있도록 ID 또는 요소를 받습니다.
    if (typeof element === 'string') element = document.getElementById(element);
    if (!element) return;
    cancelTimer();
    cancelAnimation();
    const start = window.scrollY;
    const target = position(element);
    const distance = target - start;
    if (Math.abs(distance) < 2) return;
    const duration = Math.min(500, Math.max(260, Math.abs(distance) * .42));
    const began = now();
    animating = true;
    root.style.scrollBehavior = 'auto';

    const step = time => {
      if (!animating) return;
      const progress = Math.min(1, (time - began) / duration);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      const next = clamp(start + (position(element) - start) * eased);
      window.scrollTo({top: next, behavior: 'instant'});
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        frame = 0;
        animating = false;
        root.style.scrollBehavior = '';
        suspendedUntil = now() + 500;
        previousY = window.scrollY;
      }
    };
    frame = requestAnimationFrame(step);
  }

  // 버튼·메뉴·직접 URL 모두 동일한 중앙 좌표를 사용합니다.
  function navigate(id, options = {}) {
    const element = document.getElementById(id);
    if (!element) return false;
    if (options.updateHash !== false) {
      history.pushState(null, '', `${location.pathname}${location.search}#${id}`);
    }
    // 작은 화면이나 움직임 감소 설정에서는 일반적인 이동을 사용합니다.
    if (!prefersMotion() || element.getBoundingClientRect().height > window.innerHeight + 2) {
      element.scrollIntoView({behavior: 'auto', block: 'start'});
    } else {
      moveTo(element);
    }
    return true;
  }
  window.IDEAL_HOME_SCROLL = {moveTo: navigate, suspend, position: id => {
    const element = document.getElementById(id);
    return element ? position(element) : null;
  }};

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !['#notices', '#plaza'].includes(url.hash)) return;
    event.preventDefault();
    navigate(url.hash.slice(1));
  });

  function settle() {
    timer = 0;
    if (!ready || !prefersMotion() || animating || now() < suspendedUntil) return;
    // 명시적인 앵커도 동일한 중앙 정렬 함수를 사용합니다.

    const viewport = window.innerHeight;
    const middle = viewport / 2;
    const candidates = ids.map(id => document.getElementById(id)).filter(Boolean)
      .map(element => {
        const rect = element.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const target = position(element);
        return {element, rect, distance: Math.abs(center - middle), target};
      });
    candidates.sort((a, b) => a.distance - b.distance);
    const nearest = candidates[0];
    if (!nearest) return;

    // 섹션이 화면보다 길면 중간 콘텐츠를 읽는 동안 강제로 이동하지 않습니다.
    if (nearest.rect.height > viewport + 2) return;
    // 중앙에서 너무 멀리 떨어진 위치에서는 일반 스크롤을 유지합니다.
    if (nearest.distance > viewport * .42) return;
    // 스크롤 끝에서는 도달할 수 없는 중앙을 반복해서 요청하지 않습니다.
    if (Math.abs(nearest.target - window.scrollY) < 2) return;
    moveTo(nearest.element);
  }

  function schedule() {
    cancelTimer();
    if (!ready || !prefersMotion() || animating || now() < suspendedUntil) return;
    timer = setTimeout(settle, 170);
  }

  function onScroll() {
    const y = window.scrollY;
    if (!animating) {
      schedule();
    }
    previousY = y;
  }

  // 입력 중에는 스냅하지 않고, 손을 뗀 다음 짧은 시간 후에만 정렬합니다.
  window.addEventListener('wheel', () => {
    if (animating) cancelAnimation();
    cancelTimer();
  }, {passive: true});
  window.addEventListener('touchstart', () => suspend(350), {passive: true});
  window.addEventListener('pointerdown', () => suspend(350), {passive: true});
  window.addEventListener('keydown', event => {
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) suspend(350);
  });
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', () => { suspend(300); }, {passive: true});
  media.addEventListener('change', () => suspend(300));
  window.addEventListener('hashchange', () => suspend(650));
  window.addEventListener('popstate', () => suspend(650));

  document.addEventListener('ideal:page-ready', event => {
    if (event.detail?.page !== 'home') return;
    ready = true;
    previousY = window.scrollY;
    // 첫 진입 및 복원 위치는 브라우저에 맡깁니다.
    suspendedUntil = now() + 1000;
  });

  // 스크립트가 페이지 준비 신호보다 늦게 실행되는 경우도 지원합니다.
  if (document.querySelector('#notices') && document.querySelector('#plaza')) {
    ready = true;
    suspendedUntil = now() + 1000;
  }
})();
