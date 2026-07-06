import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getDb } from "@/lib/db/get-cloudflare-env";
import { hashPassword } from "@/lib/db/password";
import { createSession } from "@/lib/db/session";
import { jsonResponse, isSameOriginRequest } from "@/lib/db/auth-guard";

export const Route = createFileRoute("/api/auth/signup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOriginRequest(request)) return jsonResponse({ error: "Invalid origin" }, 403);

        const body = (await request.json().catch(() => null)) as { email?: string; password?: string; full_name?: string } | null;
        const email = body?.email?.trim().toLowerCase();
        const password = body?.password;
        const fullName = body?.full_name?.trim() ?? "";

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return jsonResponse({ error: "A valid email is required" }, 400);
        }
        if (!password || password.length < 6) {
          return jsonResponse({ error: "Password must be at least 6 characters" }, 400);
        }

        const db = getDb();
        const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
        if (existing) return jsonResponse({ error: "An account with this email already exists" }, 409);

        const id = crypto.randomUUID();
        const passwordHash = await hashPassword(password);

        await db.batch([
          db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").bind(id, email, passwordHash),
          db.prepare("INSERT INTO profiles (id, full_name, email) VALUES (?, ?, ?)").bind(id, fullName, email),
        ]);

        const adminCount = await db.prepare("SELECT COUNT(*) as n FROM user_roles WHERE role = 'admin'").first<{ n: number }>();
        let roles: string[] = [];
        if (!adminCount || adminCount.n === 0) {
          await db.prepare("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, 'admin')").bind(crypto.randomUUID(), id).run();
          roles = ["admin"];
        }

        await createSession(id);

        return jsonResponse({ user: { id, email, full_name: fullName, phone: null }, roles });
      },
    },
  },
});
