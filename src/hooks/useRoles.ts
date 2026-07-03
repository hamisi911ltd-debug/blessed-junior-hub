import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "bursar" | "teacher" | "parent" | "student";

export function useRoles(userId: string | undefined) {
  return useQuery({
    queryKey: ["roles", userId],
    enabled: !!userId,
    queryFn: async (): Promise<AppRole[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });
}

export const isStaff = (roles: AppRole[]) =>
  roles.some((r) => r === "admin" || r === "bursar" || r === "teacher");
export const isAdmin = (roles: AppRole[]) => roles.includes("admin");
export const isBursar = (roles: AppRole[]) => roles.includes("bursar");
export const isTeacher = (roles: AppRole[]) => roles.includes("teacher");
export const isParent = (roles: AppRole[]) => roles.includes("parent");
export const isStudent = (roles: AppRole[]) => roles.includes("student");