import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

/** Fetches a small reference table once and returns it as an id -> row Map, for client-side joins. */
export function useLookupMap<T extends Record<string, any> = any>(table: string, valueCol = "id") {
  const query = useQuery({
    queryKey: [table, "lookup-map", valueCol],
    queryFn: async () => {
      const rows = await api.list<T>(table);
      return new Map(rows.map((r) => [r[valueCol], r]));
    },
  });
  return { map: query.data ?? new Map<string, T>(), isLoading: query.isLoading };
}
