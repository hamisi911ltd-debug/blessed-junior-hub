import { getDb } from "./get-cloudflare-env";
import { hashPassword } from "./password";
import { normalizePhone } from "./phone";

/**
 * Gives a teacher their own portal login the moment their HR record carries both an
 * ID number and a phone: username is the ID number, password is the phone number.
 * Linked via `teachers.profile_id` (already unique-per-teacher, and also the manual
 * "link to an existing account" field on the Teachers form — this just automates the
 * common case where no account exists yet).
 */
export async function provisionTeacherAccount(teacher: {
  id: string; id_no?: string | null; phone?: string | null; full_name: string; profile_id?: string | null;
}): Promise<void> {
  if (teacher.profile_id) return;
  if (!teacher.id_no || !teacher.phone) return;
  const password = normalizePhone(teacher.phone);
  if (!password) return;

  const db = getDb();
  const username = teacher.id_no.trim();
  const existing = await db.prepare("SELECT id FROM users WHERE username = ? COLLATE NOCASE").bind(username).first<{ id: string }>();

  if (existing) {
    // Same ID number already has a login (e.g. re-added after a records cleanup) — link to it rather than erroring.
    await db.prepare("UPDATE teachers SET profile_id = ? WHERE id = ?").bind(existing.id, teacher.id).run();
    return;
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  await db.batch([
    db.prepare("INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)").bind(userId, username, passwordHash),
    db.prepare("INSERT INTO profiles (id, full_name, phone) VALUES (?, ?, ?)").bind(userId, teacher.full_name, password),
    db.prepare("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, 'teacher')").bind(crypto.randomUUID(), userId),
  ]);
  await db.prepare("UPDATE teachers SET profile_id = ? WHERE id = ?").bind(userId, teacher.id).run();
}
