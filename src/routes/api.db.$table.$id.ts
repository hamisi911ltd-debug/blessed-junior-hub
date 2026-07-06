import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getAuthedUser, jsonResponse, isSameOriginRequest } from "@/lib/db/auth-guard";
import { isKnownTable, canWrite, resolveListAccess } from "@/lib/db/permissions";
import { getRowById, updateRow, deleteRow, listRows } from "@/lib/db/query-builder";
import { provisionGuardianAccount } from "@/lib/db/guardian-provisioning";

export const Route = createFileRoute("/api/db/$table/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { table, id } = params;
        if (!isKnownTable(table)) return jsonResponse({ error: "Unknown table" }, 404);

        const user = await getAuthedUser();
        if (!user) return jsonResponse({ error: "Not signed in" }, 401);

        // Apply the same row-level scoping as the list endpoint (e.g. a parent may only
        // fetch invoices/results/students for their own linked children) — without this,
        // GET-by-id would let any authenticated user read any row by guessing/reusing an id.
        const access = resolveListAccess(table, user);
        if (!access.allowed) return jsonResponse({ error: "Forbidden" }, 403);

        const rows = await listRows(table, {
          eq: { id },
          extraWhere: access.scopeSql ? { sql: access.scopeSql, params: access.scopeParams } : undefined,
        });
        const row = rows[0];
        if (!row) return jsonResponse({ error: "Not found" }, 404);
        return jsonResponse(row);
      },

      PATCH: async ({ request, params }) => {
        if (!isSameOriginRequest(request)) return jsonResponse({ error: "Invalid origin" }, 403);
        const { table, id } = params;
        if (!isKnownTable(table)) return jsonResponse({ error: "Unknown table" }, 404);

        const user = await getAuthedUser();
        if (!user) return jsonResponse({ error: "Not signed in" }, 401);

        const existing = await getRowById(table, id);
        if (!existing) return jsonResponse({ error: "Not found" }, 404);
        if (!canWrite(table, "update", user, existing)) return jsonResponse({ error: "Forbidden" }, 403);

        const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
        if (!body) return jsonResponse({ error: "Invalid JSON body" }, 400);

        try {
          const updated = await updateRow(table, id, body);
          if (table === "students") await provisionGuardianAccount(updated as any);
          return jsonResponse(updated);
        } catch (e) {
          return jsonResponse({ error: e instanceof Error ? e.message : "Update failed" }, 500);
        }
      },

      DELETE: async ({ request, params }) => {
        if (!isSameOriginRequest(request)) return jsonResponse({ error: "Invalid origin" }, 403);
        const { table, id } = params;
        if (!isKnownTable(table)) return jsonResponse({ error: "Unknown table" }, 404);

        const user = await getAuthedUser();
        if (!user) return jsonResponse({ error: "Not signed in" }, 401);

        const existing = await getRowById(table, id);
        if (!existing) return jsonResponse({ error: "Not found" }, 404);
        if (!canWrite(table, "delete", user, existing)) return jsonResponse({ error: "Forbidden" }, 403);

        await deleteRow(table, id);
        return jsonResponse({ ok: true });
      },
    },
  },
});
