import { getSessionUser } from "./session";
import { getDb } from "./get-cloudflare-env";
import type { AuthedUser, Role } from "./permissions";

export async function getAuthedUser(): Promise<AuthedUser | null> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;
  const { results } = await getDb()
    .prepare("SELECT role FROM user_roles WHERE user_id = ?")
    .bind(sessionUser.id)
    .all<{ role: Role }>();
  return { id: sessionUser.id, email: sessionUser.email, roles: results.map((r) => r.role) };
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

/**
 * Defense-in-depth against CSRF on cookie-authed mutation routes (SameSite=Lax already blocks
 * cross-site fetch/XHR in modern browsers, but this catches older browsers / misconfigured proxies).
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
