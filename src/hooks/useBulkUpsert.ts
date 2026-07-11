import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export type BulkOp = { existingId?: string; values: Record<string, unknown> };

/** Saves a whole roster grid at once: one create/update request per row, run concurrently. */
export function useBulkUpsert(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ops: BulkOp[]) => {
      await Promise.all(
        ops.map((op) => (op.existingId ? api.update(table, op.existingId, op.values) : api.create(table, op.values)))
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });
}
