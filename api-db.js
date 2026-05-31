// ════════════════════════════════════════════════════════════
//  api-db.js  —  MySQL API Bridge for Adarsha Sanothimi School
// ════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const API = 'https://adarsha-school-production.up.railway.app';

  const _cache = {};
  let _ready = false;
  const _readyCbs = [];

  function _fireReady() {
    _ready = true;
    _readyCbs.forEach(fn => { try { fn(); } catch(e) {} });
    _readyCbs.length = 0;
  }

  const KEY_MAP = {
    'school_notices':    { get: '/api/notices',  put: '/api/notices/bulk'  },
    'school_gallery':    { get: '/api/gallery',  put: '/api/gallery/bulk'  },
    'school_teachers':   { get: '/api/teachers', put: '/api/teachers/bulk' },
    'school_results':    { get: '/api/results',  put: '/api/results/bulk'  },
    'school_fees':       { get: '/api/fees',     put: '/api/fees/bulk'     },
    'school_calendar':   { get: '/api/calendar', put: '/api/calendar/bulk' },
    'school_hero':       { get: '/api/settings/school_hero',       put: '/api/settings/school_hero'       },
    'school_stats':      { get: '/api/settings/school_stats',      put: '/api/settings/school_stats'      },
    'school_ticker_en':  { get: '/api/settings/school_ticker_en',  put: '/api/settings/school_ticker_en'  },
    'school_ticker_np':  { get: '/api/settings/school_ticker_np',  put: '/api/settings/school_ticker_np'  },
    'school_settings':   { get: '/api/settings/school_settings',   put: '/api/settings/school_settings'   },
    'admin_pin':         { get: '/api/settings/admin_pin',         put: '/api/settings/admin_pin'         },
  };

  // ── TRANSFORM: normalize API data to match what index.js expects ──

  function transformData(key, data) {
    if (!Array.isArray(data)) return data;

    if (key === 'school_teachers') {
      return data.map(t => ({
        name:    t.name    || t.full_name    || '',
        subject: t.subject || '',
        qual:    t.qual    || t.qualification || '',
        photo:   t.photo   || t.photo_url    || null,
      }));
    }

    if (key === 'school_notices') {
      return data.map(n => ({
        text: n.text  || n.title || '',
        date: n.date  || (n.published_at ? n.published_at.toString().slice(0,10) : ''),
        type: n.type  || (n.category === 'achievement' ? 'achievement' : 'official'),
      }));
    }

    if (key === 'school_gallery') {
      return data.map(g => ({
        caption:  g.caption  || g.title     || '',
        category: g.category || 'general',
        data:     g.data     || g.image_url || '',
      }));
    }

    if (key === 'school_calendar') {
      return data.map(e => ({
        date:   e.date       || e.event_date || '',
        event:  e.event      || e.title      || '',
        target: e.target     || e.target_audience || 'All',
        status: e.status     || '📅 Scheduled',
      }));
    }

    if (key === 'school_fees') {
      return data.map(f => ({
        level:   f.level   || f.grade    || '',
        adm:     f.adm     || f.amount   || '',
        monthly: f.monthly || '',
        exam:    f.exam    || '',
        remarks: f.remarks || '—',
      }));
    }

    if (key === 'school_results') {
      return data.map(r => ({
        id:     r.id     || r.symbol_number || '',
        name:   r.name   || r.full_name     || '',
        grade:  r.grade  || r.class         || '',
        gpa:    r.gpa    || r.marks         || '',
        div:    r.div    || r.division      || '',
        status: r.status || 'Pass',
      }));
    }

    return data;
  }

  async function apiFetch(url, options = {}) {
    const res = await fetch(API + url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
    return res.json();
  }

  async function apiGet(key) {
    const route = KEY_MAP[key];
    if (!route) return null;
    try {
      const data = await apiFetch(route.get);
      if (data && typeof data === 'object' && 'value' in data) {
        return data.value;
      }
      const transformed = transformData(key, data);
      return JSON.stringify(transformed);
    } catch (e) {
      console.warn('[api-db] GET failed for', key, e.message);
      return null;
    }
  }

  async function apiPut(key, jsonString) {
    const route = KEY_MAP[key];
    if (!route) return false;
    try {
      let parsed;
      try { parsed = JSON.parse(jsonString); } catch { parsed = jsonString; }
      let body;
      if (Array.isArray(parsed)) {
        body = { items: parsed };
      } else {
        body = { value: jsonString };
      }
      await apiFetch(route.put, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return true;
    } catch (e) {
      console.warn('[api-db] PUT failed for', key, e.message);
      return false;
    }
  }

  async function preloadAll() {
    const keys = Object.keys(KEY_MAP);
    await Promise.allSettled(
      keys.map(async key => {
        const val = await apiGet(key);
        if (val !== null) _cache[key] = val;
      })
    );
    _fireReady();
  }

  const _listeners = {};
  let _pollInterval = null;

  function startPolling() {
    if (_pollInterval) return;
    _pollInterval = setInterval(async () => {
      const keys = Object.keys(_listeners);
      if (!keys.length) return;
      for (const key of keys) {
        const newVal = await apiGet(key);
        if (newVal !== null && newVal !== _cache[key]) {
          _cache[key] = newVal;
          (_listeners[key] || []).forEach(cb => { try { cb(); } catch(e) {} });
        }
      }
    }, 30000);
  }

  async function verifyPin(pin) {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: pin }),
      });
      return !!(res && (res.success || res.token));
    } catch {
      const cached = _cache['admin_pin'];
      if (cached) {
        try { return JSON.parse(cached) === pin; } catch { return cached === pin; }
      }
      return pin === 'admin2081';
    }
  }

  async function setPin(newPin) {
    await apiPut('admin_pin', JSON.stringify(newPin));
    _cache['admin_pin'] = JSON.stringify(newPin);
  }

  window.DB = {
    _useFallback: false,

    getItem(key) {
      return key in _cache ? _cache[key] : null;
    },

    async setItem(key, jsonString) {
      _cache[key] = jsonString;
      await apiPut(key, jsonString);
    },

    async removeItem(key) {
      delete _cache[key];
      const route = KEY_MAP[key];
      if (!route) return;
      try {
        const isListKey = ['school_notices','school_gallery','school_teachers',
                           'school_results','school_fees','school_calendar'].includes(key);
        const body = isListKey ? { items: [] } : { value: '' };
        await apiFetch(route.put, { method: 'PUT', body: JSON.stringify(body) });
      } catch(e) {
        console.warn('[api-db] removeItem failed for', key, e.message);
      }
    },

    on(key, callback) {
      if (!_listeners[key]) _listeners[key] = [];
      _listeners[key].push(callback);
      startPolling();
    },

    onReady(callback) {
      if (_ready) { try { callback(); } catch(e) {} }
      else _readyCbs.push(callback);
    },
  };

  window.DB_PIN = {
    async verify(pin) { return verifyPin(pin); },
    async set(newPin) { return setPin(newPin); },
  };

  preloadAll();

})();
