import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";

export const Route = createFileRoute("/_authenticated/dashboard/terms")({
  component: () => (
    <DashShell title="Academic Terms" subtitle="School terms and years">
      <CrudPage table="terms" title="Term" fields={[
        { name: "name", label: "Name (e.g. Term 1)", required: true },
        { name: "year", label: "Year", type: "number", required: true },
        { name: "start_date", label: "Start date", type: "date" },
        { name: "end_date", label: "End date", type: "date" },
      ]} />
    </DashShell>
  ),
});