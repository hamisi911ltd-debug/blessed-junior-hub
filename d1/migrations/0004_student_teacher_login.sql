-- Adds a `username` login identifier so students (full name) and teachers (staff ID
-- number) can sign in without an email/phone of their own, alongside the existing
-- email/phone identifiers. Relaxes the users CHECK constraint accordingly.

PRAGMA foreign_keys=OFF;

CREATE TABLE users_new (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE COLLATE NOCASE,
  phone TEXT UNIQUE,
  username TEXT UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (email IS NOT NULL OR phone IS NOT NULL OR username IS NOT NULL)
);
INSERT INTO users_new (id, email, phone, password_hash, created_at)
  SELECT id, email, phone, password_hash, created_at FROM users;
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

PRAGMA foreign_keys=ON;

-- Prevents two teacher records from sharing an ID number (blank/NULL id_no is fine
-- and stays unenforced; only actual duplicate values are rejected).
CREATE UNIQUE INDEX idx_teachers_id_no ON teachers(id_no) WHERE id_no IS NOT NULL AND id_no != '';
