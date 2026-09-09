/*
 * 이상고등학교 · 공개 구글 시트 읽기
 *
 * 1. 사이트 설정에 API 주소가 있으면 공개 JSON을 가져옵니다.
 * 2. 성공한 응답만 검사한 뒤 콘텐츠 객체에 적용합니다.
 * 3. 연결 실패 시 마지막 정상 응답, 없으면 fallback-content.js 기본값을 사용합니다.
 * 4. 공개가 아닌 행은 서버와 브라우저 양쪽에서 제외합니다.
 *
 * Google Apps Script Content Service의 JSONP 방식을 사용합니다.
 * 공개 전용 데이터만 전송하며, 웹페이지에서 시트 수정 권한은 갖지 않습니다.
 */
"use strict";
window.IDEAL_CMS = (() => {
  const CACHE_KEY = 'ideal-public-content-v3';
  const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
  const ALLOWED_URL = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
  let sequence = 0;

  const text = value => String(value ?? '');
  const validDate = value => {
    const s = text(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s ? s : '';
  };
  const assetUrl = value => {
    const raw = text(value).trim();
    if (/^assets\/[A-Za-z0-9_./-]+$/.test(raw) && !raw.includes('..')) return raw;
    // 공개 Google Drive 파일 공유 링크를 이미지 썸네일 주소로 변환합니다.
    // 실제 파일의 열람 권한은 소유자가 별도로 설정해야 합니다.
    try {
      const u = new URL(raw);
      if (u.hostname === 'drive.google.com') {
        const id = u.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/|$)/)?.[1] ||
          (u.pathname === '/open' ? u.searchParams.get('id') : '');
        if (id && /^[A-Za-z0-9_-]+$/.test(id))
          return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
      }
    } catch {}
    return url(raw);
  };
  const bool = value => value === true || text(value).toLowerCase() === 'true';
  const number = (value, fallback = 100) => {
    const n = Number(value);
    return value !== '' && value != null && Number.isFinite(n) ? n : fallback;
  };
  const url = value => {
    try {
      const u = new URL(text(value), document.baseURI);
      return ['http:', 'https:'].includes(u.protocol) ? u.href : '';
    } catch { return ''; }
  };

  // 시트의 본문은 제한된 Markdown만 지원합니다. HTML은 직접 실행하지 않습니다.
  function markdownBlocks(source) {
    const lines = text(source).replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let i = 0;
    const isSpecial = line => /^\s*(?:#{2,3}\s|[-*]\s|>\s|\|)/.test(line);
    const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(v => v.trim());
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      if (/^#{2,3}\s/.test(line)) {
        blocks.push({type: line.startsWith('###') ? 'h3' : 'h2', text: line.replace(/^#{2,3}\s*/, '')});
        i++; continue;
      }
      if (/^>\s?/.test(line)) {
        const content = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) content.push(lines[i++].replace(/^>\s?/, ''));
        blocks.push({type: 'callout', text: content.join('\n')}); continue;
      }
      if (/^\s*[-*]\s/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s/, ''));
        blocks.push({type: 'ul', items}); continue;
      }
      if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
        const headers = cells(line), rows = [];
        i += 2;
        while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(cells(lines[i++]));
        blocks.push({type: 'table', headers, rows}); continue;
      }
      const paragraph = [];
      while (i < lines.length && lines[i].trim() && (paragraph.length === 0 || !isSpecial(lines[i]))) paragraph.push(lines[i++]);
      blocks.push({type: 'p', text: paragraph.join('\n')});
    }
    return blocks;
  }

  function uniqueRows(rows, mapper) {
    const ids = new Set();
    return rows.filter(row => row && (row.published === undefined || bool(row.published))).map(mapper).filter(row => {
      if (!row.id || ids.has(row.id)) return false;
      ids.add(row.id);
      return true;
    });
  }

  // 응답의 필드만 명시적으로 복사합니다. 임의의 설정이나 함수는 덮어쓰지 않습니다.
  function normalize(payload) {
    if (!payload || payload.schema !== 1 || payload.ok !== true ||
        !payload.hero || !payload.admission || !payload.site ||
        !Array.isArray(payload.posts) || !Array.isArray(payload.works) || !Array.isArray(payload.events)) {
      throw new Error('공개 콘텐츠 응답 형식이 올바르지 않습니다.');
    }
    const hero = Object.fromEntries(['kicker', 'line1', 'line2', 'intro'].map(k => [k, text(payload.hero[k])]));
    const admission = Object.fromEntries(['title', 'description', 'status'].map(k => [k, text(payload.admission[k])]));
    ['start', 'end', 'resultDate'].forEach(k => admission[k] = validDate(payload.admission[k]));
    ['openChatUrl', 'guidelinesUrl', 'formUrl'].forEach(k => admission[k] = url(payload.admission[k]));
    const site = {};
    ['wikiUrl', 'youtubeUrl', 'tiktokUrl', 'postypeUrl', 'instagramUrl', 'xUrl', 'marppleUrl'].forEach(k => site[k] = url(payload.site[k]));
    site.wikiDescription = text(payload.site.wikiDescription);
    const posts = uniqueRows(payload.posts, row => ({
      id: text(row.id).trim(), title: text(row.title), category: text(row.category) || '공지',
      date: validDate(row.date), excerpt: text(row.excerpt),
      body: typeof row.body === 'string' ? markdownBlocks(row.body) : Array.isArray(row.body) ? row.body : [],
      order: number(row.order), meta: text(row.meta), archive: bool(row.archive),
      featured: bool(row.featured), start: validDate(row.start), end: validDate(row.end),
      resultDate: validDate(row.resultDate), formUrl: url(row.formUrl), source: text(row.source), published: true
    })).filter(row => row.title);
    const works = uniqueRows(payload.works, row => ({
      id: text(row.id).trim(), title: text(row.title), category: text(row.category) || '작품',
      order: number(row.order), image: assetUrl(row.image), url: url(row.url),
      description: text(row.description), alt: text(row.alt), published: true
    })).filter(row => row.title && row.image);
    const events = uniqueRows(payload.events, row => ({
      id: text(row.id).trim(), date: validDate(row.date), title: text(row.title),
      description: text(row.description), endDate: validDate(row.endDate), published: true
    })).filter(row => row.date && row.title);
    // 이전 버전의 API에는 history가 없으므로 기존 기본 연혁을 보존합니다.
    const history = Array.isArray(payload.history) ? uniqueRows(payload.history, row => ({
      id: text(row.id).trim(), date: text(row.date), title: text(row.title),
      text: text(row.text), order: number(row.order), published: true
    })).filter(row => row.title).sort((a,b) => a.order - b.order) : null;
    return {hero, admission, site, posts, works, events, history};
  }

  function apply(data) {
    const D = window.IDEAL_CONTENT;
    D.hero = data.hero;
    D.admission = {...D.admission, ...data.admission};
    D.site = {...D.site, ...data.site, intro: data.hero.intro, previewDrafts: false};
    D.rulePolicy.wikiDescription = data.site.wikiDescription || D.rulePolicy.wikiDescription;
    // 이번 공지사항은 사이트에서 직접 관리합니다. 다른 시트 콘텐츠는 그대로 연결합니다.
    if (window.IDEAL_CMS_CONFIG?.noticesSource === 'sheets') {
      D.posts = data.posts;
    }
    D.works = data.works;
    D.events = data.events;
    if (data.history !== null) D.history = data.history;
  }

  function request(urlValue, timeoutMs) {
    return new Promise((resolve, reject) => {
      const callback = `IDEAL_CMS_CALLBACK_${Date.now()}_${++sequence}`;
      const script = document.createElement('script');
      const endpoint = new URL(urlValue);
      endpoint.searchParams.set('callback', callback);
      endpoint.searchParams.set('_', String(Date.now()));
      let finished = false;
      let timer;
      const finish = (error, result) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        script.remove();
        delete window[callback];
        error ? reject(error) : resolve(result);
      };
      window[callback] = result => finish(null, result);
      script.onerror = () => finish(new Error('시트 연결에 실패했습니다.'));
      timer = setTimeout(() => finish(new Error('시트 응답 시간이 초과되었습니다.')), timeoutMs);
      script.src = endpoint.href;
      script.async = true;
      document.head.append(script);
    });
  }

  async function load(onUpdate) {
    const notify = (mode) => { if (typeof onUpdate === 'function') onUpdate(mode); };
    const D = window.IDEAL_CONTENT;
    const baseline = normalize({schema: 1, ok: true, hero: D.hero,
      admission: D.admission, site: D.site,
      posts: D.posts, works: D.works, events: D.events, history: D.history});
    apply(baseline);
    const config = window.IDEAL_CMS_CONFIG || {};
    const endpoint = text(config.apiUrl).trim();
    if (!endpoint || !ALLOWED_URL.test(endpoint)) {
      notify('initial');
      return {mode: endpoint ? 'invalid-url' : 'setup-required'};
    }
    // Cache entries are scoped to the exact API endpoint and expire after 24 hours.
    // This prevents content from an old sheet deployment being reused accidentally.
    const cacheKey = `${CACHE_KEY}:${endpoint}`;
    let initial = baseline;
    let initialMode = 'fallback';
    try {
      const saved = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
      if (saved && Number.isFinite(saved.savedAt) &&
          Date.now() - saved.savedAt >= 0 && Date.now() - saved.savedAt < CACHE_MAX_AGE) {
        initial = normalize(saved.data);
        apply(initial);
        initialMode = 'cached';
      }
    } catch {}
    notify('initial');
    try {
      const data = normalize(await request(endpoint, Math.max(1000, Number(config.requestTimeout) || 12000)));
      try { sessionStorage.setItem(cacheKey, JSON.stringify({savedAt: Date.now(), data})); } catch {}
      if (JSON.stringify(data) !== JSON.stringify(initial)) {
        apply(data);
        notify('live');
      }
      return {mode: 'live'};
    } catch (error) {
      console.warn('[이상고등학교] 최신 콘텐츠를 가져오지 못했습니다.', error);
      return {mode: initialMode};
    }
  }
  return {load, normalize, markdownBlocks, validDate};
})();
