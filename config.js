/**
 * 이상고등학교 · 구글 시트 연결 설정
 *
 * 최초 한 번만 apiUrl에 배포된 Apps Script 웹 앱의 /exec 주소를 입력합니다.
 * 이 URL은 공개 콘텐츠 읽기 전용 주소이며, 비밀번호나 API 키가 아닙니다.
 * 빈 값인 동안에는 fallback-content.js의 안전한 기본 콘텐츠가 표시됩니다.
 */
window.IDEAL_CMS_CONFIG = {
  apiUrl: "https://script.google.com/macros/s/AKfycbytt2agTqQVvnmyBZ98-X0sx3gYwiSk-IheX1ImlcJae-cwFjVvzzWH6fu3ZzuZYtKq/exec",
  siteUrl: "https://ideal.sen.hs.io.kr/",
  // 새 CMS 스프레드시트를 Google Sheets로 올린 뒤 그 주소를 기록해 둘 수 있습니다.
  sheetUrl: "https://docs.google.com/spreadsheets/d/1LMJAuGOzNZPqzRtF6s7Z9v3YlOEdJTNly3Yt88hpDU0/edit?gid=1314616080#gid=1314616080",
  requestTimeout: 12000,

  // 규칙 원문 전용 Apps Script 웹앱. 이상위키 Google Docs의 `3. 규칙`을 읽어
  // 웹사이트용 데이터만 반환합니다. 규칙 추가/삭제/수정은 원본 문서에서 자동 반영됩니다.
  rulesApiUrl: "https://script.google.com/macros/s/AKfycbwaGxsF1XGFbe9CCWXRbw9fFdjwqP0lSJTXf55Ab4slpuV_yRM3sYOT6RfC2G69wk_iSg/exec",
  rulesWikiDocumentUrl: "https://docs.google.com/document/d/1MtoMEaBiY6oxagLoxrlVnCw6KFrMoA4ul-Q90Z6bxdQ/edit",

  // 동아리활동 전용 CMS. 아래 Apps Script를 별도 스프레드시트에 배포한 뒤 /exec 주소를 입력하세요.
  // 빈 값이면 현재 fallback-content.js의 부서 정보가 그대로 표시됩니다.
  clubsApiUrl: "https://script.google.com/macros/s/AKfycbwytX2ejLWtoSavzj8foyU92jJsl7Nk6rOY-p7WztBTltv6UP_D_tiZMyAmwn0YibKlPQ/exec",
  clubsSheetUrl: "https://docs.google.com/spreadsheets/d/1d8cvfmPSQci7Yef7lTEWqDiXHJjl9Y2DRDD-QGQ2nu4/edit?gid=1402537910#gid=1402537910"
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
