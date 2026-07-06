-- QA checklist migration: guardian phone login, drop invoices/curriculum,
-- payments record date+term directly, staff ID numbers, school settings,
-- targeted SMS recipients.

-- ============ USERS: allow phone-only accounts (guardian/student login) ============
PRAGMA foreign_keys=OFF;

CREATE TABLE users_new (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE COLLATE NOCASE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
INSERT INTO users_new (id, email, phone, password_hash, created_at)
  SELECT id, email, NULL, password_hash, created_at FROM users;
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

PRAGMA foreign_keys=ON;

-- profiles.phone already exists; nothing to change there.

-- ============ TEACHERS: national ID number ============
ALTER TABLE teachers ADD COLUMN id_no TEXT;

-- ============ REMOVE INVOICES; PAYMENTS RECORD DATE + TERM DIRECTLY ============
DROP TRIGGER IF EXISTS trg_payments_recalc_ins;
DROP TRIGGER IF EXISTS trg_payments_recalc_upd;
DROP TRIGGER IF EXISTS trg_payments_recalc_del;
DROP TABLE IF EXISTS invoices;

ALTER TABLE payments DROP COLUMN invoice_id;
ALTER TABLE payments ADD COLUMN term_id TEXT REFERENCES terms(id) ON DELETE SET NULL;

-- ============ REMOVE CURRICULUM ============
DROP TRIGGER IF EXISTS trg_curriculum_items_updated_at;
DROP TABLE IF EXISTS curriculum_items;

-- ============ SCHOOL SETTINGS (singleton) ============
CREATE TABLE school_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL DEFAULT 'Blessed Junior School',
  motto TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TRIGGER trg_school_settings_updated_at AFTER UPDATE ON school_settings
WHEN NEW.updated_at = OLD.updated_at
BEGIN UPDATE school_settings SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = NEW.id; END;

INSERT INTO school_settings (id) VALUES ('default');

-- ============ TARGETED SMS RECIPIENTS ============
CREATE TABLE announcement_students (
  id TEXT PRIMARY KEY,
  announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(announcement_id, student_id)
);
CREATE INDEX idx_announcement_students_announcement ON announcement_students(announcement_id);
