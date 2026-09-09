/**
 * 이상고등학교 · 구글 시트 연결 설정
 *
 * 최초 한 번만 apiUrl에 배포된 Apps Script 웹 앱의 /exec 주소를 입력합니다.
 * 이 URL은 공개 콘텐츠 읽기 전용 주소이며, 비밀번호나 API 키가 아닙니다.
 * 빈 값인 동안에는 fallback-content.js의 안전한 기본 콘텐츠가 표시됩니다.
 */
window.IDEAL_CMS_CONFIG = {
  apiUrl: "",
  siteUrl: "https://ideal.sen.hs.io.kr/",
  // local: 사이트 파일의 공지사항을 사용합니다. sheets: 시트의 공지사항을 사용합니다.
  noticesSource: "local",
  sheetUrl: "https://docs.google.com/spreadsheets/d/1QaU5QsDVSaiLKKay0TLmfus-Lc5FVPjjqqmBV8igGBA/edit",
  requestTimeout: 12000
};

/**
 * 동아리활동 페이지 전용 팝업
 *
 * enabled: false로 바꾸면 팝업이 열리지 않습니다.
 * image: 교체할 정방형 이미지의 경로입니다.
 * version: 새 안내를 게시할 때 변경하면 이전 '오늘 하루 보지 않기' 기록과 분리됩니다.
 *          평소 이미지만 수정할 때는 변경하지 않아도 됩니다.
 *
 * 이 팝업은 모집 안내와 무관하며, 다른 페이지에서는 스크립트 자체를 불러오지 않습니다.
 */
window.IDEAL_CLUB_POPUP = {
  enabled: true,
  image: "assets/popups/clubs-popup.png",
  version: "1"
};
