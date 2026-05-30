// ════════════════════════════════════════════════════════════
//  routes/school.js  —  All school data API routes
//  Add this to your server.js:  app.use('/api', require('./routes/school'))
// ════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const db      = require('../db'); // your existing db.js

// ── HELPER: run a query and return rows ──────────────────────
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// ════════════════════════════════════════════════════════════
//  AUTH  POST /api/auth/login
// ════════════════════════════════════════════════════════════
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const rows = await query(
      'SELECT * FROM admin_users WHERE username = ? LIMIT 1', [username]
    );
    if (!rows.length) return res.json({ success: false });

    const user = rows[0];
    // Plain-text compare (upgrade to bcrypt when ready)
    const ok = user.password === password || user.password_hash === password;
    res.json({ success: ok, user: ok ? { username: user.username } : null });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ════════════════════════════════════════════════════════════
//  SETTINGS  GET/PUT /api/settings/:key
//  Stores JSON blobs in the site_settings table
// ════════════════════════════════════════════════════════════
router.get('/settings/:key', async (req, res) => {
  try {
    const rows = await query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ? LIMIT 1',
      [req.params.key]
    );
    if (!rows.length) return res.json({ value: null });
    res.json({ value: rows[0].setting_value });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/settings/:key', async (req, res) => {
  try {
    const { value } = req.body;
    await query(
      `INSERT INTO site_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [req.params.key, value]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════════
//  NOTICES  GET /api/notices  |  PUT /api/notices/bulk
// ════════════════════════════════════════════════════════════
router.get('/notices', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM notices ORDER BY id DESC');
    res.json(rows.map(r => ({
      text: r.text || r.title || r.content,
      date: r.date || r.created_at,
      type: r.type || r.category || 'official',
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/notices/bulk', async (req, res) => {
  const items = req.body.items || [];
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM notices');
    for (const n of items) {
      await conn.query(
        'INSERT INTO notices (text, date, type) VALUES (?, ?, ?)',
        [n.text || '', n.date || '', n.type || 'official']
      );
    }
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// ════════════════════════════════════════════════════════════
//  GALLERY  GET /api/gallery  |  PUT /api/gallery/bulk
// ════════════════════════════════════════════════════════════
router.get('/gallery', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM gallery ORDER BY id DESC');
    res.json(rows.map(r => ({
      caption:  r.caption || r.title,
      category: r.category || 'general',
      data:     r.data || r.image_url || r.image_data,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/gallery/bulk', async (req, res) => {
  const items = req.body.items || [];
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM gallery');
    for (const p of items) {
      await conn.query(
        'INSERT INTO gallery (caption, category, data) VALUES (?, ?, ?)',
        [p.caption || '', p.category || 'general', p.data || '']
      );
    }
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// ════════════════════════════════════════════════════════════
//  TEACHERS  GET /api/teachers  |  PUT /api/teachers/bulk
// ════════════════════════════════════════════════════════════
router.get('/teachers', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM teachers ORDER BY id ASC');
    res.json(rows.map(r => ({
      name:    r.name,
      subject: r.subject,
      qual:    r.qual || r.qualification,
      photo:   r.photo || r.photo_url || null,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/teachers/bulk', async (req, res) => {
  const items = req.body.items || [];
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM teachers');
    for (const t of items) {
      await conn.query(
        'INSERT INTO teachers (name, subject, qual, photo) VALUES (?, ?, ?, ?)',
        [t.name || '', t.subject || '', t.qual || '', t.photo || null]
      );
    }
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// ════════════════════════════════════════════════════════════
//  RESULTS  GET /api/results  |  PUT /api/results/bulk
// ════════════════════════════════════════════════════════════
router.get('/results', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM results ORDER BY id DESC');
    res.json(rows.map(r => ({
      id:     r.id || r.symbol_number || r.student_id,
      name:   r.name || r.student_name,
      grade:  r.grade || r.class,
      gpa:    r.gpa,
      div:    r.div || r.division,
      status: r.status,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/results/bulk', async (req, res) => {
  const items = req.body.items || [];
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM results');
    for (const r of items) {
      await conn.query(
        'INSERT INTO results (id, name, grade, gpa, div, status) VALUES (?, ?, ?, ?, ?, ?)',
        [r.id || '', r.name || '', r.grade || '', r.gpa || '', r.div || '', r.status || 'Pass']
      );
    }
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// ════════════════════════════════════════════════════════════
//  FEES  GET /api/fees  |  PUT /api/fees/bulk
// ════════════════════════════════════════════════════════════
router.get('/fees', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM fees ORDER BY id ASC');
    res.json(rows.map(r => ({
      level:   r.level || r.class_level,
      adm:     r.adm || r.admission_fee,
      monthly: r.monthly || r.monthly_fee,
      exam:    r.exam || r.exam_fee,
      remarks: r.remarks || '—',
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/fees/bulk', async (req, res) => {
  const items = req.body.items || [];
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM fees');
    for (const f of items) {
      await conn.query(
        'INSERT INTO fees (level, adm, monthly, exam, remarks) VALUES (?, ?, ?, ?, ?)',
        [f.level || '', f.adm || '', f.monthly || '', f.exam || '', f.remarks || '—']
      );
    }
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// ════════════════════════════════════════════════════════════
//  CALENDAR  GET /api/calendar  |  PUT /api/calendar/bulk
// ════════════════════════════════════════════════════════════
router.get('/calendar', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM calendar ORDER BY id ASC');
    res.json(rows.map(r => ({
      date:   r.date || r.event_date,
      event:  r.event || r.event_name || r.title,
      target: r.target || r.target_audience || 'All',
      status: r.status || '📅 Scheduled',
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/calendar/bulk', async (req, res) => {
  const items = req.body.items || [];
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM calendar');
    for (const e of items) {
      await conn.query(
        'INSERT INTO calendar (date, event, target, status) VALUES (?, ?, ?, ?)',
        [e.date || '', e.event || '', e.target || '', e.status || '📅 Scheduled']
      );
    }
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// ── POOL CONNECTION HELPER ────────────────────────────────
// Only needed if db.js exports a pool. If db.js uses callbacks,
// the DELETE+INSERT approach uses the query() helper instead.
// Replace getConnection() calls above with pool.getConnection()
// if your db.js exports a pool, or restructure to sequential queries.
function getConnection() {
  return new Promise((resolve, reject) => {
    if (db.getConnection) {
      db.getConnection((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    } else {
      // db.js is a simple connection object — wrap it in a fake pool
      resolve({
        beginTransaction: () => query('START TRANSACTION'),
        query: (sql, params) => query(sql, params),
        commit:   () => query('COMMIT'),
        rollback: () => query('ROLLBACK'),
        release:  () => {},
      });
    }
  });
}

module.exports = router;
