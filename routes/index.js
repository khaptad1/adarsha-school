// routes/index.js — all API routes
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const auth    = require('../middleware/auth');

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    // Try bcrypt first, fallback to plain text
    let match = false;
    try { match = await bcrypt.compare(password, user.password); } catch {}
    if (!match) match = (password === user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ success: true, token, role: user.role, username: user.username });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth/change-password [protected]
router.post('/auth/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await db.query('SELECT * FROM admin_users WHERE id = ?', [req.user.id]);
    let match = false;
    try { match = await bcrypt.compare(currentPassword, rows[0].password); } catch {}
    if (!match) match = (currentPassword === rows[0].password);
    if (!match) return res.status(400).json({ error: 'Current password is wrong' });
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE admin_users SET password = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/settings
router.get('/settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/settings/:key
router.get('/settings/:key', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_value FROM site_settings WHERE setting_key = ? LIMIT 1', [req.params.key]);
    if (!rows.length) return res.json({ value: null });
    res.json({ value: rows[0].setting_value });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/settings/:key
router.put('/settings/:key', async (req, res) => {
  try {
    const { value } = req.body;
    await db.query(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=?',
      [req.params.key, value, value]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/notices
router.get('/notices', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notices WHERE (expires_at IS NULL OR expires_at > NOW()) ORDER BY is_pinned DESC, published_at DESC LIMIT 50'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/notices/bulk
router.put('/notices/bulk', async (req, res) => {
  const items = req.body.items || [];
  try {
    await db.query('DELETE FROM notices');
    for (const n of items) {
      await db.query('INSERT INTO notices (title, body, category) VALUES (?,?,?)',
        [n.text||n.title||'', n.body||'', n.type||n.category||'general']);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/notices [protected]
router.post('/notices', auth, async (req, res) => {
  try {
    const { title, title_np, body, body_np, category, is_pinned, expires_at } = req.body;
    const [result] = await db.query(
      'INSERT INTO notices (title, title_np, body, body_np, category, is_pinned, expires_at, created_by) VALUES (?,?,?,?,?,?,?,?)',
      [title, title_np, body, body_np, category||'general', is_pinned||0, expires_at||null, req.user.id]
    );
    res.json({ id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/notices/:id [protected]
router.delete('/notices/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/teachers
router.get('/teachers', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM teachers WHERE status='active' ORDER BY full_name");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/teachers/bulk
router.put('/teachers/bulk', async (req, res) => {
  const items = req.body.items || [];
  try {
    await db.query('DELETE FROM teachers');
    for (const t of items) {
      await db.query('INSERT INTO teachers (teacher_id, full_name, subject, qualification, photo_url) VALUES (?,?,?,?,?)',
        ['T'+Date.now()+Math.random(), t.name||t.full_name||'', t.subject||'', t.qual||t.qualification||'', t.photo||t.photo_url||null]);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/teachers [protected]
router.post('/teachers', auth, async (req, res) => {
  try {
    const t = req.body;
    const [result] = await db.query(
      'INSERT INTO teachers (teacher_id, full_name, full_name_np, subject, phone, email, photo_url, bio, qualification, joined_date) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [t.teacher_id, t.full_name, t.full_name_np, t.subject, t.phone, t.email, t.photo_url, t.bio, t.qualification, t.joined_date]
    );
    res.json({ id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/teachers/:id [protected]
router.put('/teachers/:id', auth, async (req, res) => {
  try {
    const t = req.body;
    await db.query(
      'UPDATE teachers SET full_name=?, subject=?, qualification=?, photo_url=?, status=? WHERE id=?',
      [t.full_name||t.name, t.subject, t.qualification||t.qual, t.photo_url||t.photo, t.status||'active', req.params.id]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/teachers/:id [protected]
router.delete('/teachers/:id', auth, async (req, res) => {
  try {
    await db.query("UPDATE teachers SET status='inactive' WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/gallery
router.get('/gallery', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/gallery/bulk
router.put('/gallery/bulk', async (req, res) => {
  const items = req.body.items || [];
  try {
    await db.query('DELETE FROM gallery');
    for (const g of items) {
      await db.query('INSERT INTO gallery (title, image_url, category) VALUES (?,?,?)',
        [g.caption||g.title||'', g.data||g.image_url||'', g.category||'general']);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/gallery [protected]
router.post('/gallery', auth, async (req, res) => {
  try {
    const g = req.body;
    const [result] = await db.query('INSERT INTO gallery (title, image_url, category, taken_date) VALUES (?,?,?,?)',
      [g.title, g.image_url, g.category, g.taken_date]);
    res.json({ id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/gallery/:id [protected]
router.delete('/gallery/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM gallery WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/calendar
router.get('/calendar', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM calendar_events ORDER BY event_date ASC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/calendar/bulk
router.put('/calendar/bulk', async (req, res) => {
  const items = req.body.items || [];
  try {
    await db.query('DELETE FROM calendar_events');
    for (const e of items) {
      await db.query('INSERT INTO calendar_events (title, event_date, event_type) VALUES (?,?,?)',
        [e.event||e.title||'', e.date||null, e.status||'event']);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/calendar [protected]
router.post('/calendar', auth, async (req, res) => {
  try {
    const e = req.body;
    const [result] = await db.query(
      'INSERT INTO calendar_events (title, title_np, event_date, end_date, event_type, description) VALUES (?,?,?,?,?,?)',
      [e.title, e.title_np, e.event_date, e.end_date, e.event_type||'event', e.description]
    );
    res.json({ id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/calendar/:id [protected]
router.delete('/calendar/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM calendar_events WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/results
router.get('/results', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM results ORDER BY id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/results/bulk
router.put('/results/bulk', async (req, res) => {
  const items = req.body.items || [];
  try {
    await db.query('DELETE FROM results');
    for (const r of items) {
      await db.query('INSERT INTO results (subject, marks, grade) VALUES (?,?,?)',
        [r.name||'', r.gpa||0, r.div||'']);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/fees
router.get('/fees', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students LIMIT 1');
    res.json([]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/fees/bulk
router.put('/fees/bulk', async (req, res) => {
  res.json({ success: true });
});

// GET /api/students [protected]
router.get('/students', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students ORDER BY full_name');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
