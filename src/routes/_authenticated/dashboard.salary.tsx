import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, isAdmin as checkIsAdmin, isBursar as checkIsBursar, isTeacher as checkIsTeacher } from "@/hooks/useRoles";
import { useProfilesWithRoles } from "@/hooks/useProfilesWithRoles";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard/salary")({
  component: Page,
});

const METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "card", label: "Card" },
  { value: "online", label: "Online" },
  { value: "other", label: "Other" },
];

function Page() {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles(user?.id);
  const admin = checkIsAdmin(roles);
  const finance = admin || checkIsBursar(roles);
  const teacherOnly = checkIsTeacher(roles) && !finance;

  const { data: profiles = [] } = useProfilesWithRoles();
  const staffOptions = useMemo(
    () => profiles
      .filter((p) => p.roles.some((r) => ["admin", "bursar", "teacher"].includes(r)))
      .map((p) => ({ value: p.id, label: `${p.full_name || "Unnamed"} (${p.roles.join(", ")})` }),
    ), [profiles]);
  const staffNameById = useMemo(() => new Map(profiles.map((p) => [p.id, p.full_name])), [profiles]);

  // Roles load async; see the same fix in dashboard.attendance.tsx for why this can't be a
  // plain `defaultValue={finance ? "structures" : "mine"}` on an uncontrolled Tabs.
  const [tab, setTab] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (tab || (!finance && !teacherOnly)) return;
    setTab(finance ? "structures" : "mine");
  }, [finance, teacherOnly, tab]);

  return (
    <DashShell title="Salary" subtitle="Staff salary structures and payment history">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {finance && <TabsTrigger value="structures">Structures</TabsTrigger>}
          {finance && <TabsTrigger value="payments">Payments</TabsTrigger>}
          {teacherOnly && <TabsTrigger value="mine">My Payments</TabsTrigger>}
        </TabsList>
        {finance && (
          <TabsContent value="structures" className="mt-4">
            <CrudPage table="salary_structures" title="Salary structure" canWrite={admin} fields={[
              {
                name: "staff_id", label: "Staff", type: "select", options: staffOptions, required: true,
                format: (v) => (v ? staffNameById.get(v) ?? "—" : "—"),
              },
              { name: "name", label: "Name (e.g. Basic Salary)", required: true },
              { name: "amount", label: "Amount (KES)", type: "number", required: true },
              { name: "description", label: "Description", type: "textarea", hideInTable: true },
            ]} />
          </TabsContent>
        )}
        {finance && (
          <TabsContent value="payments" className="mt-4">
            <CrudPage table="salary_payments" title="Salary payment" fields={[
              {
                name: "staff_id", label: "Staff", type: "select", options: staffOptions, required: true,
                format: (v) => (v ? staffNameById.get(v) ?? "—" : "—"),
              },
              { name: "month", label: "Month (e.g. 2026-07)", required: true },
              { name: "amount", label: "Amount (KES)", type: "number", required: true },
              { name: "paid_at", label: "Date paid", type: "date", defaultValue: new Date().toISOString().slice(0, 10) },
              { name: "method", label: "Method", type: "select", options: METHOD_OPTIONS, defaultValue: "cash" },
              { name: "reference", label: "Reference" },
              { name: "notes", label: "Notes", type: "textarea", hideInTable: true },
            ]} />
          </TabsContent>
        )}
        {teacherOnly && (
          <TabsContent value="mine" className="mt-4">
            <CrudPage table="salary_payments" title="Salary payment" canWrite={false} fields={[
              { name: "month", label: "Month", required: true },
              { name: "amount", label: "Amount (KES)", type: "number", required: true },
              { name: "paid_at", label: "Date paid", type: "date" },
              { name: "method", label: "Method", type: "select", options: METHOD_OPTIONS },
              { name: "reference", label: "Reference" },
            ]} />
          </TabsContent>
        )}
      </Tabs>
    </DashShell>
  );
}
