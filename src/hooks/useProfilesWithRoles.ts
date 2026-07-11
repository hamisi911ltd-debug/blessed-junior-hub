import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export type ProfileWithRoles = { id: string; full_name: string; email: string | null; roles: string[] };

/** Joins profiles + user_roles client-side (profiles has no roles column of its own). */
export function useProfilesWithRoles() {
  return useQuery({
    queryKey: ["profiles-with-roles"],
    queryFn: async (): Promise<ProfileWithRoles[]> => {
      const [profiles, roles] = await Promise.all([
        api.list<{ id: string; full_name: string; email: string | null }>("profiles"),
        api.list<{ user_id: string; role: string }>("user_roles"),
      ]);
      const rolesByUser = new Map<string, string[]>();
      for (const r of roles) rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role]);
      return profiles.map((p) => ({ ...p, roles: rolesByUser.get(p.id) ?? [] }));
    },
  });
}
