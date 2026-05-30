-- ============================================================
--  Adarsha Sanothimi Higher Secondary School
--  MySQL Database Schema
--  Run this file once to set up the entire database
-- ============================================================

CREATE DATABASE IF NOT EXISTS adarsha_school
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE adarsha_school;

-- ─────────────────────────────────────────
--  1. ADMIN / USERS
-- ─────────────────────────────────────────
CREATE TABLE admin_users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(50)  NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,          -- bcrypt hashed
  role         ENUM('superadmin','admin','teacher') DEFAULT 'admin',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  2. STUDENTS
-- ─────────────────────────────────────────
CREATE TABLE students (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  symbol_no       VARCHAR(20)  UNIQUE,          -- NEB symbol number
  student_id      VARCHAR(20)  NOT NULL UNIQUE, -- internal ID
  full_name       VARCHAR(100) NOT NULL,
  full_name_np    VARCHAR(100),                 -- Nepali name
  dob             DATE,
  gender          ENUM('male','female','other'),
  grade           VARCHAR(10) NOT NULL,         -- e.g. '11', '12', '9'
  section         VARCHAR(5),                   -- e.g. 'A', 'B'
  stream          ENUM('science','management','humanities','general'),
  phone           VARCHAR(15),
  address         VARCHAR(200),
  parent_name     VARCHAR(100),
  parent_phone    VARCHAR(15),
  photo_url       VARCHAR(300),
  enrolled_date   DATE,
  status          ENUM('active','inactive','passed_out','transferred') DEFAULT 'active',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  3. TEACHERS
-- ─────────────────────────────────────────
CREATE TABLE teachers (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id   VARCHAR(20) NOT NULL UNIQUE,
  full_name    VARCHAR(100) NOT NULL,
  full_name_np VARCHAR(100),
  subject      VARCHAR(100),
  phone        VARCHAR(15),
  email        VARCHAR(100),
  photo_url    VARCHAR(300),
  bio          TEXT,
  qualification VARCHAR(200),
  joined_date  DATE,
  status       ENUM('active','inactive') DEFAULT 'active',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  4. NOTICES
-- ─────────────────────────────────────────
CREATE TABLE notices (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  title_np     VARCHAR(200),
  body         TEXT,
  body_np      TEXT,
  category     ENUM('general','exam','admission','event','result','holiday') DEFAULT 'general',
  is_pinned    BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at   TIMESTAMP NULL,
  created_by   INT,
  FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- ─────────────────────────────────────────
--  5. EXAM RESULTS
-- ─────────────────────────────────────────
CREATE TABLE exams (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  exam_name    VARCHAR(100) NOT NULL,   -- e.g. 'First Terminal 2081'
  exam_type    ENUM('terminal','pre-board','NEB','internal'),
  grade        VARCHAR(10),
  stream       VARCHAR(20),
  exam_date    DATE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE results (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  exam_id      INT NOT NULL,
  subject      VARCHAR(100) NOT NULL,
  full_marks   INT DEFAULT 100,
  pass_marks   INT DEFAULT 35,
  marks        DECIMAL(5,2),
  grade        VARCHAR(5),              -- A+, A, B+, B, C+, C, D, NG
  remarks      VARCHAR(100),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (exam_id)    REFERENCES exams(id),
  UNIQUE KEY unique_result (student_id, exam_id, subject)
);

-- ─────────────────────────────────────────
--  6. FEE STRUCTURE & PAYMENTS
-- ─────────────────────────────────────────
CREATE TABLE fee_structure (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  grade        VARCHAR(10) NOT NULL,
  stream       VARCHAR(20),
  fee_type     VARCHAR(100) NOT NULL,  -- 'Admission', 'Monthly', 'Exam', etc.
  amount       DECIMAL(10,2) NOT NULL,
  fiscal_year  VARCHAR(10),            -- e.g. '2081/82'
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fee_payments (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  fee_type     VARCHAR(100) NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  paid_date    DATE NOT NULL,
  receipt_no   VARCHAR(50) UNIQUE,
  payment_method ENUM('cash','online','cheque') DEFAULT 'cash',
  fiscal_year  VARCHAR(10),
  remarks      VARCHAR(200),
  recorded_by  INT,
  FOREIGN KEY (student_id)  REFERENCES students(id),
  FOREIGN KEY (recorded_by) REFERENCES admin_users(id)
);

-- ─────────────────────────────────────────
--  7. CALENDAR / EVENTS
-- ─────────────────────────────────────────
CREATE TABLE calendar_events (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  title_np     VARCHAR(200),
  event_date   DATE NOT NULL,
  end_date     DATE,
  event_type   ENUM('holiday','exam','event','admission','other') DEFAULT 'event',
  description  TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  8. GALLERY
-- ─────────────────────────────────────────
CREATE TABLE gallery (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200),
  image_url    VARCHAR(300) NOT NULL,
  category     VARCHAR(100),
  taken_date   DATE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  9. SITE SETTINGS (replaces localStorage)
-- ─────────────────────────────────────────
CREATE TABLE site_settings (
  setting_key  VARCHAR(100) PRIMARY KEY,
  setting_value LONGTEXT,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  10. ATTENDANCE (optional, future use)
-- ─────────────────────────────────────────
CREATE TABLE attendance (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NOT NULL,
  date         DATE NOT NULL,
  status       ENUM('present','absent','late','excused') DEFAULT 'present',
  noted_by     INT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (noted_by)   REFERENCES admin_users(id),
  UNIQUE KEY unique_attendance (student_id, date)
);

-- ─────────────────────────────────────────
--  SEED: Default admin user
--  Password: admin2081  (change immediately!)
-- ─────────────────────────────────────────
INSERT INTO admin_users (username, password, role)
VALUES ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin');
-- ^ This is bcrypt hash of "admin2081" — change after first login

-- ─────────────────────────────────────────
--  SEED: Default site settings
-- ─────────────────────────────────────────
INSERT INTO site_settings (setting_key, setting_value) VALUES
('school_name',    'Adarsha Sanothimi Higher Secondary School'),
('school_name_np', 'आदर्श सानोठिमी माध्यमिक विद्यालय'),
('established',    '2034 BS'),
('address',        'Sanothimi, Bhaktapur'),
('phone',          '01-XXXXXXX'),
('email',          'info@adarshasanothimi.edu.np'),
('ticker_en',      '📢 Admission Open for 2081 BS! | 📝 Grade 11 Entrance Form available at school office'),
('ticker_np',      '📢 २०८१ BS को भर्ना खुला! | 📝 कक्षा ११ को प्रवेश फारम विद्यालय कार्यालयमा उपलब्ध');
