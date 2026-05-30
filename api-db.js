// ════════════════════════════════════════════════════════════
//  api-db.js  —  MySQL API Bridge for Adarsha Sanothimi School
//  Replaces firebase-db.js  ·  Same window.DB interface
//  API Server: http://localhost:3001
// ════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const API = 'https://adarsha-school-production.up.railway.app';

  // ── IN-MEMORY CACHE ──────────────────────────────────────
  // Keeps data available synchronously (for getItem calls)
  // and mirrors what was last fetched from the server.
  const _cache = {};

  // ── READY SYSTEM ─────────────────────────────────────────
  // Fires callbacks once initial data is loaded from MySQL.
  let _ready = false;
  const _readyCbs = [];

  function _fireReady() {
    _ready = true;
    _readyCbs.forEach(fn => { try { fn(); } catch(e) {} });
    _readyCbs.length = 0;
  }

  // ── KEY → API ENDPOINT MAP ────────────────────────────────
  // Maps localStorage-style keys to REST API routes.
  const KEY_MAP = {
    'school_notices':    { get: '/api/notices',  put: '/api/notices/bulk'  },
    'school_gallery':    { get: '/api/gallery',  put: '/api/gallery/bulk'  },
    'school_teachers':   { get: '/api/teachers', put: '/api/teachers/bulk' },
    'school_results':    { get: '/api/results',  put: '/api/results/bulk'  },
    'school_fees':       { get: '/api/fees',     put: '/api/fees/bulk'     },
    'school_calendar':   { get: '/api/calendar', put: '/api/calendar/bulk' },
    // Settings stored as key-value in site_settings table
    'school_hero':       { get: '/api/settings/school_hero',       put: '/api/settings/school_hero'       },
    'school_stats':      { get: '/api/settings/school_stats',      put: '/api/settings/school_stats'      },
    'school_ticker_en':  { get: '/api/settings/school_ticker_en',  put: '/api/settings/school_ticker_en'  },
    'school_ticker_np':  { get: '/api/settings/school_ticker_np',  put: '/api/settings/school_ticker_np'  },
    'school_settings':   { get: '/api/settings/school_settings',   put: '/api/settings/school_settings'   },
    'admin_pin':         { get: '/api/settings/admin_pin',         put: '/api/settings/admin_pin'         },
  };

  // ── FETCH HELPERS ─────────────────────────────────────────

  async function apiFetch(url, options = {}) {
    const res = await fetch(API + url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
    return res.json();
  }

  // GET — returns parsed JSON value or null
  async function apiGet(key) {
    const route = KEY_MAP[key];
    if (!route) return null;
    try {
      const data = await apiFetch(route.get);
      // Settings endpoint returns { value: "..." } (JSON string)
      // List endpoints return arrays directly
      if (data && typeof data === 'object' && 'value' in data) {
        return data.value; // already a JSON string
      }
      return JSON.stringify(data);
    } catch (e) {
      console.warn('[api-db] GET failed for', key, e.message);
      return null;
    }
  }

  // PUT — sends JSON string value, returns true on success
  async function apiPut(key, jsonString) {
    const route = KEY_MAP[key];
    if (!route) return false;
    try {
      let parsed;
      try { parsed = JSON.parse(jsonString); } catch { parsed = jsonString; }

      // List endpoints expect { items: [...] }
      // Settings endpoints expect { value: "..." }
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

  // ── PRELOAD ALL DATA ──────────────────────────────────────
  // Fetch everything on startup so getItem() works synchronously.

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

  // ── LIVE LISTENERS ────────────────────────────────────────
  // Polling-based "live" updates (replaces Firestore real-time).
  // Polls every 30 seconds and calls registered callbacks on change.

  const _listeners = {}; // key → [callback, ...]
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
    }, 30000); // 30 second poll
  }

  // ── ADMIN LOGIN via API ───────────────────────────────────

  async function verifyPin(pin) {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: pin }),
      });
      return !!(res && res.success);
    } catch {
      // Fallback: compare against cached pin
      const cached = _cache['admin_pin'];
      if (cached) {
        try { return JSON.parse(cached) === pin; } catch { return cached === pin; }
      }
      return pin === '2081'; // last-resort default
    }
  }

  async function setPin(newPin) {
    await apiPut('admin_pin', JSON.stringify(newPin));
    _cache['admin_pin'] = JSON.stringify(newPin);
  }

  // ── window.DB INTERFACE ───────────────────────────────────
  // Matches the API that admin.html and index.js expect.

  window.DB = {
    _useFallback: false,

    // Synchronous read from cache (same as localStorage.getItem)
    getItem(key) {
      return key in _cache ? _cache[key] : null;
    },

    // Async write — updates cache + persists to MySQL
    async setItem(key, jsonString) {
      _cache[key] = jsonString;
      await apiPut(key, jsonString);
    },

    // Async delete — removes from cache + clears on server
    async removeItem(key) {
      delete _cache[key];
      const route = KEY_MAP[key];
      if (!route) return;
      try {
        // Send empty array for lists, empty string for settings
        const isListKey = ['school_notices','school_gallery','school_teachers',
                           'school_results','school_fees','school_calendar'].includes(key);
        const body = isListKey ? { items: [] } : { value: '' };
        await apiFetch(route.put, { method: 'PUT', body: JSON.stringify(body) });
      } catch(e) {
        console.warn('[api-db] removeItem failed for', key, e.message);
      }
    },

    // Register a callback to fire when key changes (live updates)
    on(key, callback) {
      if (!_listeners[key]) _listeners[key] = [];
      _listeners[key].push(callback);
      startPolling();
    },

    // Register a callback to fire once DB is ready
    onReady(callback) {
      if (_ready) { try { callback(); } catch(e) {} }
      else _readyCbs.push(callback);
    },
  };

  // ── window.DB_PIN INTERFACE ───────────────────────────────
  // Used by admin.html for PIN verify/set.

  window.DB_PIN = {
    async verify(pin) {
      return verifyPin(pin);
    },
    async set(newPin) {
      return setPin(newPin);
    },
  };

  // ── DISABLE QR (Firebase-only feature) ───────────────────
  // window.DB_QR is not set — admin.html already guards with
  // `if (!window.DB_QR)` checks so QR login is gracefully hidden.

  // ── BOOT ─────────────────────────────────────────────────
  preloadAll();

})();
