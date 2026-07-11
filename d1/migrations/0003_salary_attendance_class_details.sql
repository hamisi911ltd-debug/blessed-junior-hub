-- Richer class settings, staff salary tracking (mirrors fee_structures/payments), daily attendance.

-- ============ CLASS DETAILS ============
ALTER TABLE classes ADD COLUMN capacity INTEGER;
ALTER TABLE classes ADD COLUMN stream TEXT;
ALTER TABLE classes ADD COLUMN room TEXT;
ALTER TABLE classes ADD COLUMN description TEXT;

-- ============ SALARY ============
CREATE TABLE salary_structures (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_salary_structures_staff ON salary_structures(staff_id);

CREATE TABLE salary_payments (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount REAL NOT NULL,
  method TEXT NOT NULL DEFAULT 'cash' CHECK (method IN ('cash','bank','mobile_money','card','online','other')),
  reference TEXT,
  paid_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  recorded_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_salary_payments_staff ON salary_payments(staff_id);

-- ============ ATTENDANCE ============
CREATE TABLE attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','excused')),
  recorded_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  term_id TEXT REFERENCES terms(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(student_id, date)
);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);
