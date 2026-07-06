import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { useLookup } from "@/lib/crud-helpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, isAdmin as checkIsAdmin, isBursar as checkIsBursar } from "@/hooks/useRoles";

export const Route = createFileRoute("/_authenticated/dashboard/payments")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles(user?.id);
  const canSeeExpenditure = checkIsAdmin(roles) || checkIsBursar(roles);
  const { data: students = [] } = useLookup("students", "full_name");
  const { data: terms = [] } = useLookup("terms", "name");

  return (
    <DashShell title="Payments" subtitle="Record fee payments and school expenditure">
      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          {canSeeExpenditure && <TabsTrigger value="expenditure">Expenditure</TabsTrigger>}
        </TabsList>
        <TabsContent value="payments" className="mt-4">
          <CrudPage table="payments" title="Payment" fields={[
            { name: "student_id", label: "Student", type: "select", options: students, required: true },
            { name: "term_id", label: "Term paid for", type: "select", options: terms, required: true },
            { name: "amount", label: "Amount (KES)", type: "number", required: true },
            { name: "paid_at", label: "Date paid", type: "date", defaultValue: new Date().toISOString().slice(0, 10) },
            { name: "method", label: "Method", type: "select", options: [
              { value: "cash", label: "Cash" },
              { value: "bank", label: "Bank" },
              { value: "mobile_money", label: "Mobile Money" },
              { value: "card", label: "Card" },
              { value: "online", label: "Online" },
              { value: "other", label: "Other" },
            ], defaultValue: "cash" },
            { name: "reference", label: "Reference" },
            { name: "notes", label: "Notes", type: "textarea", hideInTable: true },
          ]} />
        </TabsContent>
        {canSeeExpenditure && (
          <TabsContent value="expenditure" className="mt-4">
            <CrudPage table="expenditures" title="Expenditure" fields={[
              { name: "category", label: "Category", required: true },
              { name: "amount", label: "Amount", type: "number", required: true },
              { name: "spent_on", label: "Date", type: "date" },
              { name: "vendor", label: "Vendor" },
              { name: "description", label: "Description", type: "textarea", hideInTable: true },
            ]} />
          </TabsContent>
        )}
      </Tabs>
    </DashShell>
  );
}
