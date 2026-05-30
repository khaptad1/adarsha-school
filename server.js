// server.js — Adarsha Sanothimi School API
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const routes  = require('./routes/index');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// ── Routes ──
app.use('/api', routes);

// ── Health check ──
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    school: 'Adarsha Sanothimi Higher Secondary School',
    version: '1.0.0'
  });
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n🏫 School API running at http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/`);
  console.log(`📚 API:    http://localhost:${PORT}/api/\n`);
});
