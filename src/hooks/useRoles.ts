import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export type AppRole = "admin" | "bursar" | "teacher" | "parent" | "student";

export function useRoles(userId: string | undefined) {
  return useQuery({
    queryKey: ["auth-me"],
    enabled: !!userId,
    queryFn: () => api.auth.me(),
    select: (data) => (data?.roles ?? []) as AppRole[],
    staleTime: 60_000,
  });
}

export const isStaff = (roles: AppRole[]) =>
  roles.some((r) => r === "admin" || r === "bursar" || r === "teacher");
export const isAdmin = (roles: AppRole[]) => roles.includes("admin");
export const isBursar = (roles: AppRole[]) => roles.includes("bursar");
export const isTeacher = (roles: AppRole[]) => roles.includes("teacher");
export const isParent = (roles: AppRole[]) => roles.includes("parent");
export const isStudent = (roles: AppRole[]) => roles.includes("student");
