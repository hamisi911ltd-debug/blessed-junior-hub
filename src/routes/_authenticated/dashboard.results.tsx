import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { useLookup } from "@/lib/crud-helpers";

export const Route = createFileRoute("/_authenticated/dashboard/results")({
  component: Page,
});
function Page() {
  const { data: students = [] } = useLookup("students", "full_name");
  const { data: exams = [] } = useLookup("exams", "name");
  const { data: subjects = [] } = useLookup("subjects", "name");
  return (
    <DashShell title="Results" subtitle="Score entry and student results">
      <CrudPage table="results" title="Result" fields={[
        { name: "student_id", label: "Student", type: "select", options: students, required: true },
        { name: "exam_id", label: "Exam", type: "select", options: exams, required: true },
        { name: "subject_id", label: "Subject", type: "select", options: subjects, required: true },
        { name: "score", label: "Score", type: "number", required: true },
        { name: "max_score", label: "Out of", type: "number", defaultValue: 100 },
        { name: "grade", label: "Grade" },
        { name: "remark", label: "Remark" },
      ]} />
    </DashShell>
  );
}