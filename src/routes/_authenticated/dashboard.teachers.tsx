import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";

export const Route = createFileRoute("/_authenticated/dashboard/teachers")({
  component: () => (
    <DashShell title="Teachers" subtitle="Staff records">
      <CrudPage table="teachers" title="Teacher" fields={[
        { name: "staff_no", label: "Staff No" },
        { name: "full_name", label: "Full name", required: true },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        { name: "qualification", label: "Qualification" },
        { name: "date_hired", label: "Date hired", type: "date" },
      ]} />
    </DashShell>
  ),
});