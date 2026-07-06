import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export function useList<T = any>(table: string, opts?: { orderBy?: string; ascending?: boolean; select?: string }) {
  return useQuery({
    queryKey: [table, "list", opts],
    queryFn: async () => {
      return api.list<T>(table, {
        select: opts?.select,
        orderBy: opts?.orderBy,
        ascending: opts?.orderBy ? opts?.ascending ?? false : undefined,
      });
    },
  });
}

export function useCrud(table: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [table] });
  const create = useMutation({
    mutationFn: async (row: any) => api.create(table, row),
    onSuccess: () => { invalidate(); toast.success("Created"); },
    onError: (e: any) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => api.update(table, id, values),
    onSuccess: () => { invalidate(); toast.success("Updated"); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => api.remove(table, id),
    onSuccess: () => { invalidate(); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });
  return { create, update, remove };
}

export function useLookup(table: string, labelCol: string, valueCol = "id") {
  return useQuery({
    queryKey: [table, "lookup", labelCol, valueCol],
    queryFn: async () => {
      const rows = await api.list<any>(table, { select: `${valueCol},${labelCol}`, orderBy: labelCol, ascending: true });
      return rows.map((r) => ({ value: r[valueCol], label: r[labelCol] }));
    },
  });
}
