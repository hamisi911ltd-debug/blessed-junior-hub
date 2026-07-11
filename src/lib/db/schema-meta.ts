export const TABLE_COLUMNS: Record<string, string[]> = {
  profiles: ["id", "full_name", "email", "phone", "avatar_url", "created_at", "updated_at"],
  user_roles: ["id", "user_id", "role", "created_at"],
  terms: ["id", "name", "year", "start_date", "end_date", "is_current", "created_at"],
  classes: ["id", "name", "level", "class_teacher_id", "capacity", "stream", "room", "description", "created_at", "updated_at"],
  subjects: ["id", "name", "code", "description", "created_at"],
  teachers: ["id", "profile_id", "staff_no", "id_no", "full_name", "email", "phone", "qualification", "date_hired", "created_at", "updated_at"],
  teacher_subjects: ["id", "teacher_id", "subject_id", "class_id"],
  students: [
    "id", "admission_no", "full_name", "gender", "date_of_birth", "class_id", "photo_url", "address",
    "guardian_name", "guardian_phone", "profile_id", "enrolled_at", "is_active", "created_at", "updated_at",
  ],
  parent_students: ["id", "parent_id", "student_id", "relationship", "created_at"],
  exams: ["id", "name", "term_id", "exam_date", "created_at"],
  results: ["id", "student_id", "exam_id", "subject_id", "score", "max_score", "grade", "remark", "recorded_by", "created_at", "updated_at"],
  fee_structures: ["id", "name", "class_id", "term_id", "amount", "description", "created_at"],
  payments: ["id", "student_id", "term_id", "amount", "method", "reference", "paid_at", "recorded_by", "notes", "created_at"],
  expenditures: ["id", "category", "description", "amount", "spent_on", "vendor", "recorded_by", "created_at", "updated_at"],
  announcements: ["id", "title", "body", "audience", "created_by", "created_at"],
  announcement_students: ["id", "announcement_id", "student_id"],
  school_settings: ["id", "name", "motto", "address", "phone", "email", "logo_url", "updated_at"],
  salary_structures: ["id", "staff_id", "name", "amount", "description", "created_at"],
  salary_payments: ["id", "staff_id", "month", "amount", "method", "reference", "paid_at", "recorded_by", "notes", "created_at"],
  attendance: ["id", "student_id", "class_id", "date", "status", "recorded_by", "term_id", "created_at"],
};

/** Columns stored as SQLite INTEGER 0/1 that should coerce to/from JSON booleans at the API boundary. */
export const BOOLEAN_COLUMNS: Record<string, string[]> = {
  terms: ["is_current"],
  students: ["is_active"],
};

/** Columns the generic API sets server-side and must never accept from the request body. */
export const SERVER_MANAGED_COLUMNS = ["id", "created_at", "updated_at"];

export function isKnownColumn(table: string, column: string): boolean {
  return TABLE_COLUMNS[table]?.includes(column) ?? false;
}
