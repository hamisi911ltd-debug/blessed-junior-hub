import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/users")({
  component: Page,
});

type Row = { id: string; full_name: string; email: string | null; roles: string[] };

function Page() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async (): Promise<Row[]> => {
      const { data: profiles, error } = await supabase.from("profiles").select("id, full_name, email");
      if (error) throw error;
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role),
      }));
    },
  });

  const addRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id, role: role as any });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users-with-roles"] }); toast.success("Role assigned"); },
    onError: (e: any) => toast.error(e.message),
  });
  const removeRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users-with-roles"] }); toast.success("Role removed"); },
    onError: (e: any) => toast.error(e.message),
  });

  const [role, setRole] = useState<Record<string, string>>({});

  return (
    <DashShell title="Users & Roles" subtitle="Grant access to admins, teachers, parents and students"
      actions={<LinkParentDialog />}>
      <div className="rounded-2xl border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Assign role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4}>Loading…</TableCell></TableRow> :
              data.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length === 0 ? <span className="text-xs text-muted-foreground">none</span> :
                        u.roles.map((r) => (
                          <Badge key={r} variant="secondary" className="gap-1">
                            {r}
                            <button onClick={() => removeRole.mutate({ user_id: u.id, role: r })}>
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select value={role[u.id] ?? ""} onValueChange={(v) => setRole({ ...role, [u.id]: v })}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Pick role" /></SelectTrigger>
                        <SelectContent>
                          {["admin","bursar","teacher","parent","student"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="sm" disabled={!role[u.id]} onClick={() => role[u.id] && addRole.mutate({ user_id: u.id, role: role[u.id] })}>Add</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </DashShell>
  );
}

function LinkParentDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [parentId, setParentId] = useState("");
  const [studentId, setStudentId] = useState("");
  const { data: parents = [] } = useQuery({
    queryKey: ["parent-profiles"],
    queryFn: async () => {
      const { data: r } = await supabase.from("user_roles").select("user_id").eq("role", "parent");
      const ids = (r ?? []).map((x: any) => x.user_id);
      if (!ids.length) return [];
      const { data } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      return data ?? [];
    },
  });
  const { data: students = [] } = useQuery({
    queryKey: ["students-list-mini"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("id, full_name, admission_no").order("full_name");
      return data ?? [];
    },
  });
  const link = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("parent_students").insert({ parent_id: parentId, student_id: studentId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries(); toast.success("Linked"); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-1" /> Link parent to student</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Link parent to student</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Parent</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger><SelectValue placeholder="Choose parent" /></SelectTrigger>
              <SelectContent>{parents.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>)}</SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Parents must have signed up and been assigned the "parent" role.</p>
          </div>
          <div>
            <Label>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue placeholder="Choose student" /></SelectTrigger>
              <SelectContent>{students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.admission_no})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Input placeholder="Also fill: student_id + parent_id" className="hidden" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!parentId || !studentId} onClick={() => link.mutate()} className="bg-brand-gradient text-brand-foreground">Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}