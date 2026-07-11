import { getCookie, setCookie, deleteCookie, getRequestUrl } from "@tanstack/react-start/server";
import { getDb } from "./get-cloudflare-env";

const COOKIE_NAME = "bjh_session";
const SESSION_DAYS = 30;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isHttps(): boolean {
  try {
    return getRequestUrl().protocol === "https:";
  } catch {
    return true;
  }
}

export async function createSession(userId: string): Promise<void> {
  const token = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await getDb()
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(tokenHash, userId, expiresAt)
    .run();

  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(),
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const token = getCookie(COOKIE_NAME);
  if (token) {
    const tokenHash = await sha256Hex(token);
    await getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
  }
  deleteCookie(COOKIE_NAME, { path: "/" });
}

export interface SessionUser {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string;
  phone: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = getCookie(COOKIE_NAME);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);

  const row = await getDb()
    .prepare(
      `SELECT u.id as id, u.email as email, u.username as username, p.full_name as full_name, p.phone as phone
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN profiles p ON p.id = u.id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .bind(tokenHash, new Date().toISOString())
    .first<SessionUser>();

  return row ?? null;
}
