# 🏫 Adarsha Sanothimi School — MySQL Database Setup Guide

## What you have
```
school-db/
├── sql/
│   └── schema.sql       ← Run this in MySQL to create everything
├── api/
│   ├── server.js        ← Main server (start this)
│   ├── db.js            ← Database connection
│   ├── .env.example     ← Copy to .env and fill in your details
│   ├── package.json     ← Dependencies
│   ├── middleware/
│   │   └── auth.js      ← JWT login protection
│   └── routes/
│       └── index.js     ← All API endpoints
└── SETUP.md             ← This file
```

---

## STEP 1 — Install MySQL on your computer

**Windows:**
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run installer → choose "Developer Default"
3. Set a root password (remember it!)

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu):**
```bash
sudo apt install mysql-server
sudo mysql_secure_installation
```

---

## STEP 2 — Create the database

Open MySQL and run the schema file:

```bash
# In terminal / command prompt:
mysql -u root -p < sql/schema.sql

# OR open MySQL Workbench, open schema.sql, and click Run
```

This creates:
- All 10 tables
- Default admin user (username: `admin`, password: `admin2081`)
- Default site settings

---

## STEP 3 — Set up the Node.js API

```bash
# Go into the api folder
cd api

# Install dependencies
npm install

# Copy the environment file
cp .env.example .env

# Edit .env with your MySQL password and a secret key
# (Open .env in Notepad/VSCode and change the values)
```

Edit `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=adarsha_school
JWT_SECRET=make_up_a_long_random_string_here_at_least_32_characters
PORT=3001
FRONTEND_URL=http://localhost:3000
```

---

## STEP 4 — Start the API server

```bash
# From inside the api/ folder:
npm start

# For development (auto-restart on changes):
npm run dev
```

You should see:
```
✅ MySQL connected successfully
🏫 School API running at http://localhost:3001
```

---

## STEP 5 — Update your website to use the API

In your `index.js` and `admin.html`, replace `window.DB` calls with API calls.

**Example — Load notices:**
```javascript
// Old (localStorage):
const notices = JSON.parse(localStorage.getItem('school_notices') || '[]');

// New (MySQL API):
const res = await fetch('http://localhost:3001/api/notices');
const notices = await res.json();
```

**Example — Admin login:**
```javascript
const res = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin2081' })
});
const { token } = await res.json();
localStorage.setItem('token', token); // save JWT token
```

**Example — Save a notice (admin):**
```javascript
const token = localStorage.getItem('token');
await fetch('http://localhost:3001/api/notices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ title: 'Test Notice', body: 'Content here', category: 'general' })
});
```

---

## API Endpoints Reference

### Public (no login needed)
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/notices | All active notices |
| GET | /api/teachers | All active teachers |
| GET | /api/calendar | All calendar events |
| GET | /api/gallery | All gallery images |
| GET | /api/settings | Site settings |
| GET | /api/results/search?symbol=XXXXX | Student result lookup |

### Admin (requires JWT token in header)
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/login | Login → get token |
| POST | /api/auth/change-password | Change admin password |
| PUT | /api/settings | Update site settings |
| POST/DELETE | /api/notices | Add / delete notices |
| GET/POST/PUT/DELETE | /api/students | Full student management |
| POST/PUT/DELETE | /api/teachers | Manage teachers |
| POST/DELETE | /api/calendar | Manage events |
| POST/DELETE | /api/gallery | Manage gallery |
| GET/POST | /api/fees/payments | Fee records |
| GET/POST | /api/results | Exam results |

---

## Deploy to the internet (free hosting)

**Option A — Railway.app (recommended for Nepal)**
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Add MySQL service → Railway gives you DB credentials
5. Add your `.env` variables in Railway dashboard
6. Done! You get a public URL

**Option B — Render.com**
1. Go to https://render.com
2. New Web Service → connect your GitHub repo
3. Add a PostgreSQL or use PlanetScale for MySQL
4. Set environment variables

---

## ⚠️ Security Checklist Before Going Live
- [ ] Change admin password from `admin2081`
- [ ] Set a strong `JWT_SECRET` (32+ random characters)
- [ ] Never commit `.env` to GitHub (add to `.gitignore`)
- [ ] Set `FRONTEND_URL` to your actual website domain
- [ ] Enable HTTPS on your hosting platform
