export type Role = "admin" | "bursar" | "teacher" | "parent" | "student";

export interface AuthedUser {
  id: string;
  email: string | null;
  roles: Role[];
}

type RuleAtom = { roles: Role[] } | { self: string };
export type Rule = "any" | "deny" | RuleAtom[];

export interface TablePolicy {
  list: Rule;
  create: Rule;
  update: Rule;
  delete: Rule;
  /** Extra WHERE-clause scoping applied on top of `list`, for ownership that isn't a direct column equality. */
  listScope?: (user: AuthedUser) => { sql: string; params: unknown[] } | null;
}

const STAFF: Role[] = ["admin", "bursar", "teacher"];
const FINANCE: Role[] = ["admin", "bursar"];

function parentOrStudentScope(studentIdCol: string) {
  return (user: AuthedUser) => {
    if (user.roles.some((r) => STAFF.includes(r))) return null;
    return {
      sql: `(${studentIdCol} IN (SELECT id FROM students WHERE profile_id = ?) OR ${studentIdCol} IN (SELECT student_id FROM parent_students WHERE parent_id = ?))`,
      params: [user.id, user.id],
    };
  };
}

export const TABLE_POLICIES: Record<string, TablePolicy> = {
  profiles: { list: "any", create: "deny", update: [{ self: "id" }, { roles: ["admin"] }], delete: "deny" },
  user_roles: {
    list: [{ self: "user_id" }, { roles: ["admin"] }],
    create: [{ roles: ["admin"] }],
    update: [{ roles: ["admin"] }],
    delete: [{ roles: ["admin"] }],
  },
  terms: { list: "any", create: [{ roles: ["admin"] }], update: [{ roles: ["admin"] }], delete: [{ roles: ["admin"] }] },
  classes: { list: "any", create: [{ roles: ["admin"] }], update: [{ roles: ["admin"] }], delete: [{ roles: ["admin"] }] },
  subjects: { list: "any", create: [{ roles: ["admin"] }], update: [{ roles: ["admin"] }], delete: [{ roles: ["admin"] }] },
  teachers: {
    list: [{ roles: STAFF }, { self: "profile_id" }],
    create: [{ roles: ["admin"] }],
    update: [{ roles: ["admin"] }],
    delete: [{ roles: ["admin"] }],
  },
  teacher_subjects: {
    list: [{ roles: STAFF }],
    create: [{ roles: ["admin"] }],
    update: [{ roles: ["admin"] }],
    delete: [{ roles: ["admin"] }],
  },
  students: {
    list: [{ roles: STAFF }, { self: "profile_id" }],
    listScope: parentOrStudentScope("id"),
    create: [{ roles: ["admin"] }],
    update: [{ roles: ["admin"] }],
    delete: [{ roles: ["admin"] }],
  },
  parent_students: {
    list: [{ roles: STAFF }, { self: "parent_id" }],
    create: [{ roles: ["admin"] }],
    update: [{ roles: ["admin"] }],
    delete: [{ roles: ["admin"] }],
  },
  exams: { list: "any", create: [{ roles: STAFF }], update: [{ roles: STAFF }], delete: [{ roles: STAFF }] },
  results: {
    list: [{ roles: STAFF }],
    listScope: parentOrStudentScope("student_id"),
    create: [{ roles: STAFF }],
    update: [{ roles: STAFF }],
    delete: [{ roles: STAFF }],
  },
  fee_structures: { list: "any", create: [{ roles: FINANCE }], update: [{ roles: FINANCE }], delete: [{ roles: FINANCE }] },
  payments: {
    list: [{ roles: STAFF }],
    listScope: parentOrStudentScope("student_id"),
    create: [{ roles: FINANCE }],
    update: [{ roles: FINANCE }],
    delete: [{ roles: FINANCE }],
  },
  expenditures: { list: [{ roles: FINANCE }], create: [{ roles: FINANCE }], update: [{ roles: FINANCE }], delete: [{ roles: FINANCE }] },
  announcements: { list: "any", create: [{ roles: STAFF }], update: [{ roles: STAFF }], delete: [{ roles: STAFF }] },
  announcement_students: { list: [{ roles: STAFF }], create: [{ roles: STAFF }], update: [{ roles: STAFF }], delete: [{ roles: STAFF }] },
  school_settings: { list: "any", create: "deny", update: [{ roles: ["admin"] }], delete: "deny" },
};

function ruleAllows(rule: Rule, user: AuthedUser, row: Record<string, unknown> | undefined): boolean {
  if (rule === "any") return true;
  if (rule === "deny") return false;
  return rule.some((atom) => {
    if ("roles" in atom) return user.roles.some((r) => atom.roles.includes(r));
    if ("self" in atom) return !!row && row[atom.self] === user.id;
    return false;
  });
}

export function canWrite(
  table: string,
  action: "create" | "update" | "delete",
  user: AuthedUser,
  row?: Record<string, unknown>,
): boolean {
  const policy = TABLE_POLICIES[table];
  if (!policy) return false;
  return ruleAllows(policy[action], user, row);
}

export interface ListAccess {
  allowed: boolean;
  /** Extra `(...)`-wrapped WHERE fragment to AND onto the query; undefined means unrestricted (staff/role access). */
  scopeSql?: string;
  scopeParams: unknown[];
}

/**
 * Resolves what a user may see from a table's list endpoint.
 * - `policy.list === "any"` → unrestricted for every authenticated user.
 * - a `{roles}` atom matching the user's roles → unrestricted (blanket staff/admin access).
 * - otherwise, every `{self: col}` atom and `listScope` are OR'd together into a row filter.
 * - if none of the above apply, the user has no access at all.
 */
export function resolveListAccess(table: string, user: AuthedUser): ListAccess {
  const policy = TABLE_POLICIES[table];
  if (!policy) return { allowed: false, scopeParams: [] };
  if (policy.list === "any") return { allowed: true, scopeParams: [] };
  if (policy.list === "deny") return { allowed: false, scopeParams: [] };

  if (policy.list.some((atom) => "roles" in atom && user.roles.some((r) => atom.roles.includes(r)))) {
    return { allowed: true, scopeParams: [] };
  }

  const fragments: string[] = [];
  const params: unknown[] = [];
  for (const atom of policy.list) {
    if ("self" in atom) {
      fragments.push(`${atom.self} = ?`);
      params.push(user.id);
    }
  }
  const scoped = policy.listScope?.(user);
  if (scoped) {
    fragments.push(scoped.sql);
    params.push(...scoped.params);
  }

  if (!fragments.length) return { allowed: false, scopeParams: [] };
  return { allowed: true, scopeSql: `(${fragments.join(" OR ")})`, scopeParams: params };
}

export function isKnownTable(table: string): boolean {
  return Object.prototype.hasOwnProperty.call(TABLE_POLICIES, table);
}
