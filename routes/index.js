// routes/index.js — all API routes
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const auth    = require('../middleware/auth');

// ══════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query(
      'SELECT * FROM admin_users WHERE username = ?', [username]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, role: user.role, username: user.username });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/change-password  [protected]
router.post('/auth/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await db.query('SELECT * FROM admin_users WHERE id = ?', [req.user.id]);
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(400).json({ error: 'Current password is wrong' });

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE admin_users SET password = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════
//  SITE SETTINGS  (public read, admin write)
// ══════════════════════════════════════════

// GET /api/settings
router.get('/settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/settings  [protected]
router.put('/settings', auth, async (req, res) => {
  try {
    const entries = Object.entries(req.body);
    for (const [key, value] of entries) {
      await db.query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=?',
        [key, value, value]
      );
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════
//  NOTICES  (public read, admin write)
// ══════════════════════════════════════════

// GET /api/notices
router.get('/notices', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM notices
       WHERE (expires_at IS NULL OR expires_at > NOW())
       ORDER BY is_pinned DESC, published_at DESC
       LIMIT 50`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/notices  [protected]
router.post('/notices', auth, async (req, res) => {
  try {
    const { title, title_np, body, body_np, category, is_pinned, expires_at } = req.body;
    const [result] = await db.query(
      `INSERT INTO notices (title, title_np, body, body_np, category, is_pinned, expires_at, created_by)
       VALUES (?,?,?,?,?,?,?,?)`,
      [title, title_np, body, body_np, category||'general', is_pinned||0, expires_at||null, req.user.id]
    );
    res.json({ id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/notices/:id  [protected]
router.delete('/notices/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════
//  STUDENTS
// ══════════════════════════════════════════

// GET /api/students  [protected]
router.get('/students', auth, async (req, res) => {
  try {
    const { grade, stream, status, search } = req.query;
    let sql = 'SELECT * FROM students WHERE 1=1';
    const params = [];
    if (grade)  { sql += ' AND grade = ?';  params.push(grade); }
    if (stream) { sql += ' AND stream = ?'; params.push(stream); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (search) {
      sql += ' AND (full_name LIKE ? OR student_id LIKE ? OR symbol_no LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY full_name';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/students/:id  [protected]
router.get('/students/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/students  [protected]
router.post('/students', auth, async (req, res) => {
  try {
    const s = req.body;
    const [result] = await db.query(
      `INSERT INTO students
       (symbol_no, student_id, full_name, full_name_np, dob, gender, grade, section, stream,
        phone, address, parent_name, parent_phone, photo_url, enrolled_date, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [s.symbol_no, s.student_id, s.full_name, s.full_name_np, s.dob, s.gender,
       s.grade, s.section, s.stream, s.phone, s.address, s.parent_name,
       s.parent_phone, s.photo_url, s.enrolled_date, s.status||'active']
    );
    res.json({ id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/students/:id  [protected]
router.put('/students/:id', auth, async (req, res) => {
  try {
    const s = req.body;
    await db.query(
      `UPDATE students SET
       symbol_no=?, full_name=?, full_name_np=?, dob=?, gender=?, grade=?, section=?,
       stream=?, phone=?, address=?, parent_name=?, parent_phone=?, photo_url=?,
       enrolled_date=?, status=? WHERE id=?`,
      [s.symbol_no, s.full_name, s.full_name_np, s.dob, s.gender, s.grade, s.section,
       s.stream, s.phone, s.address, s.parent_name, s.parent_phone, s.photo_url,
       s.enrolled_date, s.status, req.params.id]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/students/:id  [protected]
router.delete('/students/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════
//  RESULTS  (public search by symbol no)
// ══════════════════════════════════════════

// GET /api/results/search?symbol=XXXXX  (public — for result portal)
router.get('/results/search', async (req, res) => {
  try {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Symbol number required' });
    const [student] = await db.query(
      'SELECT id, full_name, grade, stream, symbol_no FROM students WHERE symbol_no = ? OR student_id = ?',
      [symbol, symbol]
    );
    if (!student.length) return res.status(404).json({ error: 'Student not found' });

    const [results] = await db.query(
      `SELECT r.*, e.exam_name, e.exam_type, e.exam_date
       FROM results r
       JOIN exams e ON r.exam_id = e.id
       WHERE r.student_id = ?
       ORDER BY e.exam_date DESC, r.subject`,
      [student[0].id]
    );
    res.json({ student: student[0], results });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/results  [protected] — bulk insert results
router.post('/results', auth, async (req, res) => {
  try {
    const { exam_id, entries } = req.body; // entries: [{student_id, subject, marks, full_marks, pass_marks}]
    let inserted = 0;
    for (const e of entries) {
      // Calculate grade automatically
      const pct = (e.marks / (e.full_marks || 100)) * 100;
      let grade = 'NG';
      if (pct >= 90) grade = 'A+';
      else if (pct >= 80) grade = 'A';
      else if (pct >= 70) grade = 'B+';
      else if (pct >= 60) grade = 'B';
      else if (pct >= 50) grade = 'C+';
      else if (pct >= 40) grade = 'C';
      else if (pct >= 35) grade = 'D';

      await db.query(
        `INSERT INTO results (student_id, exam_id, subject, full_marks, pass_marks, marks, grade)
         VALUES (?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE marks=?, grade=?`,
        [e.student_id, exam_id, e.subject, e.full_marks||100, e.pass_marks||35, e.marks, grade, e.marks, grade]
      );
      inserted++;
    }
    res.json({ inserted });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════
//  TEACHERS  (public read, admin write)
// ══════════════════════════════════════════

// GET /api/teachers
router.get('/teachers', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM teachers WHERE status='active' ORDER BY full_name"
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/teachers  [protected]
router.post('/teachers', auth, async (req, res) => {
  try {
    const t = req.body;
    const [result] = await db.query(
      `INSERT INTO teachers (teacher_id, full_name, full_name_np, subject, phone, email, photo_url, bio, qualification, joined_date)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [t.teacher_id, t.full_name, t.full_name_np, t.subject, t.phone, t.email, t.photo_url, t.bio, t.qualification, t.joined_date]
    );
    res.json({ id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/teachers/:id  [protected]
router.put('/teachers/:id', auth, async (req, res) => {
  try {
    const t = req.body;
    await db.query(
      `UPDATE teachers SET full_name=?, full_name_np=?, subject=?, phone=?, email=?,
       photo_url=?, bio=?, qualification=?, joined_date=?, status=? WHERE id=?`,
      [t.full_name, t.full_name_np, t.subject, t.phone, t.email,
       t.photo_url, t.bio, t.qualification, t.joined_date, t.status||'active', req.params.id]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/teachers/:id  [protected]
router.delete('/teachers/:id', auth, async (req, res) => {
  try {
    await db.query("UPDATE teachers SET status='inactive' WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════
//  FEES
// ══════════════════════════════════════════

// GET /api/fees/structure  [protected]
router.get('/fees/structure', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM fee_structure ORDER BY grade, fee_type');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/fees/payments?student_id=X  [protected]
router.get('/fees/payments', auth, async (req, res) => {
  try {
    const { student_id, fiscal_year } = req.query;
    let sql = `SELECT fp.*, s.full_name, s.grade FROM fee_payments fp
               JOIN students s ON fp.student_id = s.id WHERE 1=1`;
    const params = [];
    if (student_id)  { sql += ' AND fp.student_id = ?'; params.push(student_id); }
    if (fiscal_year) { sql += ' AND fp.fiscal_year = ?'; params.push(fiscal_year); }
    sql += ' ORDER BY fp.paid_date DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/fees/payments  [protected]
router.post('/fees/payments', auth, async (req, res) => {
  try {
    const p = req.body;
    const receipt_no = 'RCP-' + Date.now();
    const [result] = await db.query(
      `INSERT INTO fee_payments (student_id, fee_type, amount, paid_date, receipt_no, payment_method, fiscal_year, remarks, recorded_by)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [p.student_id, p.fee_type, p.amount, p.paid_date, receipt_no,
       p.payment_method||'cash', p.fiscal_year, p.remarks, req.user.id]
    );
    res.json({ id: result.insertId, receipt_no });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════
//  CALENDAR  (public read, admin write)
// ══════════════════════════════════════════

// GET /api/calendar
router.get('/calendar', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM calendar_events ORDER BY event_date ASC'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/calendar  [protected]
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

// DELETE /api/calendar/:id  [protected]
router.delete('/calendar/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM calendar_events WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════
//  GALLERY  (public read, admin write)
// ══════════════════════════════════════════

// GET /api/gallery
router.get('/gallery', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/gallery  [protected]
router.post('/gallery', auth, async (req, res) => {
  try {
    const g = req.body;
    const [result] = await db.query(
      'INSERT INTO gallery (title, image_url, category, taken_date) VALUES (?,?,?,?)',
      [g.title, g.image_url, g.category, g.taken_date]
    );
    res.json({ id: result.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/gallery/:id  [protected]
router.delete('/gallery/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM gallery WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
