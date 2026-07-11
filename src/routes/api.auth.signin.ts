import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getDb } from "@/lib/db/get-cloudflare-env";
import { verifyPasswordFlexible } from "@/lib/db/password";
import { createSession } from "@/lib/db/session";
import { jsonResponse, isSameOriginRequest } from "@/lib/db/auth-guard";
import { normalizePhone } from "@/lib/db/phone";

export const Route = createFileRoute("/api/auth/signin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOriginRequest(request)) return jsonResponse({ error: "Invalid origin" }, 403);

        const body = (await request.json().catch(() => null)) as { identifier?: string; password?: string } | null;
        const identifier = body?.identifier?.trim();
        const password = body?.password;
        if (!identifier || !password) return jsonResponse({ error: "Invalid email/phone or password" }, 400);

        // Three login shapes share this one field: staff/admin use email, guardians use
        // their phone number, and students/teachers (auto-provisioned on enrollment/hire)
        // use a username — their full name or staff ID number respectively. Try phone
        // before falling back to username so a phone-shaped identifier that happens to
        // also collide with a username still resolves to the phone-owning account.
        const isEmail = identifier.includes("@");
        const db = getDb();
        type Row = { id: string; email: string | null; username: string | null; password_hash: string };
        let user: Row | null = null;
        if (isEmail) {
          user = await db.prepare("SELECT id, email, username, password_hash FROM users WHERE email = ?").bind(identifier.toLowerCase()).first<Row>();
        } else {
          user = await db.prepare("SELECT id, email, username, password_hash FROM users WHERE phone = ?").bind(normalizePhone(identifier)).first<Row>();
          if (!user) {
            user = await db.prepare("SELECT id, email, username, password_hash FROM users WHERE username = ? COLLATE NOCASE").bind(identifier).first<Row>();
          }
        }

        if (!user || !(await verifyPasswordFlexible(password, user.password_hash))) {
          return jsonResponse({ error: "Invalid email/phone or password" }, 401);
        }

        await createSession(user.id);

        const profile = await db.prepare("SELECT full_name, phone FROM profiles WHERE id = ?").bind(user.id).first<{ full_name: string; phone: string | null }>();
        const { results: roleRows } = await db.prepare("SELECT role FROM user_roles WHERE user_id = ?").bind(user.id).all<{ role: string }>();

        return jsonResponse({
          user: { id: user.id, email: user.email, username: user.username, full_name: profile?.full_name ?? "", phone: profile?.phone ?? null },
          roles: roleRows.map((r) => r.role),
        });
      },
    },
  },
});
