import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, isAdmin as checkIsAdmin } from "@/hooks/useRoles";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useProfilesWithRoles } from "@/hooks/useProfilesWithRoles";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2, KeyRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/teachers")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles(user?.id);
  const admin = checkIsAdmin(roles);
  const { data: profiles = [] } = useProfilesWithRoles();

  const profileOptions = useMemo(
    () => profiles.map((p) => ({ value: p.id, label: `${p.full_name || "Unnamed"} — ${p.roles.length ? p.roles.join(", ") : "no role yet"}` })),
    [profiles],
  );

  return (
    <DashShell title="Staff & Roles" subtitle="Manage teaching staff and portal access">
      <Tabs defaultValue="teachers">
        <TabsList>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          {admin && <TabsTrigger value="roles">Roles & Access</TabsTrigger>}
        </TabsList>
        <TabsContent value="teachers" className="mt-4">
          <CrudPage table="teachers" title="Teacher" fields={[
            { name: "staff_no", label: "Staff No" },
            { name: "id_no", label: "ID No" },
            { name: "full_name", label: "Full name", required: true },
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone" },
            { name: "qualification", label: "Qualification" },
            { name: "date_hired", label: "Date hired", type: "date" },
            { name: "profile_id", label: "Linked portal account", type: "select", options: profileOptions, hideInTable: true },
          ]} />
        </TabsContent>
        {admin && (
          <TabsContent value="roles" className="mt-4">
            <RolesPanel />
          </TabsContent>
        )}
      </Tabs>
    </DashShell>
  );
}

type RoleRow = { id: string; user_id: string; role: string };
type Row = { id: string; full_name: string; email: string | null; roles: RoleRow[] };

function RolesPanel() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async (): Promise<Row[]> => {
      const profiles = await api.list<{ id: string; full_name: string; email: string | null }>("profiles");
      const roles = await api.list<RoleRow>("user_roles");
      return profiles.map((p) => ({
        ...p,
        roles: roles.filter((r) => r.user_id === p.id),
      }));
    },
  });

  const addRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => api.create("user_roles", { user_id, role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users-with-roles"] }); toast.success("Role assigned"); },
    onError: (e: any) => toast.error(e.message),
  });
  const removeRole = useMutation({
    mutationFn: async (roleId: string) => api.remove("user_roles", roleId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users-with-roles"] }); toast.success("Role removed"); },
    onError: (e: any) => toast.error(e.message),
  });

  const [role, setRole] = useState<Record<string, string>>({});
  const [resetTarget, setResetTarget] = useState<Row | null>(null);

  return (
    <div className="rounded-2xl border bg-card shadow-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Assign role</TableHead>
            <TableHead className="text-right">Password</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? <TableRow><TableCell colSpan={5}>Loading…</TableCell></TableRow> :
            data.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length === 0 ? <span className="text-xs text-muted-foreground">none</span> :
                      u.roles.map((r) => (
                        <Badge key={r.id} variant="secondary" className="gap-1">
                          {r.role}
                          <button onClick={() => removeRole.mutate(r.id)}>
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
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" title="Reset password" onClick={() => setResetTarget(u)}>
                    <KeyRound className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <ResetPasswordDialog target={resetTarget} onClose={() => setResetTarget(null)} />
    </div>
  );
}

function ResetPasswordDialog({ target, onClose }: { target: Row | null; onClose: () => void }) {
  const [password, setPassword] = useState("");

  const reset = useMutation({
    mutationFn: async () => {
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      return api.admin.resetPassword(target!.id, password);
    },
    onSuccess: () => {
      toast.success(`Password reset for ${target?.full_name}`);
      setPassword("");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Reset password for {target?.full_name}</DialogTitle></DialogHeader>
        <div>
          <Label>New password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => reset.mutate()} disabled={!password || reset.isPending} className="bg-brand-gradient text-brand-foreground">
            Reset password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
