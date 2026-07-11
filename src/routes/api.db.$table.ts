import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getAuthedUser, jsonResponse, isSameOriginRequest } from "@/lib/db/auth-guard";
import { isKnownTable, resolveListAccess, canWrite } from "@/lib/db/permissions";
import { listRows, insertRow } from "@/lib/db/query-builder";
import { provisionGuardianAccount } from "@/lib/db/guardian-provisioning";
import { provisionStudentAccount } from "@/lib/db/student-provisioning";
import { provisionTeacherAccount } from "@/lib/db/teacher-provisioning";

export const Route = createFileRoute("/api/db/$table")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { table } = params;
        if (!isKnownTable(table)) return jsonResponse({ error: "Unknown table" }, 404);

        const user = await getAuthedUser();
        if (!user) return jsonResponse({ error: "Not signed in" }, 401);

        const access = resolveListAccess(table, user);
        if (!access.allowed) return jsonResponse({ error: "Forbidden" }, 403);

        const url = new URL(request.url);
        const select = url.searchParams.get("select");
        const orderBy = url.searchParams.get("orderBy") ?? undefined;
        const ascendingParam = url.searchParams.get("ascending");

        const eq: Record<string, string> = {};
        const inFilters: Record<string, string[]> = {};
        for (const [key, value] of url.searchParams) {
          if (key.startsWith("eq.")) eq[key.slice(3)] = value;
          if (key.startsWith("in.")) inFilters[key.slice(3)] = value.split(",").filter(Boolean);
        }

        try {
          const rows = await listRows(table, {
            select: select ? select.split(",").map((s) => s.trim()) : undefined,
            orderBy,
            ascending: ascendingParam === null ? undefined : ascendingParam !== "false",
            eq,
            in: inFilters,
            extraWhere: access.scopeSql ? { sql: access.scopeSql, params: access.scopeParams } : undefined,
          });
          return jsonResponse(rows);
        } catch (e) {
          return jsonResponse({ error: e instanceof Error ? e.message : "Query failed" }, 500);
        }
      },

      POST: async ({ request, params }) => {
        if (!isSameOriginRequest(request)) return jsonResponse({ error: "Invalid origin" }, 403);
        const { table } = params;
        if (!isKnownTable(table)) return jsonResponse({ error: "Unknown table" }, 404);

        const user = await getAuthedUser();
        if (!user) return jsonResponse({ error: "Not signed in" }, 401);

        const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
        if (!body) return jsonResponse({ error: "Invalid JSON body" }, 400);

        if (!canWrite(table, "create", user, body)) return jsonResponse({ error: "Forbidden" }, 403);

        try {
          const created = await insertRow(table, body);
          if (table === "students") {
            await provisionGuardianAccount(created as any);
            await provisionStudentAccount(created as any);
          }
          if (table === "teachers") await provisionTeacherAccount(created as any);
          return jsonResponse(created, 201);
        } catch (e) {
          return jsonResponse({ error: e instanceof Error ? e.message : "Insert failed" }, 500);
        }
      },
    },
  },
});
