import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";

export const Route = createFileRoute("/_authenticated/dashboard/classes")({
  component: () => (
    <DashShell title="Classes" subtitle="Manage the classes in the school">
      <CrudPage table="classes" title="Class" fields={[
        { name: "name", label: "Class name", required: true },
        { name: "level", label: "Level (e.g. P1, P7, Baby)" },
      ]} />
    </DashShell>
  ),
});