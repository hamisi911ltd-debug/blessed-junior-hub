import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, isAdmin as checkIsAdmin, isBursar as checkIsBursar } from "@/hooks/useRoles";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useLookup } from "@/lib/crud-helpers";
import { useLookupMap } from "@/hooks/useLookupMap";
import { resizeImageToDataUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles(user?.id);
  const admin = checkIsAdmin(roles);
  const finance = admin || checkIsBursar(roles);

  // Roles load async; a plain `defaultValue={admin ? "school" : "fees"}` computed before
  // roles resolve can lock Tabs (uncontrolled) onto a tab whose trigger never renders for
  // this user (e.g. a pure admin momentarily reads as neither admin nor finance).
  const [tab, setTab] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (tab) return;
    if (admin) setTab("school");
    else if (finance) setTab("fees");
  }, [admin, finance, tab]);

  return (
    <DashShell title="Settings" subtitle="School details, fees, academic terms, exams and your account">
      <Tabs value={tab ?? "profile"} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          {admin && <TabsTrigger value="school">School Details</TabsTrigger>}
          {finance && <TabsTrigger value="fees">Fee Structures</TabsTrigger>}
          {admin && <TabsTrigger value="terms">Academic Terms</TabsTrigger>}
          {admin && <TabsTrigger value="exams">Exams</TabsTrigger>}
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        {admin && (
          <TabsContent value="school" className="mt-4">
            <SchoolTab />
          </TabsContent>
        )}
        {finance && (
          <TabsContent value="fees" className="mt-4">
            <FeesTab />
          </TabsContent>
        )}
        {admin && (
          <TabsContent value="terms" className="mt-4">
            <CrudPage table="terms" title="Term" fields={[
              { name: "name", label: "Name (e.g. Term 1)", required: true },
              { name: "year", label: "Year", type: "number", required: true },
              { name: "start_date", label: "Start date", type: "date" },
              { name: "end_date", label: "End date", type: "date" },
            ]} />
          </TabsContent>
        )}
        {admin && (
          <TabsContent value="exams" className="mt-4">
            <ExamsTab />
          </TabsContent>
        )}
        <TabsContent value="profile" className="mt-4">
          <ProfileTab />
        </TabsContent>
      </Tabs>
    </DashShell>
  );
}

function ExamsTab() {
  const { data: terms = [] } = useLookup("terms", "name");
  const { map: termsById } = useLookupMap<{ name: string }>("terms");
  return (
    <CrudPage table="exams" title="Exam" fields={[
      { name: "name", label: "Name", required: true },
      {
        name: "term_id", label: "Term", type: "select", options: terms,
        format: (v) => (v ? termsById.get(v)?.name ?? "—" : "—"),
      },
      { name: "exam_date", label: "Date", type: "date" },
    ]} />
  );
}

function FeesTab() {
  const { data: classes = [] } = useLookup("classes", "name");
  const { data: terms = [] } = useLookup("terms", "name");
  return (
    <CrudPage table="fee_structures" title="Fee structure" fields={[
      { name: "name", label: "Name", required: true },
      { name: "class_id", label: "Class", type: "select", options: classes },
      { name: "term_id", label: "Term", type: "select", options: terms },
      { name: "amount", label: "Amount (KES)", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", hideInTable: true },
    ]} />
  );
}

type SchoolSettings = { id: string; name: string; motto: string | null; address: string | null; phone: string | null; email: string | null; logo_url: string | null };

function SchoolTab() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["school_settings", "default"],
    queryFn: async () => api.getOne<SchoolSettings>("school_settings", "default"),
  });
  const [form, setForm] = useState<Partial<SchoolSettings>>({});

  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = useMutation({
    mutationFn: async () => api.update("school_settings", "default", form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["school_settings"] }); toast.success("School details updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const onLogoPick = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file, 320);
      setForm((f) => ({ ...f, logo_url: dataUrl }));
    } catch {
      toast.error("Could not process that image");
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card max-w-xl space-y-4">
      <div className="flex items-center gap-4">
        {form.logo_url ? (
          <img src={form.logo_url} alt="" className="h-16 w-16 rounded-xl object-cover border" />
        ) : (
          <div className="h-16 w-16 rounded-xl border bg-secondary" />
        )}
        <div className="flex-1">
          <Label>School logo</Label>
          <Input type="file" accept="image/*" onChange={(e) => onLogoPick(e.target.files?.[0])} />
        </div>
      </div>
      <div>
        <Label>School name</Label>
        <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <Label>Motto</Label>
        <Input value={form.motto ?? ""} onChange={(e) => setForm({ ...form, motto: e.target.value })} />
      </div>
      <div>
        <Label>Address</Label>
        <Textarea value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Phone</Label>
          <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>
      <Button onClick={() => save.mutate()} className="bg-brand-gradient text-brand-foreground">Save changes</Button>
    </div>
  );
}

function ProfileTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => api.getOne<{ full_name: string; phone: string | null }>("profiles", user!.id),
  });
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => api.update("profiles", user!.id, { full_name: fullName, phone }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({ queryKey: ["auth-me"] });
      toast.success("Profile updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-md">
      <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
        <div>
          <Label>Login ID</Label>
          <Input value={user?.email ?? user?.phone ?? user?.username ?? ""} disabled />
        </div>
        <div>
          <Label>Full name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Button onClick={() => save.mutate()} className="bg-brand-gradient text-brand-foreground">Save changes</Button>
      </div>
      <ChangePasswordCard />
    </div>
  );
}

function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const change = useMutation({
    mutationFn: async () => {
      if (next.length < 6) throw new Error("New password must be at least 6 characters");
      if (next !== confirm) throw new Error("New passwords don't match");
      return api.auth.changePassword(current, next);
    },
    onSuccess: () => {
      toast.success("Password updated");
      setCurrent(""); setNext(""); setConfirm("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
      <div className="font-display font-semibold">Change password</div>
      <div>
        <Label>Current password</Label>
        <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div>
        <Label>New password</Label>
        <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
      </div>
      <div>
        <Label>Confirm new password</Label>
        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <Button onClick={() => change.mutate()} disabled={!current || !next || change.isPending} className="bg-brand-gradient text-brand-foreground">
        Update password
      </Button>
    </div>
  );
}
