/*
 * 이상고등학교 · 공개 구글 시트 CMS 읽기 (schema 2)
 *
 * 조절 대상: 입학안내 / 공지사항 / 이상광장 / 사이트링크 / 학사일정 / 연혁
 * Apps Script 웹앱의 JSONP 응답을 읽으며, 연결 실패 시 fallback-content.js를 사용합니다.
 */
"use strict";
window.IDEAL_CMS = (() => {
  const CACHE_KEY = 'ideal-public-content-v6';
  const CLUBS_CACHE_KEY = 'ideal-clubs-content-v1';
  const RULES_CACHE_KEY = 'ideal-rules-content-v1';
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

  // Google Sheets 체크박스/문자열을 공통 boolean으로 정규화합니다.
  // 기존 Apps Script가 공개 값을 보내지 않는 경우에는 이전 호환성을 위해 true로 봅니다.
  const publishedValue = row => {
    const raw = row?.published ?? row?.public ?? row?.visibility ?? row?.['공개'];
    if (raw === undefined || raw === null || raw === '') return true;
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'number') return raw !== 0;
    const value = text(raw).trim().toLowerCase();
    if (['true','1','yes','y','on','공개','checked'].includes(value)) return true;
    if (['false','0','no','n','off','비공개','unchecked'].includes(value)) return false;
    return Boolean(raw);
  };

  // 공지 본문 셀에 Google Docs 공유 링크를 넣으면 문서를 사이트 안에 바로 표시합니다.
  // 일반 텍스트/Markdown 본문도 이전과 동일하게 계속 지원합니다.
  function googleDoc(value) {
    const raw = text(value).trim();
    if (!raw) return null;
    try {
      const u = new URL(raw);
      if (u.protocol !== 'https:' || u.hostname !== 'docs.google.com') return null;

      const normal = u.pathname.match(/^\/document\/d\/([A-Za-z0-9_-]+)/);
      if (normal) {
        const id = normal[1];
        return {
          url: `https://docs.google.com/document/d/${id}/edit`,
          embedUrl: `https://docs.google.com/document/d/${id}/preview`
        };
      }

      const published = u.pathname.match(/^\/document\/d\/e\/([A-Za-z0-9_-]+)\/pub/);
      if (published) {
        const id = published[1];
        return {
          url: `https://docs.google.com/document/d/e/${id}/pub`,
          embedUrl: `https://docs.google.com/document/d/e/${id}/pub?embedded=true`
        };
      }
    } catch {}
    return null;
  }

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
      const doc = typeof row.body === 'string' ? googleDoc(row.body) : null;
      return {
        id,
        number: num,
        title: text(row.title),
        category: text(row.category) || '공지',
        date: validDate(row.date),
        body: doc ? [] : (typeof row.body === 'string' ? markdownBlocks(row.body) : Array.isArray(row.body) ? row.body : []),
        documentUrl: doc?.url || '',
        documentEmbedUrl: doc?.embedUrl || '',
        published: publishedValue(row)
      };
    }).filter(row => row.published && row.title);

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

  function normalizeRules(payload) {
    if (!payload || payload.ok !== true || !Array.isArray(payload.rules)) {
      throw new Error('규칙 응답 형식이 올바르지 않습니다.');
    }

    const rulePolicy = {
      notice: text(payload.rulePolicy?.notice),
      source: text(payload.rulePolicy?.source),
      openChat: text(payload.rulePolicy?.openChat)
    };

    const rules = payload.rules.map((group, groupIndex) => {
      const rawId = text(group.id || `rule-group-${groupIndex + 1}`).trim();
      const id = rawId.replace(/[^A-Za-z0-9_-]/g, '-') || `rule-group-${groupIndex + 1}`;
      const items = (Array.isArray(group.items) ? group.items : []).map((rule, index) => ({
        id: text(rule.id || `${id}-${index + 1}`),
        title: text(rule.title).trim(),
        text: text(rule.text).trim(),
        penalty: text(rule.penalty).trim(),
        details: (Array.isArray(rule.details) ? rule.details : []).map(v => text(v).trim()).filter(Boolean),
        departments: (Array.isArray(rule.departments) ? rule.departments : []).map(dept => ({
          name: text(dept?.name).trim(),
          text: text(dept?.text).trim()
        })).filter(dept => dept.name && dept.text)
      })).filter(rule => rule.text);
      return {
        id,
        title: text(group.title).trim(),
        intro: text(group.intro).trim(),
        items
      };
    }).filter(group => group.title && group.items.length);

    if (!rules.length) throw new Error('이상위키에서 표시할 규칙을 찾지 못했습니다.');
    return {rulePolicy, rules};
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

  function applyRules(data) {
    const D = window.IDEAL_CONTENT;
    D.rulePolicy = {...D.rulePolicy, ...data.rulePolicy};
    D.rules = data.rules;
  }

  async function loadRules(config, notify) {
    const endpoint = text(config.rulesApiUrl).trim();
    if (!endpoint) return {mode: 'rules-setup-required'};
    if (!ALLOWED_URL.test(endpoint)) return {mode: 'rules-invalid-url'};

    const cacheKey = `${RULES_CACHE_KEY}:${endpoint}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && cached.payload) {
        applyRules(normalizeRules(cached.payload));
        notify('rules-cache');
      }
    } catch {}

    try {
      const raw = await request(endpoint, Math.max(1000, Number(config.requestTimeout) || 12000));
      applyRules(normalizeRules(raw));
      try { localStorage.setItem(cacheKey, JSON.stringify({savedAt: Date.now(), payload: raw})); } catch {}
      notify('rules-remote');
      return {mode: 'rules-remote'};
    } catch (error) {
      return {mode: 'rules-fallback', error};
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
    let mainResult;

    if (!endpoint || !ALLOWED_URL.test(endpoint)) {
      notify('initial');
      mainResult = {mode: endpoint ? 'invalid-url' : 'setup-required'};
    } else {
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
        apply(normalize(raw));
        try { localStorage.setItem(cacheKey, JSON.stringify({savedAt: Date.now(), payload: raw})); } catch {}
        notify('remote');
        mainResult = {mode: 'remote'};
      } catch (error) {
        notify('fallback');
        mainResult = {mode: 'fallback', error};
      }
    }

    const [clubsResult, rulesResult] = await Promise.all([
      loadClubs(config, notify),
      loadRules(config, notify)
    ]);
    return {...mainResult, clubs: clubsResult, rules: rulesResult};
  }

  return {load, normalize, normalizeClubs, normalizeRules, markdownBlocks, validDate};
})();
