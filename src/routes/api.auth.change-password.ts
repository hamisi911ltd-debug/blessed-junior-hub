import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getDb } from "@/lib/db/get-cloudflare-env";
import { hashPassword, verifyPasswordFlexible } from "@/lib/db/password";
import { getAuthedUser, jsonResponse, isSameOriginRequest } from "@/lib/db/auth-guard";

export const Route = createFileRoute("/api/auth/change-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOriginRequest(request)) return jsonResponse({ error: "Invalid origin" }, 403);

        const user = await getAuthedUser();
        if (!user) return jsonResponse({ error: "Not signed in" }, 401);

        const body = (await request.json().catch(() => null)) as { current_password?: string; new_password?: string } | null;
        const currentPassword = body?.current_password;
        const newPassword = body?.new_password;
        if (!currentPassword || !newPassword) return jsonResponse({ error: "Current and new password are required" }, 400);
        if (newPassword.length < 6) return jsonResponse({ error: "New password must be at least 6 characters" }, 400);

        const db = getDb();
        const row = await db.prepare("SELECT password_hash FROM users WHERE id = ?").bind(user.id).first<{ password_hash: string }>();
        if (!row || !(await verifyPasswordFlexible(currentPassword, row.password_hash))) {
          return jsonResponse({ error: "Current password is incorrect" }, 401);
        }

        const passwordHash = await hashPassword(newPassword);
        await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(passwordHash, user.id).run();
        return jsonResponse({ ok: true });
      },
    },
  },
});
