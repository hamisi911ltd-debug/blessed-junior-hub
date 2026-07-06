export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface ListOptions {
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  eq?: Record<string, string>;
  in?: Record<string, string[]>;
}

function buildQuery(opts?: ListOptions): string {
  const params = new URLSearchParams();
  if (opts?.select) params.set("select", opts.select);
  if (opts?.orderBy) params.set("orderBy", opts.orderBy);
  if (opts?.ascending !== undefined) params.set("ascending", String(opts.ascending));
  if (opts?.eq) for (const [k, v] of Object.entries(opts.eq)) params.set(`eq.${k}`, v);
  if (opts?.in) for (const [k, v] of Object.entries(opts.in)) params.set(`in.${k}`, v.join(","));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  list: <T = any>(table: string, opts?: ListOptions) => request<T[]>(`/api/db/${table}${buildQuery(opts)}`),
  getOne: <T = any>(table: string, id: string) => request<T>(`/api/db/${table}/${id}`),
  create: <T = any>(table: string, body: Record<string, unknown>) =>
    request<T>(`/api/db/${table}`, { method: "POST", body: JSON.stringify(body) }),
  update: <T = any>(table: string, id: string, body: Record<string, unknown>) =>
    request<T>(`/api/db/${table}/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (table: string, id: string) => request<{ ok: true }>(`/api/db/${table}/${id}`, { method: "DELETE" }),

  auth: {
    me: async (): Promise<{ user: { id: string; email: string | null; full_name: string; phone: string | null } | null; roles: string[] }> => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.status === 401) return { user: null, roles: [] };
      if (!res.ok) throw new ApiError(`Request failed (${res.status})`);
      return res.json();
    },
    signUp: (email: string, password: string, full_name: string) =>
      request<{ user: any; roles: string[] }>("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password, full_name }) }),
    signIn: (identifier: string, password: string) =>
      request<{ user: any; roles: string[] }>("/api/auth/signin", { method: "POST", body: JSON.stringify({ identifier, password }) }),
    signOut: () => request<{ ok: true }>("/api/auth/signout", { method: "POST" }),
  },
};
