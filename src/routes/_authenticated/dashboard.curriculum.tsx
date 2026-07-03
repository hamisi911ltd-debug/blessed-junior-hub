import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { useLookup } from "@/lib/crud-helpers";

export const Route = createFileRoute("/_authenticated/dashboard/curriculum")({
  component: Page,
});
function Page() {
  const { data: subjects = [] } = useLookup("subjects", "name");
  const { data: classes = [] } = useLookup("classes", "name");
  const { data: terms = [] } = useLookup("terms", "name");
  return (
    <DashShell title="Curriculum" subtitle="Topics per subject / class / term">
      <CrudPage table="curriculum_items" title="Curriculum item" fields={[
        { name: "topic", label: "Topic", required: true },
        { name: "subject_id", label: "Subject", type: "select", options: subjects, required: true },
        { name: "class_id", label: "Class", type: "select", options: classes },
        { name: "term_id", label: "Term", type: "select", options: terms },
        { name: "week_no", label: "Week #", type: "number" },
        { name: "description", label: "Description", type: "textarea", hideInTable: true },
      ]} />
    </DashShell>
  );
}