import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { useLookup } from "@/lib/crud-helpers";

export const Route = createFileRoute("/_authenticated/dashboard/payments")({
  component: Page,
});
function Page() {
  const { data: students = [] } = useLookup("students", "full_name");
  const { data: invoices = [] } = useLookup("invoices", "id");
  return (
    <DashShell title="Payments" subtitle="Record fee payments">
      <CrudPage table="payments" title="Payment" fields={[
        { name: "student_id", label: "Student", type: "select", options: students, required: true },
        { name: "invoice_id", label: "Invoice", type: "select", options: invoices },
        { name: "amount", label: "Amount", type: "number", required: true },
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
    </DashShell>
  );
}