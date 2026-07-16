import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getDb } from "@/lib/db/get-cloudflare-env";
import { jsonResponse } from "@/lib/db/auth-guard";

/** Public (no auth) — the school's public-facing contact details, sourced from the same
 * Settings -> School Details record an admin fills in. Used on the landing page's Contact
 * section and on the sign-in page's "forgot password" WhatsApp link. */
export const Route = createFileRoute("/api/public/school-contact")({
  server: {
    handlers: {
      GET: async () => {
        const row = await getDb()
          .prepare("SELECT name, phone, email, address FROM school_settings WHERE id = 'default'")
          .first<{ name: string; phone: string | null; email: string | null; address: string | null }>();
        return jsonResponse(row ?? { name: null, phone: null, email: null, address: null });
      },
    },
  },
});
