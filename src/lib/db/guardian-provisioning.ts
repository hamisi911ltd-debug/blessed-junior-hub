import { getDb } from "./get-cloudflare-env";
import { hashPassword } from "./password";
import { normalizePhone } from "./phone";

/**
 * A student's guardian logs into the portal directly with the guardian's phone
 * number and the student's admission number as password — there is no separate
 * parent signup flow. This runs after a student row is created/updated so that
 * account access "just exists" the moment enrollment is saved.
 *
 * The account is linked via `parent_students` (not `students.profile_id`) because
 * one guardian phone commonly covers several siblings, and `profile_id` is unique
 * per user — `parent_students` is the only relation that supports that fan-out.
 */
export async function provisionGuardianAccount(student: { id: string; admission_no: string; full_name: string; guardian_name?: string | null; guardian_phone?: string | null }): Promise<void> {
  if (!student.guardian_phone) return;
  const phone = normalizePhone(student.guardian_phone);
  if (!phone) return;

  const db = getDb();
  const existing = await db.prepare("SELECT id FROM users WHERE phone = ?").bind(phone).first<{ id: string }>();

  let userId = existing?.id;
  if (!userId) {
    userId = crypto.randomUUID();
    const passwordHash = await hashPassword(student.admission_no);
    await db.batch([
      db.prepare("INSERT INTO users (id, phone, password_hash) VALUES (?, ?, ?)").bind(userId, phone, passwordHash),
      db.prepare("INSERT INTO profiles (id, full_name, phone) VALUES (?, ?, ?)").bind(userId, student.guardian_name || student.full_name, phone),
      db.prepare("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, 'parent')").bind(crypto.randomUUID(), userId),
    ]);
  }

  await db
    .prepare("INSERT OR IGNORE INTO parent_students (id, parent_id, student_id) VALUES (?, ?, ?)")
    .bind(crypto.randomUUID(), userId, student.id)
    .run();
}
