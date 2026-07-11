import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getDb } from "@/lib/db/get-cloudflare-env";
import { jsonResponse } from "@/lib/db/auth-guard";

/** Public (no auth) — just the school's name/phone, the same info already shown on the public landing page, needed on the sign-in page before a session exists (e.g. the "forgot password" WhatsApp link). */
export const Route = createFileRoute("/api/public/school-contact")({
  server: {
    handlers: {
      GET: async () => {
        const row = await getDb()
          .prepare("SELECT name, phone FROM school_settings WHERE id = 'default'")
          .first<{ name: string; phone: string | null }>();
        return jsonResponse(row ?? { name: null, phone: null });
      },
    },
  },
});
