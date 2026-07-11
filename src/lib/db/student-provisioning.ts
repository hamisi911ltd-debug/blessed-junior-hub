import { getDb } from "./get-cloudflare-env";
import { hashPassword } from "./password";
import { normalizePhone } from "./phone";

async function findAvailableUsername(db: D1Database, fullName: string, disambiguator: string): Promise<string> {
  const clean = fullName.trim();
  const exists = async (name: string) =>
    !!(await db.prepare("SELECT id FROM users WHERE username = ? COLLATE NOCASE").bind(name).first());
  if (!(await exists(clean))) return clean;
  const withSuffix = `${clean} (${disambiguator})`;
  if (!(await exists(withSuffix))) return withSuffix;
  return `${clean} (${disambiguator}-${crypto.randomUUID().slice(0, 4)})`;
}

/**
 * Gives a student their own portal login the moment they're enrolled — separate from
 * the guardian's account. Username is their full name (disambiguated by admission
 * number on collision, since names aren't unique); password is the guardian's phone
 * number. Linked via `students.profile_id`, which guardian provisioning never touches
 * (that one fans out through `parent_students` instead, since one guardian can cover
 * several siblings and `profile_id` is unique-per-student).
 */
export async function provisionStudentAccount(student: {
  id: string; admission_no: string; full_name: string; guardian_phone?: string | null; profile_id?: string | null;
}): Promise<void> {
  if (student.profile_id) return;
  if (!student.full_name || !student.guardian_phone) return;
  const password = normalizePhone(student.guardian_phone);
  if (!password) return;

  const db = getDb();
  const username = await findAvailableUsername(db, student.full_name, student.admission_no);
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  await db.batch([
    db.prepare("INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)").bind(userId, username, passwordHash),
    db.prepare("INSERT INTO profiles (id, full_name) VALUES (?, ?)").bind(userId, student.full_name),
    db.prepare("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, 'student')").bind(crypto.randomUUID(), userId),
  ]);
  await db.prepare("UPDATE students SET profile_id = ? WHERE id = ?").bind(userId, student.id).run();
}
