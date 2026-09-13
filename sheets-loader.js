/*
 * 이상고등학교 · 공개 구글 시트 CMS 읽기 (schema 2)
 *
 * 조절 대상: 입학안내 / 공지사항 / 이상광장 / 사이트링크 / 학사일정 / 연혁
 * Apps Script 웹앱의 JSONP 응답을 읽으며, 연결 실패 시 fallback-content.js를 사용합니다.
 */
"use strict";
window.IDEAL_CMS = (() => {
  const CACHE_KEY = 'ideal-public-content-v5';
  const CLUBS_CACHE_KEY = 'ideal-clubs-content-v1';
  const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
  const ALLOWED_URL = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
  let sequence = 0;

  const text = value => String(value ?? '');
  const validDate = value => {
    const s = text(value).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s ? s : '';
  };
  const url = value => {
    const raw = text(value).trim();
    if (!raw) return '';
    try {
      const u = new URL(raw, document.baseURI);
      return ['http:', 'https:'].includes(u.protocol) ? u.href : '';
    } catch { return ''; }
  };
  const assetUrl = value => {
    const raw = text(value).trim();
    if (/^assets\/[A-Za-z0-9_./-]+$/.test(raw) && !raw.includes('..')) return raw;
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
  const number = (value, fallback = 100) => {
    const n = Number(value);
    return value !== '' && value != null && Number.isFinite(n) ? n : fallback;
  };

  // 공지 본문은 제한된 Markdown을 안전한 블록 데이터로 변환합니다.
  function markdownBlocks(source) {
    const lines = text(source).replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let i = 0;
    const isSpecial = line => /^\s*(?:#{2,3}\s|[-*]\s|\d+\.\s|>\s|\|)/.test(line);
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
      if (/^\s*\d+\.\s/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s/, ''));
        blocks.push({type: 'ol', items}); continue;
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
    return rows.map(mapper).filter(row => {
      if (!row || !row.id || ids.has(row.id)) return false;
      ids.add(row.id);
      return true;
    });
  }

  function normalize(payload) {
    if (!payload || payload.schema !== 2 || payload.ok !== true ||
        !payload.admission || !payload.site ||
        !Array.isArray(payload.posts) || !Array.isArray(payload.works) ||
        !Array.isArray(payload.events) || !Array.isArray(payload.history)) {
      throw new Error('공개 콘텐츠 응답 형식이 올바르지 않습니다.');
    }

    const admission = {
      title: text(payload.admission.title),
      start: validDate(payload.admission.start),
      end: validDate(payload.admission.end),
      resultDate: validDate(payload.admission.resultDate),
      openChatUrl: url(payload.admission.openChatUrl)
    };

    const site = {};
    ['wikiUrl', 'youtubeUrl', 'tiktokUrl', 'postypeUrl', 'instagramUrl', 'xUrl', 'marppleUrl']
      .forEach(k => site[k] = url(payload.site[k]));

    const posts = uniqueRows(payload.posts, (row, index) => {
      const num = text(row.number).trim();
      const id = text(row.id || num || `notice-${index + 1}`).trim();
      return {
        id,
        number: num,
        title: text(row.title),
        category: text(row.category) || '공지',
        date: validDate(row.date),
        body: typeof row.body === 'string' ? markdownBlocks(row.body) : Array.isArray(row.body) ? row.body : [],
        published: true
      };
    }).filter(row => row.title);

    const works = uniqueRows(payload.works, (row, index) => ({
      id: text(row.id || `work-${index + 1}`).trim(),
      title: text(row.title),
      category: text(row.category) || '정식컨',
      order: number(row.order, index + 1),
      image: assetUrl(row.image),
      url: url(row.url),
      description: text(row.description),
      alt: text(row.title),
      // Apps Script에서 비공개 행을 제외하지만, 프런트에서도 한 번 더 차단합니다.
      published: row.published !== false
    })).filter(row => row.published && row.title && row.image);

    const events = uniqueRows(payload.events, (row, index) => ({
      id: text(row.id || `event-${index + 1}`).trim(),
      date: validDate(row.date),
      title: text(row.title),
      published: true
    })).filter(row => row.date && row.title);

    const history = uniqueRows(payload.history, (row, index) => ({
      id: text(row.id || `history-${index + 1}`).trim(),
      date: validDate(row.date) || text(row.date),
      text: text(row.text),
      order: number(row.order, index + 1),
      published: true
    })).filter(row => row.date && row.text).sort((a,b) => a.order - b.order);

    return {admission, site, posts, works, events, history};
  }

  function normalizeClubs(payload) {
    if (!payload || payload.ok !== true || !Array.isArray(payload.clubs)) {
      throw new Error('동아리활동 응답 형식이 올바르지 않습니다.');
    }

    const clubs = payload.clubs.map((row, index) => {
      const activities = Array.isArray(row.activities)
        ? row.activities.map(v => text(v).trim()).filter(Boolean)
        : text(row.activities).replace(/\r\n?/g, '\n').split(/\n|\s*\|\s*/).map(v => v.trim()).filter(Boolean);
      return {
        id: text(row.id || `club-${index + 1}`).trim(),
        banner: assetUrl(row.banner),
        name: text(row.name).trim(),
        short: text(row.short).trim(),
        description: text(row.description).trim(),
        activities,
        head: '부장 인사말',
        greeting: text(row.greeting).trim(),
        greetingDraft: false
      };
    }).filter(row => row.name);

    if (!clubs.length) throw new Error('동아리활동 시트에 표시할 부서가 없습니다.');
    return clubs;
  }

  function apply(data) {
    const D = window.IDEAL_CONTENT;
    D.admission = {...D.admission, ...data.admission};
    D.site = {...D.site, ...data.site, previewDrafts: false};
    D.posts = data.posts;
    D.works = data.works;
    D.events = data.events;
    D.history = data.history;
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

  function applyClubs(clubs) {
    window.IDEAL_CONTENT.clubs = clubs;
  }

  async function loadClubs(config, notify) {
    const endpoint = text(config.clubsApiUrl).trim();
    if (!endpoint) return {mode: 'clubs-setup-required'};
    if (!ALLOWED_URL.test(endpoint)) return {mode: 'clubs-invalid-url'};

    const cacheKey = `${CLUBS_CACHE_KEY}:${endpoint}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && Date.now() - cached.savedAt < CACHE_MAX_AGE) {
        applyClubs(normalizeClubs(cached.payload));
        notify('clubs-cache');
      }
    } catch {}

    try {
      const raw = await request(endpoint, Math.max(1000, Number(config.requestTimeout) || 12000));
      applyClubs(normalizeClubs(raw));
      try { localStorage.setItem(cacheKey, JSON.stringify({savedAt: Date.now(), payload: raw})); } catch {}
      notify('clubs-remote');
      return {mode: 'clubs-remote'};
    } catch (error) {
      return {mode: 'clubs-fallback', error};
    }
  }

  async function load(onUpdate) {
    const notify = mode => { if (typeof onUpdate === 'function') onUpdate(mode); };
    const D = window.IDEAL_CONTENT;
    const baseline = normalize({
      schema: 2, ok: true,
      admission: D.admission || {}, site: D.site || {},
      posts: D.posts || [], works: D.works || [], events: D.events || [], history: D.history || []
    });
    apply(baseline);

    const config = window.IDEAL_CMS_CONFIG || {};
    const endpoint = text(config.apiUrl).trim();
    if (!endpoint || !ALLOWED_URL.test(endpoint)) {
      notify('initial');
      const clubsResult = await loadClubs(config, notify);
      return {mode: endpoint ? 'invalid-url' : 'setup-required', clubs: clubsResult};
    }

    const cacheKey = `${CACHE_KEY}:${endpoint}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && Date.now() - cached.savedAt < CACHE_MAX_AGE) {
        apply(normalize(cached.payload));
        notify('cache');
      }
    } catch {}

    try {
      const raw = await request(endpoint, Math.max(1000, Number(config.requestTimeout) || 12000));
      const data = normalize(raw);
      apply(data);
      try { localStorage.setItem(cacheKey, JSON.stringify({savedAt: Date.now(), payload: raw})); } catch {}
      notify('remote');
      const clubsResult = await loadClubs(config, notify);
      return {mode: 'remote', clubs: clubsResult};
    } catch (error) {
      notify('fallback');
      const clubsResult = await loadClubs(config, notify);
      return {mode: 'fallback', error, clubs: clubsResult};
    }
  }

  return {load, normalize, normalizeClubs, markdownBlocks, validDate};
})();
