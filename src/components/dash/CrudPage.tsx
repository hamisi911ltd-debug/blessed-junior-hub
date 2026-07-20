import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useList, useCrud } from "@/lib/crud-helpers";
import { resizeImageToDataUrl } from "@/lib/image";
import { toast } from "sonner";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "date" | "textarea" | "select" | "image";
  options?: { value: string; label: string }[];
  required?: boolean;
  hideInTable?: boolean;
  format?: (v: any, row: any) => ReactNode;
  defaultValue?: any;
};

const ALL = "__all__";

export function CrudPage({
  table, fields, title, canWrite = true, canCreate, canEdit, canDelete, orderBy = "created_at", select,
  extraColumns,
}: {
  table: string; fields: FieldDef[]; title: string; canWrite?: boolean;
  /** Override canWrite for just one action, e.g. a role that can add rows but not delete them. */
  canCreate?: boolean; canEdit?: boolean; canDelete?: boolean;
  orderBy?: string;
  select?: string;
  extraColumns?: { label: string; render: (row: any) => ReactNode }[];
}) {
  const allowCreate = canCreate ?? canWrite;
  const allowEdit = canEdit ?? canWrite;
  const allowDelete = canDelete ?? canWrite;
  const allowRowActions = allowEdit || allowDelete;
  const { data = [], isLoading } = useList<any>(table, { orderBy, ascending: false, select });
  const { create, update, remove } = useCrud(table);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const visible = fields.filter(f => !f.hideInTable);
  const filterableFields = visible.filter(f => f.type === "select" && f.options?.length);

  const filtered = useMemo(() => {
    return data.filter((row: any) => {
      for (const f of filterableFields) {
        const want = filters[f.name];
        if (want && want !== ALL && String(row[f.name] ?? "") !== want) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = visible.map(f => String(row[f.name] ?? "")).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, search, filters, filterableFields, visible]);

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

  const onImagePick = async (name: string, file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setForm((f: any) => ({ ...f, [name]: dataUrl }));
    } catch {
      toast.error("Could not process that image");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}…`} className="pl-8" />
          </div>
          {filterableFields.map(f => (
            <Select key={f.name} value={filters[f.name] ?? ALL} onValueChange={(v) => setFilters({ ...filters, [f.name]: v })}>
              <SelectTrigger className="w-40"><SelectValue placeholder={f.label} /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All {f.label.toLowerCase()}</SelectItem>
                {f.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
          <div className="text-sm text-muted-foreground">{filtered.length} of {data.length} record{data.length === 1 ? "" : "s"}</div>
        </div>
        {allowCreate && (
          <Button onClick={openCreate} className="bg-brand-gradient text-brand-foreground shrink-0">
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
              {allowRowActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={visible.length + 1}>Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={visible.length + 1} className="text-center text-muted-foreground py-10">
                {data.length === 0 ? `No ${title.toLowerCase()} yet.` : "No matches."}
              </TableCell></TableRow>
            ) : filtered.map((row: any) => (
              <TableRow key={row.id}>
                {visible.map(f => (
                  <TableCell key={f.name}>
                    {f.format ? f.format(row[f.name], row) : f.type === "image" ? (
                      row[f.name] ? <img src={row[f.name]} alt="" className="h-10 w-10 rounded-full object-cover" /> : "—"
                    ) : (row[f.name]?.toString() ?? "—")}
                  </TableCell>
                ))}
                {extraColumns?.map(c => <TableCell key={c.label}>{c.render(row)}</TableCell>)}
                {allowRowActions && (
                  <TableCell className="text-right">
                    {allowEdit && <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>}
                    {allowDelete && <Button variant="ghost" size="icon" onClick={() => setConfirmId(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
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
                ) : f.type === "image" ? (
                  <div className="flex items-center gap-3">
                    {form[f.name] ? (
                      <img src={form[f.name]} alt="" className="h-16 w-16 rounded-full object-cover border" />
                    ) : (
                      <div className="h-16 w-16 rounded-full border bg-secondary" />
                    )}
                    <Input type="file" accept="image/*" onChange={e => onImagePick(f.name, e.target.files?.[0])} />
                  </div>
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
