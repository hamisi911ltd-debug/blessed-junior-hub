import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useList<T = any>(table: string, opts?: { orderBy?: string; ascending?: boolean; select?: string }) {
  return useQuery({
    queryKey: [table, "list", opts],
    queryFn: async () => {
      let q = supabase.from(table as any).select(opts?.select ?? "*");
      if (opts?.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending ?? false });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useCrud(table: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [table] });
  const create = useMutation({
    mutationFn: async (row: any) => {
      const { data, error } = await supabase.from(table as any).insert(row).select().single();
      if (error) throw error; return data;
    },
    onSuccess: () => { invalidate(); toast.success("Created"); },
    onError: (e: any) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { data, error } = await supabase.from(table as any).update(values).eq("id", id).select().single();
      if (error) throw error; return data;
    },
    onSuccess: () => { invalidate(); toast.success("Updated"); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message),
  });
  return { create, update, remove };
}

export function useLookup(table: string, labelCol: string, valueCol = "id") {
  return useQuery({
    queryKey: [table, "lookup", labelCol, valueCol],
    queryFn: async () => {
      const { data, error } = await supabase.from(table as any).select(`${valueCol}, ${labelCol}`).order(labelCol);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ value: r[valueCol], label: r[labelCol] }));
    },
  });
}