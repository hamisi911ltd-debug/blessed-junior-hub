import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getAuthedUser, jsonResponse } from "@/lib/db/auth-guard";
import { getSessionUser } from "@/lib/db/session";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async () => {
        const sessionUser = await getSessionUser();
        if (!sessionUser) return jsonResponse({ error: "Not signed in" }, 401);
        const authed = await getAuthedUser();
        return jsonResponse({ user: sessionUser, roles: authed?.roles ?? [] });
      },
    },
  },
});
