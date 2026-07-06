-- ============ USERS & SESSIONS ============
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

CREATE TABLE profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TRIGGER trg_profiles_updated_at AFTER UPDATE ON profiles
WHEN NEW.updated_at = OLD.updated_at
BEGIN UPDATE profiles SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id; END;

CREATE TABLE user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','bursar','teacher','parent','student')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (user_id, role)
);

-- ============ ACADEMIC TERMS ============
CREATE TABLE terms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  start_date TEXT,
  end_date TEXT,
  is_current INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- ============ CLASSES ============
CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  level TEXT,
  class_teacher_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TRIGGER trg_classes_updated_at AFTER UPDATE ON classes
WHEN NEW.updated_at = OLD.updated_at
BEGIN UPDATE classes SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id; END;

-- ============ SUBJECTS ============
CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- ============ TEACHERS ============
CREATE TABLE teachers (
  id TEXT PRIMARY KEY,
  profile_id TEXT UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
  staff_no TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  qualification TEXT,
  date_hired TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TRIGGER trg_teachers_updated_at AFTER UPDATE ON teachers
WHEN NEW.updated_at = OLD.updated_at
BEGIN UPDATE teachers SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id; END;

CREATE TABLE teacher_subjects (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE(teacher_id, subject_id, class_id)
);

-- ============ STUDENTS ============
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  admission_no TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male','female','other')),
  date_of_birth TEXT,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  photo_url TEXT,
  address TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  profile_id TEXT UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
  enrolled_at TEXT DEFAULT (date('now')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TRIGGER trg_students_updated_at AFTER UPDATE ON students
WHEN NEW.updated_at = OLD.updated_at
BEGIN UPDATE students SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id; END;

-- ============ PARENT-STUDENT LINK ============
CREATE TABLE parent_students (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(parent_id, student_id)
);

-- ============ CURRICULUM ============
CREATE TABLE curriculum_items (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  term_id TEXT REFERENCES terms(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  description TEXT,
  week_no INTEGER,
  created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TRIGGER trg_curriculum_items_updated_at AFTER UPDATE ON curriculum_items
WHEN NEW.updated_at = OLD.updated_at
BEGIN UPDATE curriculum_items SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id; END;

-- ============ EXAMS & RESULTS ============
CREATE TABLE exams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  term_id TEXT REFERENCES terms(id) ON DELETE SET NULL,
  exam_date TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE results (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  score REAL NOT NULL,
  max_score REAL NOT NULL DEFAULT 100,
  grade TEXT,
  remark TEXT,
  recorded_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(student_id, exam_id, subject_id)
);
CREATE TRIGGER trg_results_updated_at AFTER UPDATE ON results
WHEN NEW.updated_at = OLD.updated_at
BEGIN UPDATE results SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id; END;

-- ============ FEES ============
CREATE TABLE fee_structures (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  term_id TEXT REFERENCES terms(id) ON DELETE SET NULL,
  amount REAL NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id TEXT REFERENCES fee_structures(id) ON DELETE SET NULL,
  term_id TEXT REFERENCES terms(id) ON DELETE SET NULL,
  amount REAL NOT NULL,
  amount_paid REAL NOT NULL DEFAULT 0,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','partial','paid','overdue','cancelled')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TRIGGER trg_invoices_updated_at AFTER UPDATE ON invoices
WHEN NEW.updated_at = OLD.updated_at
BEGIN UPDATE invoices SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id; END;

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE SET NULL,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  method TEXT NOT NULL DEFAULT 'cash' CHECK (method IN ('cash','bank','mobile_money','card','online','other')),
  reference TEXT,
  paid_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  recorded_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Postgres used one combined AFTER INSERT OR UPDATE OR DELETE trigger; SQLite needs 3 separate ones.
CREATE TRIGGER trg_payments_recalc_ins AFTER INSERT ON payments WHEN NEW.invoice_id IS NOT NULL
BEGIN
  UPDATE invoices SET
    amount_paid = (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = NEW.invoice_id),
    status = CASE
      WHEN (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = NEW.invoice_id) >= (SELECT amount FROM invoices WHERE id = NEW.invoice_id) THEN 'paid'
      WHEN (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = NEW.invoice_id) > 0 THEN 'partial'
      ELSE 'unpaid' END
  WHERE id = NEW.invoice_id;
END;

CREATE TRIGGER trg_payments_recalc_upd AFTER UPDATE ON payments
BEGIN
  UPDATE invoices SET
    amount_paid = (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)),
    status = CASE
      WHEN (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)) >= (SELECT amount FROM invoices WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id)) THEN 'paid'
      WHEN (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)) > 0 THEN 'partial'
      ELSE 'unpaid' END
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id) AND COALESCE(NEW.invoice_id, OLD.invoice_id) IS NOT NULL;
END;

CREATE TRIGGER trg_payments_recalc_del AFTER DELETE ON payments WHEN OLD.invoice_id IS NOT NULL
BEGIN
  UPDATE invoices SET
    amount_paid = (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = OLD.invoice_id),
    status = CASE
      WHEN (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = OLD.invoice_id) >= (SELECT amount FROM invoices WHERE id = OLD.invoice_id) THEN 'paid'
      WHEN (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = OLD.invoice_id) > 0 THEN 'partial'
      ELSE 'unpaid' END
  WHERE id = OLD.invoice_id;
END;

-- ============ EXPENDITURES ============
CREATE TABLE expenditures (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  spent_on TEXT NOT NULL DEFAULT (date('now')),
  vendor TEXT,
  recorded_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TRIGGER trg_expenditures_updated_at AFTER UPDATE ON expenditures
WHEN NEW.updated_at = OLD.updated_at
BEGIN UPDATE expenditures SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id; END;

-- ============ ANNOUNCEMENTS ============
CREATE TABLE announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all',
  created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
