import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { useLookup } from "@/lib/crud-helpers";

export const Route = createFileRoute("/_authenticated/dashboard/exams")({
  component: Page,
});
function Page() {
  const { data: terms = [] } = useLookup("terms", "name");
  return (
    <DashShell title="Exams" subtitle="Assessments">
      <CrudPage table="exams" title="Exam" fields={[
        { name: "name", label: "Name", required: true },
        { name: "term_id", label: "Term", type: "select", options: terms },
        { name: "exam_date", label: "Date", type: "date" },
      ]} />
    </DashShell>
  );
}