import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";

export const Route = createFileRoute("/_authenticated/dashboard/expenditures")({
  component: () => (
    <DashShell title="Expenditure" subtitle="Track school spending">
      <CrudPage table="expenditures" title="Expenditure" fields={[
        { name: "category", label: "Category", required: true },
        { name: "amount", label: "Amount", type: "number", required: true },
        { name: "spent_on", label: "Date", type: "date" },
        { name: "vendor", label: "Vendor" },
        { name: "description", label: "Description", type: "textarea", hideInTable: true },
      ]} />
    </DashShell>
  ),
});