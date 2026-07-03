import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { useLookup } from "@/lib/crud-helpers";

export const Route = createFileRoute("/_authenticated/dashboard/fees")({
  component: Page,
});
function Page() {
  const { data: classes = [] } = useLookup("classes", "name");
  const { data: terms = [] } = useLookup("terms", "name");
  return (
    <DashShell title="Fee Structures" subtitle="Set fees per class / term">
      <CrudPage table="fee_structures" title="Fee structure" fields={[
        { name: "name", label: "Name", required: true },
        { name: "class_id", label: "Class", type: "select", options: classes },
        { name: "term_id", label: "Term", type: "select", options: terms },
        { name: "amount", label: "Amount (UGX)", type: "number", required: true },
        { name: "description", label: "Description", type: "textarea", hideInTable: true },
      ]} />
    </DashShell>
  );
}