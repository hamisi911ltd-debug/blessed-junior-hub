import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";

export const Route = createFileRoute("/_authenticated/dashboard/subjects")({
  component: () => (
    <DashShell title="Subjects" subtitle="Manage subjects taught">
      <CrudPage table="subjects" title="Subject" fields={[
        { name: "name", label: "Subject name", required: true },
        { name: "code", label: "Code" },
        { name: "description", label: "Description", type: "textarea", hideInTable: true },
      ]} />
    </DashShell>
  ),
});