import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useList, useCrud } from "@/lib/crud-helpers";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "date" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  hideInTable?: boolean;
  format?: (v: any, row: any) => ReactNode;
  defaultValue?: any;
};

export function CrudPage({
  table, fields, title, canWrite = true, orderBy = "created_at", select,
  extraColumns,
}: {
  table: string; fields: FieldDef[]; title: string; canWrite?: boolean; orderBy?: string;
  select?: string;
  extraColumns?: { label: string; render: (row: any) => ReactNode }[];
}) {
  const { data = [], isLoading } = useList<any>(table, { orderBy, ascending: false, select });
  const { create, update, remove } = useCrud(table);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  const openCreate = () => { setEditing(null); setForm(Object.fromEntries(fields.map(f => [f.name, f.defaultValue ?? ""]))); setOpen(true); };
  const openEdit = (row: any) => { setEditing(row); setForm({ ...row }); setOpen(true); };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values: any = {};
    for (const f of fields) {
      let v = form[f.name];
      if (v === "" || v === undefined) v = null;
      if (f.type === "number" && v !== null) v = Number(v);
      values[f.name] = v;
    }
    if (editing) await update.mutateAsync({ id: editing.id, values });
    else await create.mutateAsync(values);
    setOpen(false);
  };

  const visible = fields.filter(f => !f.hideInTable);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{data.length} record{data.length === 1 ? "" : "s"}</div>
        {canWrite && (
          <Button onClick={openCreate} className="bg-brand-gradient text-brand-foreground">
            <Plus className="h-4 w-4 mr-1" /> New {title}
          </Button>
        )}
      </div>
      <div className="rounded-2xl border bg-card overflow-x-auto shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              {visible.map(f => <TableHead key={f.name}>{f.label}</TableHead>)}
              {extraColumns?.map(c => <TableHead key={c.label}>{c.label}</TableHead>)}
              {canWrite && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={visible.length + 1}>Loading…</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={visible.length + 1} className="text-center text-muted-foreground py-10">No {title.toLowerCase()} yet.</TableCell></TableRow>
            ) : data.map((row: any) => (
              <TableRow key={row.id}>
                {visible.map(f => (
                  <TableCell key={f.name}>
                    {f.format ? f.format(row[f.name], row) : (row[f.name]?.toString() ?? "—")}
                  </TableCell>
                ))}
                {extraColumns?.map(c => <TableCell key={c.label}>{c.render(row)}</TableCell>)}
                {canWrite && (
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setConfirmId(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} {title}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            {fields.map(f => (
              <div key={f.name}>
                <Label>{f.label}{f.required && " *"}</Label>
                {f.type === "textarea" ? (
                  <Textarea value={form[f.name] ?? ""} onChange={e => setForm({ ...form, [f.name]: e.target.value })} required={f.required} />
                ) : f.type === "select" ? (
                  <Select value={form[f.name] ?? ""} onValueChange={v => setForm({ ...form, [f.name]: v })}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {f.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input type={f.type ?? "text"} value={form[f.name] ?? ""} onChange={e => setForm({ ...form, [f.name]: e.target.value })} required={f.required} />
                )}
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-brand-gradient text-brand-foreground">{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {title.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (confirmId) { await remove.mutateAsync(confirmId); setConfirmId(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}