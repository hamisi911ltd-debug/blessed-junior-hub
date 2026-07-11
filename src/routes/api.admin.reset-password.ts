import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getDb } from "@/lib/db/get-cloudflare-env";
import { hashPassword } from "@/lib/db/password";
import { getAuthedUser, jsonResponse, isSameOriginRequest } from "@/lib/db/auth-guard";

export const Route = createFileRoute("/api/admin/reset-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOriginRequest(request)) return jsonResponse({ error: "Invalid origin" }, 403);

        const user = await getAuthedUser();
        if (!user || !user.roles.includes("admin")) return jsonResponse({ error: "Forbidden" }, 403);

        const body = (await request.json().catch(() => null)) as { user_id?: string; new_password?: string } | null;
        const targetUserId = body?.user_id;
        const newPassword = body?.new_password;
        if (!targetUserId || !newPassword) return jsonResponse({ error: "user_id and new_password are required" }, 400);
        if (newPassword.length < 6) return jsonResponse({ error: "New password must be at least 6 characters" }, 400);

        const db = getDb();
        const target = await db.prepare("SELECT id FROM users WHERE id = ?").bind(targetUserId).first<{ id: string }>();
        if (!target) return jsonResponse({ error: "User not found" }, 404);

        const passwordHash = await hashPassword(newPassword);
        await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(passwordHash, targetUserId).run();
        return jsonResponse({ ok: true });
      },
    },
  },
});
