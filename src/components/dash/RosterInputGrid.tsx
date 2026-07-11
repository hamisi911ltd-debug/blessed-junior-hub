import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

export type RosterRow = { id: string; full_name: string; admission_no?: string | null };

/**
 * Shared "whole class at once" grid: one row per student, one input/select per row,
 * seeded from `initialValues`. Re-seeds whenever the *content* of `initialValues`
 * changes — not just when the scope (class/date/exam/subject) selection changes —
 * since `students`/existing-rows queries resolve asynchronously after the scope
 * changes, and the grid must pick up that data once it actually arrives.
 */
export function RosterInputGrid({
  students, isLoading, initialValues, renderCell, onSaveAll, saving, valueLabel, extraHeader,
}: {
  students: RosterRow[];
  isLoading?: boolean;
  initialValues: Record<string, any>;
  renderCell: (value: any, onChange: (v: any) => void) => ReactNode;
  onSaveAll: (values: Record<string, any>) => void;
  saving?: boolean;
  valueLabel: string;
  extraHeader?: ReactNode;
}) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [search, setSearch] = useState("");

  // Keyed on content (not identity) so this fires once when the async students/existing-rows
  // queries actually resolve, not just when the class/date/exam/subject selection changes.
  const seed = JSON.stringify(initialValues);
  useEffect(() => {
    setValues(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.full_name.toLowerCase().includes(q) || (s.admission_no ?? "").toLowerCase().includes(q));
  }, [students, search]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students…" className="pl-8" />
          </div>
          {extraHeader}
        </div>
        <Button
          onClick={() => onSaveAll(values)}
          disabled={saving || students.length === 0}
          className="bg-brand-gradient text-brand-foreground shrink-0"
        >
          {saving ? "Saving…" : "Save all"}
        </Button>
      </div>
      <div className="rounded-2xl border bg-card overflow-x-auto shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admission No</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>{valueLabel}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3}>Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                {students.length === 0 ? "No students in this class yet." : "No matches."}
              </TableCell></TableRow>
            ) : filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-muted-foreground">{s.admission_no ?? "—"}</TableCell>
                <TableCell className="font-medium">{s.full_name}</TableCell>
                <TableCell>
                  {renderCell(values[s.id], (v) => setValues((prev) => ({ ...prev, [s.id]: v })))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
