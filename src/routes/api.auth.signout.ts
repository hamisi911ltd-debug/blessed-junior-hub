import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { destroySession } from "@/lib/db/session";
import { jsonResponse } from "@/lib/db/auth-guard";

export const Route = createFileRoute("/api/auth/signout")({
  server: {
    handlers: {
      POST: async () => {
        await destroySession();
        return jsonResponse({ ok: true });
      },
    },
  },
});
