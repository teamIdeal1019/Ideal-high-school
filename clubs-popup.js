/*
 * 동아리활동 · 정방형 이미지 팝업
 *
 * 이 파일은 clubs.html에서만 불러옵니다.
 * 팝업 설정은 config.js, 이미지는 assets/popups/에서 관리합니다.
 * 외부 라이브러리나 별도 서버는 필요하지 않습니다.
 */
"use strict";

(() => {
  // 다른 페이지에서 실수로 불러와도 팝업을 생성하지 않습니다.
  if (document.body.dataset.page !== "clubs") return;

  const settings = window.IDEAL_CLUB_POPUP || {};
  if (settings.enabled === false) return;

  // 오늘 하루 보지 않기는 한국시간의 날짜를 기준으로 저장합니다.
  const storageKey = `ideal:club-popup:hidden:${String(settings.version || "1")}`;
  const koreaToday = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    const date = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${date.year}-${date.month}-${date.day}`;
  };

  // 사생활 보호 모드 등으로 localStorage가 차단되어도 팝업은 정상 동작합니다.
  const readStorage = () => {
    try { return localStorage.getItem(storageKey); }
    catch { return null; }
  };

  const writeStorage = value => {
    try { localStorage.setItem(storageKey, value); }
    catch { /* 저장할 수 없으면 이번 닫기만 처리합니다. */ }
  };

  // 코드나 시트에 임의의 HTML을 삽입하지 않고, 이미지 경로만 사용합니다.
  const imageUrl = value => {
    try {
      const url = new URL(value, document.baseURI);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  };

  let opened = false;

  function openPopup() {
    if (opened || readStorage() === koreaToday()) return;
    const source = imageUrl(settings.image || "assets/popups/clubs-popup.png");
    if (!source) return;
    opened = true;

    const previousFocus = document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.className = "club-popup";
    dialog.setAttribute("aria-label", "동아리활동 안내");
    dialog.setAttribute("aria-describedby", "club-popup-description");

    const frame = document.createElement("div");
    frame.className = "club-popup-frame";

    const image = document.createElement("img");
    image.className = "club-popup-image";
    image.src = source;
    image.alt = "동아리활동 안내 이미지";
    image.width = 1200;
    image.height = 1200;
    image.addEventListener("error", () => dialog.close(), {once: true});

    const closeIcon = document.createElement("button");
    closeIcon.type = "button";
    closeIcon.className = "club-popup-x";
    closeIcon.setAttribute("aria-label", "팝업 닫기");
    closeIcon.textContent = "×";
    closeIcon.addEventListener("click", () => dialog.close());

    const description = document.createElement("p");
    description.id = "club-popup-description";
    description.className = "sr-only";
    description.textContent = "동아리활동 안내 이미지입니다. 닫기 또는 오늘 하루 보지 않기를 선택할 수 있습니다.";

    const actions = document.createElement("div");
    actions.className = "club-popup-actions";

    const hideToday = document.createElement("button");
    hideToday.type = "button";
    hideToday.className = "club-popup-today";
    hideToday.textContent = "오늘 하루 보지 않기";
    hideToday.addEventListener("click", () => {
      writeStorage(koreaToday());
      dialog.close();
    });

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "club-popup-close";
    closeButton.textContent = "닫기";
    closeButton.addEventListener("click", () => dialog.close());

    actions.append(hideToday, closeButton);
    frame.append(image, closeIcon, description, actions);
    dialog.append(frame);
    document.body.append(dialog);

    // 네이티브 dialog가 포커스 이동, 배경 비활성화 및 ESC 동작을 처리합니다.
    const scrollY = window.scrollY;
    document.documentElement.classList.add("club-popup-open");
    document.body.classList.add("club-popup-open");
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("club-popup-open");
      document.body.classList.remove("club-popup-open");
      dialog.remove();
      if (previousFocus && previousFocus.isConnected && previousFocus.focus) {
        previousFocus.focus({preventScroll: true});
      }
      // 닫힌 후에도 사용자가 보던 위치를 유지합니다.
      if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);
    }, {once: true});

    // 팝업 바깥의 어두운 배경을 클릭해도 닫을 수 있습니다.
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) {
        dialog.close();
      }
    });

    dialog.showModal();
    closeIcon.focus({preventScroll: true});
  }

  // CMS 로딩과 페이지 렌더링이 끝난 뒤, 동아리활동에서만 한 번 엽니다.
  document.addEventListener("ideal:page-ready", event => {
    if (event.detail && event.detail.page === "clubs") openPopup();
  });
})();
