import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { useLookup } from "@/lib/crud-helpers";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/invoices")({
  component: Page,
});
function Page() {
  const { data: students = [] } = useLookup("students", "full_name");
  const { data: fees = [] } = useLookup("fee_structures", "name");
  const { data: terms = [] } = useLookup("terms", "name");
  return (
    <DashShell title="Invoices" subtitle="Fee invoices per student">
      <CrudPage table="invoices" title="Invoice" fields={[
        { name: "student_id", label: "Student", type: "select", options: students, required: true },
        { name: "fee_structure_id", label: "Fee structure", type: "select", options: fees },
        { name: "term_id", label: "Term", type: "select", options: terms },
        { name: "amount", label: "Amount", type: "number", required: true },
        { name: "due_date", label: "Due date", type: "date" },
        { name: "status", label: "Status", type: "select", options: [
          { value: "unpaid", label: "Unpaid" },
          { value: "partial", label: "Partial" },
          { value: "paid", label: "Paid" },
          { value: "overdue", label: "Overdue" },
          { value: "cancelled", label: "Cancelled" },
        ], format: (v) => <Badge variant={v === "paid" ? "default" : v === "unpaid" ? "secondary" : "outline"}>{v}</Badge> },
        { name: "notes", label: "Notes", type: "textarea", hideInTable: true },
      ]} />
    </DashShell>
  );
}