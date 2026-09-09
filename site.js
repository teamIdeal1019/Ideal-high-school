/*
 * 이상고등학교 · 화면과 동작
 *
 * 이 파일은 fallback-content.js의 자료를 HTML로 변환하고 메뉴, 달력, 갤러리를 작동시킵니다.
 * 일반적인 문구·공지·일정·규칙 수정은 fallback-content.js에서 하세요.
 * 화면 구조를 바꿀 때만 이 파일을 수정하고, 디자인은 site.css에서 관리합니다.
 * 외부 라이브러리나 별도 서버 없이 실행되는 정적 홈페이지입니다.
 */
"use strict";
(() => {
    // --- 기본 설정 ---
    // fallback-content.js 데이터
    const D = window.IDEAL_CONTENT;
    // 메인 콘텐츠 영역
    const root = document.querySelector('#main');
    // 현재 페이지 종류
    const page = document.body.dataset.page || 'home';
    // --- 공통 도구 ---
    // HTML 특수문자 처리
    const E = value => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
    // 안전한 외부 URL 확인
    const safeUrl = value => {
        try {
            if (typeof value !== 'string' || !value.trim())
                return '';
            const u = new URL(value, document.baseURI);
            return ['http:', 'https:'].includes(u.protocol)
                ? u.href
                : '';
        }
        catch {
            return '';
        }
    };
    // 날짜 표시 형식
    const date = value => value && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? value.replaceAll('-', '.')
        : '일정 미정';
    // 오늘 날짜 · 한국시간
    const today = () => {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(new Date());
        const v = Object.fromEntries(parts.map(x => [x.type, x.value]));
        return `${v.year}-${v.month}-${v.day}`;
    };
    // 오늘이 속한 달
    const todayDate = () => {
        const [y, m] = today().split('-').map(Number);
        return new Date(y, m - 1, 1);
    };
    // 링크 생성
    const a = (href, label, cls = '', external = false) => `<a class="${E(cls)}" href="${E(href)}"${external
        ? ' target="_blank" rel="noopener noreferrer"'
        : ''}>${label}</a>`;
    // 외부 링크 생성
    const ext = (url, label, cls = '') => safeUrl(url)
        ? a(safeUrl(url), label, cls, true)
        : `<span class="unavailable-link" aria-disabled="true">${label} · 링크 준비 중</span>`;
    // 편집 안내문
    const note = text => `<p class="editor-note">${E(text)}</p>`;
    // 공통 섹션
    const section = (content, cls = '', id = '') => `<section class="section ${E(cls)}"${id ? ` id="${E(id)}"` : ''}>
      <div class="container">
        ${content}
      </div>
    </section>`;
    // 섹션 제목
    const head = (title, sub = '') => `<div class="section-head">
      <div>
        <h2 class="section-title">${E(title)}</h2>
        ${sub
        ? `<p class="section-lead">${E(sub)}</p>`
        : ''}
      </div>
    </div>`;
    // 하위 페이지 상단 배너
    const pageHero = (title, sub) => `<section class="page-hero">
      <div class="container">
        <h1>${E(title)}</h1>
        <p>${E(sub)}</p>
      </div>
    </section>`;
    // --- 메뉴 ---
    // 상단·하단 공통 메뉴
    const navItems = [
        ['학교소개', 'about.html', 'about'],
        ['학사일정', 'calendar.html', 'calendar'],
        ['학교생활', 'life.html', 'life'],
        ['동아리활동', 'clubs.html', 'clubs'],
        ['공지사항', 'index.html#notices', 'notices']
    ];
    // 학교 로고
    // 헤더와 푸터는 서로 다른 파일 에셋을 사용합니다.
    // - 헤더: assets/branding/site-crest-header.png
    // - 푸터: assets/branding/site-crest-footer.png
    const headerBrand = () => `<a href="index.html" class="brand brand-header" aria-label="이상고등학교 홈으로 이동">
      <img src="assets/branding/site-crest-header.png" alt="이상고등학교 로고" width="1850" height="624" decoding="async" fetchpriority="high">
    </a>`;

    const footerBrand = () => `<a href="index.html" class="brand brand-footer" aria-label="이상고등학교 홈으로 이동">
      <img src="assets/branding/site-crest-footer.png" alt="이상고등학교 로고" width="1850" height="624" decoding="async">
    </a>`;
    // --- 헤더 ---
    document.querySelector('#site-header').innerHTML =
        `<header class="site-header site-chrome">
      <div class="container header-row">

        ${headerBrand()}

        <button
          class="menu-button"
          type="button"
          aria-label="메뉴 열기"
          aria-controls="site-nav"
          aria-expanded="false"
        >
          ☰
        </button>

        <nav
          class="nav"
          id="site-nav"
          aria-label="주 메뉴"
        >
          ${navItems
            .map(([n, u, id]) => a(u, E(n), page === id ? 'active' : ''))
            .join('')}
        </nav>

      </div>
    </header>`;
    // --- 푸터 ---
    // 플랫폼 URL은 사이트설정 탭에서, 아이콘은 assets/social/에서 관리합니다.
    const socialPlatforms = [
        ['유튜브', 'youtube', 'youtubeUrl'],
        ['틱톡', 'tiktok', 'tiktokUrl'],
        ['포스타입', 'postype', 'postypeUrl'],
        ['인스타그램', 'instagram', 'instagramUrl'],
        ['X', 'x', 'xUrl'],
        ['마플샵', 'marpple', 'marppleUrl']
    ];

    const socialLinks = () => socialPlatforms.map(([name, icon, key]) => {
        const url = safeUrl(D.site[key]);
        return url ? `<a class="footer-social-link" href="${E(url)}"
            target="_blank" rel="noopener noreferrer" aria-label="${E(name)} (새 창)">
            <img src="assets/social/${icon}.svg" alt="" width="16" height="16">
            <span>${E(name)}</span>
        </a>` : '';
    }).join('');

    function renderFooter() {
        document.querySelector('#site-footer').innerHTML = `<footer class="footer site-chrome">
            <div class="container">
                <div class="footer-row">
                    <div class="footer-identity">
                        ${footerBrand()}
                    </div>
                    <nav class="footer-socials" aria-label="팀 이상 공식 플랫폼">
                        ${socialLinks()}
                    </nav>
                </div>
                <nav class="footer-nav" aria-label="하단 메뉴">
                    ${navItems.map(([n,u,id]) => a(u,E(n),page===id?'active':'')).join('')}
                </nav>
                <div class="footer-bottom">
                    <p>© ${new Date().getFullYear()} Team Ideal. All rights reserved.</p>
                    <div class="footer-utilities">
                        ${a('#top','맨 위로 ↑')}
                    </div>
                </div>
            </div>
        </footer>`;
    }
    // --- 모바일 메뉴 ---
    const menu = document.querySelector('.menu-button');
    // 메뉴 닫기
    const closeMenu = () => {
        document
            .querySelector('#site-nav')
            .classList
            .remove('open');
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', '메뉴 열기');
    };
    // 메뉴 버튼
    menu.addEventListener('click', () => {
        const on = document
            .querySelector('#site-nav')
            .classList
            .toggle('open');
        menu.setAttribute('aria-expanded', String(on));
        menu.setAttribute('aria-label', on ? '메뉴 닫기' : '메뉴 열기');
    });
    // ESC로 닫기
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
    // 메뉴 선택 후 닫기
    document.addEventListener('click', e => {
        if (e.target.closest('#site-nav a')) {
            closeMenu();
        }
    });
    // --- 공지사항 공통 ---
    // 게시글은 fallback-content.js의 posts 한 곳에서 관리합니다.
    // order가 작을수록 먼저 표시하고, 같은 순서라면 최신 게시일이 우선입니다.
    // published: false인 초안은 previewDrafts가 켜져 있을 때만 보입니다.
    const allPosts = () => D.posts
        .filter(p => p.published || D.site.previewDrafts)
        .sort((a, b) =>
            (a.order ?? 100) - (b.order ?? 100) ||
            (b.date || '').localeCompare(a.date || '')
        );

    const postUrl = p => `post.html?id=${encodeURIComponent(p.id)}`;
    const noticeHome = 'index.html#notices';

    // 현재 모집은 대표 모집글을 우선 사용합니다.
    // 지난 기수의 모집 기록을 현재 모집으로 잘못 인식하지 않도록 archive를 제외합니다.
    const recruitment = () => {
        const posts = D.posts.filter(p =>
            p.category === '모집' && !p.archive &&
            (p.published || D.site.previewDrafts)
        );
        return posts.find(p => p.featured) ||
            posts.find(p => p.published) ||
            posts[0] || null;
    };

    // --- 모집 상태 ---
    function recruitmentState(p) {
        // 공지 없음
        if (!p || p.published === false || p.archive) {
            return {
                label: '모집 준비 중',
                open: false
            };
        }
        const now = today();
        // 날짜 형식 오류
        if (!/^\d{4}-\d{2}-\d{2}$/.test(p.start || '') ||
            !/^\d{4}-\d{2}-\d{2}$/.test(p.end || '') ||
            p.start > p.end) {
            return {
                label: '일정 확인 중',
                open: false
            };
        }
        // 모집 전
        if (p.start && now < p.start) {
            return {
                label: '모집 예정',
                open: false
            };
        }
        // 모집 종료
        if (p.end && now > p.end) {
            return {
                label: '모집 마감',
                open: false
            };
        }
        // 모집 진행 중
        return {
            label: '모집 중',
            open: true
        };
    }
    // 모집 기간
    const period = p => p?.start || p?.end
        ? `${p.start
            ? date(p.start)
            : '시작일 미정'} ~ ${p.end
            ? date(p.end)
            : '마감일 미정'}`
        : '모집 기간 미정';
    // --- 메인 · 신입생 모집 ---
    // 모집의 제목·합격 발표일·오픈채팅 주소는 fallback-content.js의 admission에서 관리합니다.
    // 모집 기간은 대표 모집 공지의 start/end와 연동합니다.
    // 실제 URL이 없으면 버튼을 비활성화하여 잘못된 주소로 이동하지 않게 합니다.
    function admissionSection() {
        const p = recruitment();
        const admission = D.admission || {};

        // 메인에서 사용할 모집 안내 정보
        const title = admission.title || '7기 팀원 모집';
        const resultDate = admission.resultDate || '';
        const chatUrl = admission.openChatUrl || '';
        const schedule = {start: admission.start || '', end: admission.end || ''};
        const status = recruitmentState(schedule);

        // 날짜가 확정되지 않았을 때는 임의의 날짜를 표시하지 않습니다.
        const resultLabel = /^\d{4}-\d{2}-\d{2}$/.test(resultDate)
            ? date(resultDate)
            : '발표일 미정';

        // 모집글이 없으면 홈의 공지사항으로 이동합니다.
        const recruitmentUrl = safeUrl(admission.guidelinesUrl) || (p ? postUrl(p) : noticeHome);

        // 외부 오픈채팅 링크는 기존의 안전한 URL 처리 도구를 사용합니다.
        const chatButton = safeUrl(chatUrl)
            ? ext(chatUrl, '오픈채팅방 바로가기 <span aria-hidden="true">↗</span>', 'recruitment-chat')
            : `<span class="recruitment-chat recruitment-chat-disabled" aria-disabled="true">
                오픈채팅방 바로가기 <span aria-hidden="true">↗</span>
                <small>링크 준비 중</small>
              </span>`;

        // 하단의 세 링크는 실제 페이지 또는 대표 모집 공지로 연결합니다.
        const links = [
            ['01', '모집요강', '모집 일정과 지원 방법을 확인하세요.', recruitmentUrl],
            ['02', '부서안내', '여섯 부서의 활동을 살펴보세요.', 'clubs.html'],
            ['03', '학교소개', '팀 이상의 가치관과 연혁을 읽어보세요.', 'about.html']
        ];

        return section(`
          ${head('입학 안내')}

          <div class="recruitment-panel">
            <div class="recruitment-summary">
              <span class="status-badge">${E(admission.status || status.label)}</span>
              <h3>${E(title)}</h3>
              <p>${E(admission.description || '')}</p>
            </div>

            <div class="recruitment-side">
              <dl class="recruitment-details">
                <div>
                  <dt>모집기간</dt>
                  <dd>${E(period(schedule))}</dd>
                </div>
                <div>
                  <dt>합격자 발표일</dt>
                  <dd>${E(resultLabel)}</dd>
                </div>
              </dl>
              ${chatButton}
            </div>
          </div>

          <nav class="recruitment-links" aria-label="신입생 모집 관련 안내">
            ${links.map(([number, title, description, url]) => a(url, `
              <span class="recruitment-link-number">${number}</span>
              <span class="recruitment-link-copy">
                <strong>${E(title)}</strong>
                <small>${E(description)}</small>
              </span>
              <span class="recruitment-link-arrow" aria-hidden="true">↗</span>
            `, 'recruitment-link', /^https?:\/\//i.test(url))).join('')}
          </nav>
        `, 'section-gray admission-section');
    }
    // --- 메인 카테고리 ---
    // 다섯 메뉴는 하나의 연결된 패널로 표시합니다.
    // 숫자와 보조 설명 없이 이름과 바로가기만 보여줍니다.
    function categoryNav() {
        return `
      <div class="category-wrap">
        <div class="container">
          <nav class="category-grid" aria-label="주요 카테고리">
            ${navItems.map(([name, url]) => a(url, `
              <strong>${E(name)}</strong>
              <small>자세히 보기 ↗</small>
            `, 'category-card')).join('')}
          </nav>
        </div>
      </div>
    `;
    }
    // --- 작품 데이터 ---
    // 등록된 작품만 실제 개수에 포함합니다. 대기 공간은 제외합니다.
    function works() {
        return Array.isArray(D.works)
            ? D.works.filter(w => w && w.title && !w.sample && w.published !== false).sort((a,b)=>(a.order ?? 100)-(b.order ?? 100))
            : [];
    }
    // 작품 공간 · 각 대기 슬롯은 독립적인 ID와 분류를 갖습니다.
    // 시트에 실제 작품이 등록되면 해당 순서의 대기 슬롯을 대체합니다.
    function slots() {
        const registered = works();
        const placeholders = D.workSlots || [];
        return Array.from({length: Math.max(40, registered.length, placeholders.length)}, (_, i) =>
            registered[i] || placeholders[i] || {
                id: `slot-${i + 1}`, title: `작품 등록 공간 ${String(i + 1).padStart(2, '0')}`,
                category: '정식컨', image: 'assets/works-placeholder.svg',
                description: '공개할 작품을 준비 중입니다.', sample: true
            });
    }
    // --- 작품 카드 ---
    function workCard(w) {
        const image = safeUrl(w.image)
            ? safeUrl(w.image)
            : 'assets/works-placeholder.svg';
        const label = w.category || '정식컨';
        const content = `<div class="work-thumb">

        <img
          src="${E(image)}"
          alt="${E(w.alt || '')}"
          loading="lazy"
          decoding="async"
          width="640" height="360"
          onerror="this.onerror=null;this.src='assets/works-placeholder.svg'"
        >

        <span class="work-badge">
          ${E(label)}
        </span>

      </div>

      <div class="work-info">
        <h3>${E(w.title)}</h3>
        <p>
          ${E(w.description ||
            w.category ||
            '')}
        </p>
      </div>`;
        const url = safeUrl(w.url);
        return url && !w.sample
            ? `<a
          class="work-card is-link"
          href="${E(url)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="${E(w.title)} 보기"
        >
          ${content}
        </a>`
            : `<article class="work-card">
          ${content}
        </article>`;
    }
    // --- 메인 · 이상광장 ---
    function plaza() {
        return `
      <section
        class="section section-navy plaza"
        id="plaza"
      >

        <div class="container">

          <div class="section-head plaza-head">

            <div>
              <h2 class="section-title">
                이상광장
              </h2>

              <p class="section-lead">
                팀 이상이 함께 완성한 작품을 모아보는 창작 갤러리입니다.
              </p>
            </div>

            <div class="plaza-controls">

              <button
                class="circle-button"
                id="plaza-prev"
                aria-label="이전 작품"
              >
                ←
              </button>

              <button
                class="circle-button"
                id="plaza-pause"
                aria-label="자동 이동 일시정지"
                aria-pressed="false"
              >
                Ⅱ
              </button>

              <button
                class="circle-button"
                id="plaza-next"
                aria-label="다음 작품"
              >
                →
              </button>

            </div>

          </div>

        </div>

        <div
          class="work-viewport"
          id="work-viewport"
          tabindex="0"
          aria-label="작품 갤러리. 좌우 화살표 키로 이동할 수 있습니다."
        >

          <div
            class="work-track"
            id="work-track"
          >
            ${slots().map(workCard).join('')}
          </div>

        </div>

        <div class="container">

          <p class="plaza-note">
            팀 이상에서 완성한 작품 총 ${works().length}개. 팀원들의 창작 열정은 계속됩니다.
          </p>

          ${a('gallery.html', '이상광장 전체 보기 →', 'button button-outline plaza-all')}

        </div>

      </section>
    `;
    }
    // --- 이상광장 슬라이드 ---
    let disposePlaza = () => {};
    let plazaState = {offset: 0, paused: false};
    function setupPlaza() {
        disposePlaza();
        const view = document.querySelector('#work-viewport');
        const track = document.querySelector('#work-track');
        if (!view)
            return;
        // 슬라이드 상태
        let offset = plazaState.offset;
        let last = 0;
        let raf = 0;
        let paused = plazaState.paused;
        let dragging = false;
        let startX = 0;
        let startOffset = 0;
        let moved = false;
        let hover = false;
        let visible = true;
        // 모션 감소 설정
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        // 최대 이동 거리
        const max = () => Math.max(0, track.scrollWidth -
            view.clientWidth);
        // 카드 한 칸 이동 거리
        const step = () => {
            const card = track.querySelector('.work-card');
            return card
                ? card.getBoundingClientRect().width + 18
                : 328;
        };
        // 슬라이드 이동
        const move = amount => {
            offset = Math.max(0, Math.min(max(), offset + amount));
            track.style.transform =
                `translate3d(${-offset}px,0,0)`;
        };
        // 재생 버튼 상태
        const update = () => {
            const b = document.querySelector('#plaza-pause');
            b.textContent =
                paused ? '▶' : 'Ⅱ';
            b.setAttribute('aria-pressed', String(paused));
            b.setAttribute('aria-label', paused
                ? '자동 이동 재개'
                : '자동 이동 일시정지');
        };
        // 이전 작품
        document
            .querySelector('#plaza-prev')
            .onclick =
            () => move(-step());
        // 다음 작품
        document
            .querySelector('#plaza-next')
            .onclick =
            () => move(step());
        // 자동 이동 정지·재생
        document
            .querySelector('#plaza-pause')
            .onclick =
            () => {
                paused = !paused;
                update();
            };
        // 드래그 시작
        view.addEventListener('pointerdown', e => {
            if (e.button !== 0)
                return;
            dragging = true;
            moved = false;
            startX = e.clientX;
            startOffset = offset;
            view.classList.add('dragging');
            if (e.pointerType === 'mouse') {
                e.preventDefault();
            }
        });
        // 드래그 이동
        const onPointerMove = e => {
            if (!dragging)
                return;
            const delta = e.clientX - startX;
            if (Math.abs(delta) > 5) {
                moved = true;
            }
            offset = Math.max(0, Math.min(max(), startOffset - delta));
            track.style.transform =
                `translate3d(${-offset}px,0,0)`;
        };
        window.addEventListener('pointermove', onPointerMove);
        // 드래그 종료
        const endDrag = () => {
            dragging = false;
            view.classList.remove('dragging');
        };
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);
        // 드래그 후 링크 클릭 방지
        view.addEventListener('click', e => {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
                moved = false;
            }
        }, true);
        // 마우스 올라감
        view.addEventListener('mouseenter', () => hover = true);
        view.addEventListener('mouseleave', () => hover = false);
        // 키보드 좌우 이동
        view.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight' ||
                e.key === 'ArrowLeft') {
                e.preventDefault();
                move(e.key === 'ArrowRight'
                    ? step()
                    : -step());
            }
        });
        // 화면 표시 여부
        const observer = new IntersectionObserver(entries => visible =
            entries[0].isIntersecting, {
            threshold: .05
        });
        observer.observe(view);
        // 자동 슬라이드
        const tick = t => {
            if (last &&
                !paused &&
                !reduced.matches &&
                !dragging &&
                !hover &&
                !view.matches(':focus-within') &&
                !document.hidden &&
                visible) {
                offset +=
                    Math.min(t - last, 50) * .025;
                if (offset > max()) {
                    offset = 0;
                }
                track.style.transform =
                    `translate3d(${-offset}px,0,0)`;
            }
            last = t;
            raf =
                requestAnimationFrame(tick);
        };
        raf =
            requestAnimationFrame(tick);
        // Recreate only the animation frame after a back-forward cache restore.
        const stopFrame = () => { cancelAnimationFrame(raf); raf = 0; last = 0; };
        const resumeFrame = () => { if (!raf && view.isConnected) raf = requestAnimationFrame(tick); };
        window.addEventListener('pagehide', stopFrame);
        window.addEventListener('pageshow', resumeFrame);
        disposePlaza = () => {
            plazaState = {offset, paused};
            stopFrame();
            observer.disconnect();
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', endDrag);
            window.removeEventListener('pointercancel', endDrag);
            window.removeEventListener('pagehide', stopFrame);
            window.removeEventListener('pageshow', resumeFrame);
        };
        offset = Math.min(max(), Math.max(0, offset));
        track.style.transform = `translate3d(${-offset}px,0,0)`;
        update();
    }
    // --- 홈 · 공지사항 게시판 ---
    // 게시글이 세 개여도 다섯 줄을 유지합니다. 나머지는 내용과 링크가 없는 빈 줄입니다.
    // 글이 다섯 개보다 많아지면 모두 표시하며, 기존 날짜·분류·본문 데이터는 그대로 사용합니다.
    function homeNotices() {
        const posts = allPosts();
        const rows = Array.from({length: Math.max(5, posts.length)}, (_, i) => {
            const p = posts[i];
            if (!p) return `<tr class="home-board-row is-empty" aria-label="빈 공지 공간">
                <td class="home-board-number"></td>
                <td class="home-board-category"></td>
                <th scope="row" class="home-board-title"></th>
                <td class="home-board-date"></td>
            </tr>`;
            const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(p.date || '')
                ? `<time datetime="${E(p.date)}">${E(date(p.date))}</time>` : '';
            const category = p.category || '공지';
            return `<tr class="home-board-row">
                <td class="home-board-number">${String(i + 1).padStart(2,'0')}</td>
                <td class="home-board-category"><span class="board-category-label">${E(category)}</span></td>
                <th scope="row" class="home-board-title">
                    ${a(postUrl(p),E(p.title),'home-board-link')}
                    ${p.meta ? `<span class="home-board-meta">${E(p.meta)}</span>` : ''}
                </th>
                <td class="home-board-date">${dateLabel}</td>
            </tr>`;
        }).join('');
        const board = `<div class="home-board-scroll">
            <table class="home-board-table">
                <colgroup><col class="home-board-col-number"><col class="home-board-col-category">
                    <col class="home-board-col-title"><col class="home-board-col-date"></colgroup>
                <thead><tr><th scope="col">번호</th><th scope="col">분류</th>
                    <th scope="col">제목</th><th scope="col">게시일</th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>`;
        return section(`${head('공지사항','팀 이상의 소식과 운영 자료를 한곳에서 확인하세요.')}${board}`,
            'home-notices-section','notices');
    }
    // --- 홈 ---
    function home() {
        root.innerHTML =
            `<div class="home-intro-screen" id="home">
      <section
        class="hero"
      >

        <img
          class="hero-wings"
          src="assets/main-illustration.webp"
          alt=""
          aria-hidden="true"
        >

        <div class="container hero-inner">

          <div class="hero-copy">

            <!-- 홈 상단 작은 문구 -->
            <p class="hero-kicker">
              ${E(D.hero?.kicker || '')}
            </p>

            <!-- 홈 메인 문구 -->
            <h1>
              ${E(D.hero?.line1 || '')}<br>
              <em>${E(D.hero?.line2 || '')}</em>
            </h1>

            <!-- 홈 소개 -->
            <p class="hero-desc">
              ${E(D.site.intro)}
            </p>

            <!-- 홈 버튼 -->
            <div class="hero-actions">

              ${a('index.html#admission', '입학 안내 →', 'button button-light')}

              ${a('index.html#plaza', '작품 보러가기 →', 'button button-outline')}

            </div>

          </div>

        </div>

      </section>

      ${categoryNav()}
      </div>

      <div id="admission">
        ${admissionSection()}
      </div>

      <!-- 홈 공지사항: 모든 게시글을 표시하는 통합 게시판 -->
      ${homeNotices()}

      ${plaza()}`;
        setupPlaza();
    }
    // --- 학교소개 ---
    function about() {
        root.innerHTML =
            pageHero('학교소개', '팀 이상의 가치관과 우리가 걸어온 길을 소개합니다.')
                +
                    section(`${head('팀장이 전하는 이야기')}

        ${note('아래 인삿말은 팀장 확인 전 제안문입니다. 실제 팀장의 말씀으로 수정한 뒤 게시해 주세요.')}

        <div class="leader-layout">

          <div class="leader-card card">

            <div class="portrait">
              팀장 사진 등록 공간
            </div>

            <h3>
              ${E(D.leader.name)}
            </h3>

            <p>
              ${E(D.leader.role)} · 팀 이상
            </p>

          </div>

          <div class="leader-message">

            <h2>
              함께 만들어가는 이상
            </h2>

            ${D.leader.paragraphs
                        .map(p => `<p>${E(p)}</p>`)
                        .join('')}

            <p class="signature">
              팀 이상 팀장
              ${E(D.leader.name)}
              드림
            </p>

          </div>

        </div>`)
                +
                    section(`${head('우리가 지향하는 가치')}

        <div class="values-grid">

          ${D.values
                        .map((v, i) => `<article class="card content-card">

                    <span class="value-num">
                      ${String(i + 1).padStart(2, '0')}
                    </span>

                    <h3>
                      ${E(v.title)}
                    </h3>

                    <p>
                      ${E(v.text)}
                    </p>

                  </article>`)
                        .join('')}

        </div>`, 'section-gray')
                +
                    section(`${head('팀 이상 연혁', '함께 지나온 시간을 기록하는 공간입니다.')}

        <div class="history-table-wrap">
          <table class="history-table">
            <thead><tr><th scope="col">날짜</th><th scope="col">연혁</th><th scope="col">설명</th></tr></thead>
            <tbody>
              ${(Array.isArray(D.history) ? [...D.history] : [])
                .sort((a,b) => (a.order ?? 100) - (b.order ?? 100))
                .map(h => `<tr>
                  <td>${E(h.date || '')}</td>
                  <th scope="row">${E(h.title)}</th>
                  <td>${E(h.text || '')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`);
    }
    // --- 동아리활동 ---
    function clubs() {
        root.innerHTML =
            pageHero('동아리활동', '여섯 부서가 서로 다른 재능을 연결해 하나의 작품을 만듭니다.')
                +
                    section(`${head('여섯 부서의 이야기', '각 부서의 활동과 부장이 전하는 인삿말을 확인하세요.')}

        <div class="club-grid">

          ${D.clubs
                        .map((c, i) => `<article
                    class="club-card card"
                    id="${E(c.id)}"
                  >

                    <div class="club-banner">
                      <img
                        src="${E(c.banner)}"
                        alt=""
                        width="1600"
                        height="450"
                        loading="lazy"
                      >
                    </div>

                    <span class="club-no">
                      ${String(i + 1).padStart(2, '0')}
                    </span>

                    <h2>
                      ${E(c.name)}
                    </h2>

                    <p class="club-short">
                      ${E(c.short)}
                    </p>

                    <p class="club-desc">
                      ${E(c.description)}
                    </p>

                    <ul class="activity-list">
                      ${c.activities
                        .map(v => `<li>${E(v)}</li>`)
                        .join('')}
                    </ul>

                    <div class="club-greeting">

                      <strong>
                        ${E(c.head || '부장 인삿말')}
                      </strong>

                      <blockquote>
                        ${E(c.greeting ||
                        '부장님의 인삿말을 준비 중입니다. 실제 인삿말을 전달받은 뒤 등록하겠습니다.')}
                      </blockquote>

                    </div>

                  </article>`)
                        .join('')}

        </div>`);
    }
    // --- 학교생활 · 규칙집 ---
    // 한 조항을 출력합니다. 제재 기준이나 부서별 표가 없는 경우에는 해당 영역을 만들지 않습니다.
    function renderRuleItem(rule, index) {
        const details = (rule.details || []).length
            ? `<ul class="rule-details">
          ${rule.details.map(text => `<li>${E(text)}</li>`).join('')}
        </ul>`
            : '';
        const departments = (rule.departments || []).length
            ? `<div class="table-scroll rule-table-scroll">
          <table class="rule-table">
            <thead>
              <tr><th scope="col">부서</th><th scope="col">허용 범위</th></tr>
            </thead>
            <tbody>
              ${rule.departments.map(dept => `
                <tr>
                  <th scope="row">${E(dept.name)}</th>
                  <td>${E(dept.text)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`
            : '';
        return `<li class="rule-item">
      <span class="rule-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
      <div class="rule-body">
        <div class="rule-item-head">
          <h4>${E(rule.title)}</h4>
          ${rule.penalty ? `<span class="rule-penalty">${E(rule.penalty)}</span>` : ''}
        </div>
        <p>${E(rule.text)}</p>
        ${details}
        ${departments}
      </div>
    </li>`;
    }
    // 규칙 그룹과 이동 메뉴는 동일한 id를 사용합니다.
    function renderRuleSection(group, index) {
        return `<article class="card rule-section" id="${E(group.id)}" aria-labelledby="${E(group.id)}-title">
      <div class="rule-section-head">
        <h3 id="${E(group.id)}-title">${E(group.title)}</h3>
      </div>
      ${group.intro ? `<p class="rule-section-intro">${E(group.intro)}</p>` : ''}
      <ol class="rule-list">
        ${group.items.map(renderRuleItem).join('')}
      </ol>
      ${group.note ? `<p class="rule-section-note">${E(group.note)}</p>` : ''}
    </article>`;
    }
    function life() {
        const rules = D.rules;
        const policy = D.rulePolicy;
        root.innerHTML = pageHero('학교생활', '함께 활동하기 위한 약속과 팀 내 규정을 안내합니다.') + section(`
      ${head('함께하는 학교생활', '팀 이상 구성원이 함께 지키는 활동 규정입니다.')}

      <!-- 공통 제재 기준과 자료 출처 -->
      <aside class="rule-notice" aria-label="규정 적용 안내">
        <div>
          <h3>규정 적용 안내</h3>
          <p>${E(policy.notice)}</p>
          <p class="rule-source">${E(policy.source)}</p>
        </div>
      </aside>

      <!-- 클릭하면 해당 규정으로 이동합니다. -->
      <nav class="rule-nav" aria-label="규칙 빠른 이동">
        ${rules.map(group => a(`#${group.id}`, E(group.title))).join('')}
      </nav>

      <!-- 내용이 많은 세 그룹은 가로 전체를 사용합니다. -->
      <div class="rule-stack">
        ${rules.slice(0, 3).map(renderRuleSection).join('')}
      </div>

      <!-- 비교적 짧은 두 그룹은 넓은 화면에서 나란히 배치합니다. -->
      <div class="rule-compact-grid">
        ${rules.slice(3).map((group, index) => renderRuleSection(group, index + 3)).join('')}
      </div>

      <!-- 기존 이상위키 안내 카드는 유지합니다. -->
      <div class="wiki-callout">
        <h2>이상위키</h2>
        <p>${E(policy.wikiDescription || D.site.wikiDescription || '')}</p>
        ${ext(D.site.wikiUrl, '이상위키 바로가기 →', 'button button-light')}
      </div>
    `, 'life-section');
    }
    // --- 학사일정 데이터 ---
    const monthEvents = (year, month) => {
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        const end = `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
        return D.events.filter(e => e.date && e.date <= end &&
            (e.endDate && e.endDate >= e.date ? e.endDate : e.date) >= start)
            .sort((a, b) => a.date.localeCompare(b.date));
    };
    const eventEnd = e => e.endDate && e.endDate >= e.date ? e.endDate : e.date;
    const eventDate = e => eventEnd(e) !== e.date
        ? `${date(e.date)} ~ ${date(eventEnd(e))}` : date(e.date);
    let calendarCursor = null;
    let galleryFilter = '전체';
    // --- 학사일정 페이지 ---
    function calendar() {
        root.innerHTML =
            pageHero('학사일정', '월별 달력과 일정표로 팀의 활동을 확인하세요.')
                +
                    section(`${head('학사 일정', '날짜가 확정된 일정만 달력에 표시됩니다.')}

        <div class="calendar-shell">

          <!-- 달력 -->
          <div class="calendar-card card">

            <div class="cal-head">

              <h2 id="cal-month"></h2>

              <div class="cal-nav">

                <button
                  id="cal-prev"
                  type="button"
                  aria-label="이전 달"
                >
                  ←
                </button>

                <button
                  id="cal-today"
                  type="button"
                >
                  오늘
                </button>

                <button
                  id="cal-next"
                  type="button"
                  aria-label="다음 달"
                >
                  →
                </button>

              </div>

            </div>

            <div
              class="calendar-grid"
              id="calendar-grid"
            ></div>

          </div>


          <!-- 월간 일정 -->
          <aside class="schedule-table card">

            <h3>
              월간 일정
            </h3>

            <div id="schedule-month"></div>

          </aside>

        </div>


        <!-- 전체 일정 -->
        <div class="schedule-all card">

          <h3>
            전체 일정표
          </h3>

          <div class="table-scroll">

            <table>

              <thead>
                <tr>
                  <th>날짜</th>
                  <th>일정</th>
                  <th>내용</th>
                </tr>
              </thead>

              <tbody id="schedule-all"></tbody>

            </table>

          </div>

        </div>`);
        setupCalendar();
    }
    // --- 달력 동작 ---
    function setupCalendar() {
        let cursor = calendarCursor || todayDate();
        const grid = document.querySelector('#calendar-grid');
        // 달력 그리기
        const draw = () => {
            const y = cursor.getFullYear();
            const m = cursor.getMonth() + 1;
            const first = new Date(y, m - 1, 1).getDay();
            const days = new Date(y, m, 0).getDate();
            const events = monthEvents(y, m);
            // 연월 표시
            document
                .querySelector('#cal-month')
                .textContent =
                `${y}년 ${m}월`;
            calendarCursor = new Date(y, m - 1, 1);
            // 요일
            let html = [
                '일',
                '월',
                '화',
                '수',
                '목',
                '금',
                '토'
            ]
                .map(d => `<div class="weekday">
                ${d}
              </div>`)
                .join('');
            // 첫째 주 빈칸
            for (let i = 0; i < first; i++) {
                html +=
                    '<div class="day muted" aria-hidden="true"></div>';
            }
            // 날짜
            for (let d = 1; d <= days; d++) {
                const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const items = events.filter(e => e.date <= key && eventEnd(e) >= key);
                html +=
                    `<div class="day${key === today()
                        ? ' today'
                        : ''}">

            <span class="day-num">
              ${d}
            </span>

            ${items
                        .map(e => `<span
                      class="day-event"
                      title="${E(e.title)}"
                    >
                      ${E(e.title)}
                    </span>`)
                        .join('')}

          </div>`;
            }
            // 달력 표시
            grid.innerHTML = html;
            // 월간 일정
            document
                .querySelector('#schedule-month')
                .innerHTML =
                events.length
                    ? events
                        .map(e => `<div class="schedule-row">

                    <span class="schedule-date">
                      ${E(eventDate(e))}
                    </span>

                    <strong>
                      ${E(e.title)}
                    </strong>

                    <p>
                      ${E(e.description || '')}
                    </p>

                  </div>`)
                        .join('')
                    : '<p class="empty-state">이달에 등록된 일정이 없습니다.</p>';
            // 전체 일정
            document
                .querySelector('#schedule-all')
                .innerHTML =
                D.events.length
                    ? [...D.events]
                        .filter(e => e.date)
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map(e => `<tr>
                    <td>
                      ${E(eventDate(e))}
                    </td>

                    <td>
                      ${E(e.title)}
                    </td>

                    <td>
                      ${E(e.description || '')}
                    </td>
                  </tr>`)
                        .join('')
                    : '<tr><td colspan="3">확정된 일정이 등록되면 이곳에 표시됩니다.</td></tr>';
        };
        // 이전 달
        document
            .querySelector('#cal-prev')
            .onclick =
            () => {
                cursor =
                    new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
                draw();
            };
        // 다음 달
        document
            .querySelector('#cal-next')
            .onclick =
            () => {
                cursor =
                    new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
                draw();
            };
        // 오늘
        document
            .querySelector('#cal-today')
            .onclick =
            () => {
                cursor = todayDate();
                draw();
            };
        // 최초 표시
        draw();
    }
    // --- 공지 본문 블록 ---
    // 운영자는 fallback-content.js의 body에 아래 형식의 데이터를 추가할 수 있습니다.
    // 입력값은 HTML 이스케이프하고, 링크는 http/https만 허용합니다.
    // 본문 안의 [표시문구](주소)를 실제 링크로 변환합니다.
    // 허용된 내부 링크는 사이트 경로만, 외부 링크는 HTTP(S)만 사용합니다.
    function postInline(value) {
        const source = String(value ?? '');
        const re = /\[([^\]\n]+)\]\(([^\s)]+)\)|\*\*([^*\n]+)\*\*/g;
        let result = '', cursor = 0, match;
        while ((match = re.exec(source))) {
            result += E(source.slice(cursor, match.index));
            if (match[3] !== undefined) {
                result += `<strong>${E(match[3])}</strong>`;
            } else {
                const target = match[2];
                const isLocal = /^(?:index|about|calendar|life|clubs|gallery|post)\.html(?:[?#][^\s]*)?$/.test(target);
                const link = isLocal ? target : safeUrl(target);
                result += link ? a(link,E(match[1]),'post-inline-link',!isLocal) : E(match[0]);
            }
            cursor = re.lastIndex;
        }
        return result + E(source.slice(cursor)).replace(/\n/g,'<br>');
    }

    // 문자열 항목과 자식 목록이 있는 항목을 모두 지원합니다.
    function renderPostList(items, ordered = false) {
        const tag = ordered ? 'ol' : 'ul';
        return `<${tag}>${(items || []).map(item => {
            if (typeof item === 'string') return `<li>${postInline(item)}</li>`;
            if (!item || typeof item !== 'object') return '';
            return `<li>${postInline(item.text || '')}${item.children?.length
                ? renderPostList(item.children, Boolean(item.ordered)) : ''}</li>`;
        }).join('')}</${tag}>`;
    }

    function renderPostBlock(block) {
        switch (block.type) {
            case 'h2': return `<h2>${E(block.text)}</h2>`;
            case 'h3': return `<h3>${E(block.text)}</h3>`;
            case 'ul': return renderPostList(block.items);
            case 'ol': return renderPostList(block.items, true);
            case 'table': return `<div class="post-table-scroll"><table class="post-table">
                <thead><tr>${(block.headers || []).map(cell=>`<th scope="col">${E(cell)}</th>`).join('')}</tr></thead>
                <tbody>${(block.rows || []).map(row=>`<tr>${row.map(cell=>`<td>${postInline(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
            </table></div>`;
            case 'links': return `<div class="post-links">${(block.items || []).map(item=>{
                const target=String(item.url || '');
                const local=/^(?:index|about|calendar|life|clubs|gallery|post)\.html(?:[?#][^\s]*)?$/.test(target);
                const url=local?target:safeUrl(target);
                return url?a(url,`<strong>${E(item.label)} <span aria-hidden="true">↗</span></strong>${item.description?`<small>${E(item.description)}</small>`:''}`,'post-link',!local):'';
            }).join('')}</div>`;
            case 'callout': return `<div class="post-callout">${postInline(block.text)}</div>`;
            case 'p': default: return `<p>${postInline(block.text || '')}</p>`;
        }
    }

    // --- 공지글 상세 ---
    // 별도의 공지 목록은 없지만, 긴 글은 기존 post.html에서 읽을 수 있습니다.
    function post() {
        const id = new URLSearchParams(location.search).get('id');
        const p = D.posts.find(item => item.id === id &&
            (item.published || D.site.previewDrafts));

        if (!p) {
            document.title = '공지사항 | 이상고등학교';
            const robots = document.createElement('meta');
            robots.name = 'robots'; robots.content = 'noindex,follow'; document.head.append(robots);
            root.innerHTML = pageHero('공지사항', '요청한 글을 찾을 수 없습니다.') +
                section(`<div class="post">
                    ${note('글이 없거나 주소가 잘못되었습니다.')}
                    ${a(noticeHome, '← 홈 공지사항으로 돌아가기', 'button button-navy')}
                </div>`);
            return;
        }

        document.title = `${p.title} | 이상고등학교`;
        const description = p.excerpt || p.body?.find(b => b.type === 'p')?.text || p.title;
        const setMeta = (selector, value) => {
            const node = document.querySelector(selector);
            if (node) node.setAttribute('content', String(value));
        };
        setMeta('meta[name="description"]', description);
        setMeta('meta[property="og:title"]', document.title);
        setMeta('meta[property="og:description"]', description);
        const siteUrl = String(window.IDEAL_CMS_CONFIG?.siteUrl || '').trim();
        if (/^https:\/\/[^\s?#]+\/$/.test(siteUrl)) {
            const canonical = siteUrl + postUrl(p);
            let link = document.querySelector('link[rel="canonical"]');
            if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.append(link); }
            link.href = canonical;
            setMeta('meta[property="og:url"]', canonical);
        }
        const hasDate = /^\d{4}-\d{2}-\d{2}$/.test(p.date || '');
        const meta = hasDate ? `<time datetime="${E(p.date)}">${E(date(p.date))}</time>` : '';

        // 지난 모집 자료에는 현재 모집 상태나 지원서 제출 버튼을 붙이지 않습니다.
        const isCurrentRecruitment = p.category === '모집' && !p.archive;
        const current = {...p, start: D.admission?.start || '', end: D.admission?.end || '', formUrl: D.admission?.formUrl || ''};
        const s = isCurrentRecruitment ? recruitmentState(current) : null;

        root.innerHTML = pageHero('공지사항', '팀 이상의 소식을 전합니다.') +
            section(`<article class="post">
                <header class="post-head">
                    <span class="post-category">${E(p.category)}${p.published ? '' : ' · 편집 초안'}</span>
                    <h1>${E(p.title)}</h1>
                    ${meta}
                    ${p.meta ? `<span class="post-status-label">${E(p.meta)}</span>` : ''}
                </header>

                ${!p.published ? note('이 글은 편집 초안이며 실제 운영 공지가 아닙니다. 공개 전 운영자가 내용을 확인해야 합니다.') : ''}

                <div class="post-body">
                    ${(p.body || []).map(renderPostBlock).join('')}

                    ${isCurrentRecruitment ? `<div class="post-info">
                        <strong>모집 상태 · ${E(s.label)}</strong>
                        <p>모집 기간: ${E(period(current))}</p>
                        ${p.requirements?.length ? `<ul>${p.requirements.map(r => `<li>${E(r)}</li>`).join('')}</ul>` : ''}
                        ${s.open && safeUrl(current.formUrl)
                            ? ext(current.formUrl, '공식 지원서 작성 →', 'button button-navy')
                            : note('현재 접수 가능한 공식 지원서가 없습니다. 공개된 모집 일정과 링크를 확인해 주세요.')}
                    </div>` : ''}
                </div>

                ${p.source ? `<aside class="post-source"><strong>자료 및 확인 범위</strong><p>${E(p.source)}</p></aside>` : ''}
                ${a(noticeHome, '← 홈 공지사항으로 돌아가기', 'button button-soft')}
            </article>`);
    }

    // --- 이상광장 전체보기 ---
    function gallery() {
        root.innerHTML =
            pageHero('이상광장', '팀 이상이 함께 만든 작품을 한곳에서 만나보세요.')
                +
                    section(`${head('작품진열대', '영상, 일러스트, 음악 등 다양한 창작물을 모아두는 공간입니다.')}

        <div class="gallery-toolbar">

          <div
            class="notice-tools"
            id="work-filters"
          ></div>

          <span
            class="gallery-count"
            id="gallery-count"
          ></span>

        </div>

        <div
          class="gallery-page-grid"
          id="gallery-grid"
        ></div>

        ${note('40개 등록 공간을 준비했습니다. 실제 공개 작품을 fallback-content.js에 등록하면 순서대로 표시됩니다.')}`);
        // 작품 분류
        const cats = [
            '전체',
            ...new Set(works()
                .map(w => w.category || '기타'))
        ];
        const filters = document.querySelector('#work-filters');
        let active = cats.includes(galleryFilter) ? galleryFilter : '전체';
        // 갤러리 그리기
        const draw = () => {
            // 필터 버튼
            filters.innerHTML =
                cats
                    .map(c => `<button
                class="filter-button${c === active
                    ? ' active'
                    : ''}"
                data-filter="${E(c)}"
                type="button"
                aria-pressed="${c === active}"
              >
                ${E(c)}
              </button>`)
                    .join('');
            // 표시할 작품
            const data = active === '전체'
                ? slots()
                : works()
                    .filter(w => w.category === active);
            // 작품 수
            document
                .querySelector('#gallery-count')
                .textContent =
                `등록된 작품 ${works().length}개 / 준비된 공간 ${Math.max(40, works().length)}개`;
            // 작품 카드
            document
                .querySelector('#gallery-grid')
                .innerHTML =
                data.length
                    ? data
                        .map(workCard)
                        .join('')
                    : note('이 분류에 등록된 작품이 없습니다.');
        };
        // 필터 클릭
        filters.addEventListener('click', e => {
            const b = e.target.closest('[data-filter]');
            if (b) {
                active =
                    b.dataset.filter;
                galleryFilter = active;
                draw();
            }
        });
        // 최초 표시
        draw();
    }
    // --- 페이지 실행 ---
    // data-page 값과 함수 연결
    const pages = {
        home,
        about,
        calendar,
        life,
        clubs,
        post,
        gallery
    };
    // 현재 페이지 실행
    // 기본 콘텐츠를 먼저 표시하고, 시트가 연결되어 있으면 최신 공개 자료로 갱신합니다.
    // 실패하면 공개 기본값으로 사이트를 계속 사용할 수 있습니다.
    let rendered = false;
    function restoreHash() {
        if (!location.hash) return;
        requestAnimationFrame(() => {
            let id;
            try { id = decodeURIComponent(location.hash.slice(1)); }
            catch { return; }
            const target = document.getElementById(id);
            if (!target) return;
            if (page === 'home' && ['notices', 'plaza'].includes(id) && window.IDEAL_HOME_SCROLL) {
                window.IDEAL_HOME_SCROLL.moveTo(id, {updateHash: false});
            } else target.scrollIntoView();
        });
    }
    function render(mode = 'initial') {
        const updating = rendered;
        const scrollY = updating ? window.scrollY : 0;
        const focusId = updating ? document.activeElement?.id : '';
        if (updating) {
            window.IDEAL_HOME_SCROLL?.suspend(1000);
            disposePlaza();
        }
        renderFooter();
        (pages[page] || home)();
        rendered = true;
        root.removeAttribute('aria-busy');
        if (mode === 'live') {
            const status = document.getElementById('content-status');
            if (status) status.textContent = '최신 공개 콘텐츠가 반영되었습니다.';
        }
        document.dispatchEvent(new CustomEvent('ideal:page-ready', {detail: {page, mode}}));
        if (updating) requestAnimationFrame(() => {
            const rootStyle = document.documentElement.style;
            const previous = rootStyle.scrollBehavior;
            rootStyle.scrollBehavior = 'auto';
            window.scrollTo({top: scrollY, behavior: 'instant'});
            rootStyle.scrollBehavior = previous;
            if (focusId) document.getElementById(focusId)?.focus({preventScroll: true});
        });
        else restoreHash();
    }
    async function boot() {
        root.setAttribute('aria-busy','true');
        if (window.IDEAL_CMS) await window.IDEAL_CMS.load(render);
        else render();
    }
    boot().catch(error => {
        console.error('[이상고등학교] 화면 초기화 오류', error);
        root.removeAttribute('aria-busy');
        if (!rendered) render();
    });
})();
