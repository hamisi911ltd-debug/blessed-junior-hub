import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface AuthUser {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string;
  phone: string | null;
}

export function useAuth() {
  const query = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => api.auth.me(),
    retry: false,
    staleTime: 60_000,
  });

  const user = query.data?.user ?? null;
  return { session: user ? { user } : null, user: user as AuthUser | null, loading: query.isLoading };
}
