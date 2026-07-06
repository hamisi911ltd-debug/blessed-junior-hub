import { getRequest } from "@tanstack/react-start/server";

export interface CloudflareEnv {
  DB: D1Database;
}

export function getCloudflareEnv(): CloudflareEnv {
  const req = getRequest() as unknown as { runtime?: { cloudflare?: { env?: CloudflareEnv } } };
  const env = req.runtime?.cloudflare?.env;
  if (!env?.DB) {
    throw new Error(
      "Cloudflare D1 binding unavailable — this route must run under `wrangler dev` or the deployed Worker, not plain `vite dev`.",
    );
  }
  return env;
}

export function getDb(): D1Database {
  return getCloudflareEnv().DB;
}
