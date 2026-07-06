import { getDb } from "./get-cloudflare-env";
import { TABLE_COLUMNS, BOOLEAN_COLUMNS, SERVER_MANAGED_COLUMNS, isKnownColumn } from "./schema-meta";

function coerceOut(table: string, row: Record<string, unknown>): Record<string, unknown> {
  const boolCols = BOOLEAN_COLUMNS[table];
  if (!boolCols?.length) return row;
  const out = { ...row };
  for (const col of boolCols) if (col in out) out[col] = !!out[col];
  return out;
}

function coerceIn(table: string, values: Record<string, unknown>): Record<string, unknown> {
  const boolCols = BOOLEAN_COLUMNS[table];
  if (!boolCols?.length) return values;
  const out = { ...values };
  for (const col of boolCols) if (col in out) out[col] = out[col] ? 1 : 0;
  return out;
}

export interface ListParams {
  select?: string[];
  orderBy?: string;
  ascending?: boolean;
  eq?: Record<string, string>;
  in?: Record<string, string[]>;
  extraWhere?: { sql: string; params: unknown[] };
}

export async function listRows(table: string, params: ListParams): Promise<Record<string, unknown>[]> {
  const knownCols = TABLE_COLUMNS[table];
  const cols = params.select?.length ? params.select.filter((c) => isKnownColumn(table, c)) : knownCols;
  const selectSql = cols.length ? cols.join(", ") : "*";

  const where: string[] = [];
  const bind: unknown[] = [];

  if (params.eq) {
    for (const [col, val] of Object.entries(params.eq)) {
      if (!isKnownColumn(table, col)) continue;
      where.push(`${col} = ?`);
      bind.push(val);
    }
  }
  if (params.in) {
    for (const [col, vals] of Object.entries(params.in)) {
      if (!isKnownColumn(table, col) || !vals.length) continue;
      where.push(`${col} IN (${vals.map(() => "?").join(",")})`);
      bind.push(...vals);
    }
  }
  if (params.extraWhere) {
    where.push(params.extraWhere.sql);
    bind.push(...params.extraWhere.params);
  }

  let sql = `SELECT ${selectSql} FROM ${table}`;
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  if (params.orderBy && isKnownColumn(table, params.orderBy)) {
    sql += ` ORDER BY ${params.orderBy} ${params.ascending === false ? "DESC" : "ASC"}`;
  }

  const result = await getDb()
    .prepare(sql)
    .bind(...bind)
    .all<Record<string, unknown>>();
  return result.results.map((r) => coerceOut(table, r));
}

export async function getRowById(table: string, id: string): Promise<Record<string, unknown> | null> {
  const row = await getDb().prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first<Record<string, unknown>>();
  return row ? coerceOut(table, row) : null;
}

function sanitizeBody(table: string, body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [col, val] of Object.entries(body)) {
    if (SERVER_MANAGED_COLUMNS.includes(col)) continue;
    if (!isKnownColumn(table, col)) continue;
    out[col] = val;
  }
  return coerceIn(table, out);
}

export async function insertRow(table: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const values = sanitizeBody(table, body);
  // Drop explicit nulls on insert so NOT-NULL-with-DEFAULT columns (e.g. spent_on) fall back
  // to their column default instead of violating the constraint. Updates keep explicit nulls
  // since a user may be intentionally clearing a previously-set value.
  for (const key of Object.keys(values)) {
    if (values[key] === null) delete values[key];
  }
  const id = crypto.randomUUID();
  const cols = ["id", ...Object.keys(values)];
  const placeholders = cols.map(() => "?").join(", ");
  await getDb()
    .prepare(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`)
    .bind(id, ...Object.values(values))
    .run();
  const created = await getRowById(table, id);
  if (!created) throw new Error("Insert succeeded but row could not be re-read");
  return created;
}

export async function updateRow(table: string, id: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const values = sanitizeBody(table, body);
  const cols = Object.keys(values);
  if (cols.length) {
    const setSql = cols.map((c) => `${c} = ?`).join(", ");
    await getDb()
      .prepare(`UPDATE ${table} SET ${setSql} WHERE id = ?`)
      .bind(...Object.values(values), id)
      .run();
  }
  const updated = await getRowById(table, id);
  if (!updated) throw new Error("Row not found after update");
  return updated;
}

export async function deleteRow(table: string, id: string): Promise<void> {
  await getDb().prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
}
