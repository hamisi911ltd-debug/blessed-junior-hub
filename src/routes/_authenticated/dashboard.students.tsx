import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { useLookup } from "@/lib/crud-helpers";

export const Route = createFileRoute("/_authenticated/dashboard/students")({
  component: Page,
});

function Page() {
  const { data: classes = [] } = useLookup("classes", "name");
  return (
    <DashShell title="Students" subtitle="Enrollment records">
      <CrudPage table="students" title="Student" fields={[
        { name: "admission_no", label: "Admission No", required: true },
        { name: "full_name", label: "Full name", required: true },
        { name: "gender", label: "Gender", type: "select", options: [
          { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" },
        ]},
        { name: "date_of_birth", label: "Date of birth", type: "date" },
        { name: "class_id", label: "Class", type: "select", options: classes },
        { name: "guardian_name", label: "Guardian name" },
        { name: "guardian_phone", label: "Guardian phone" },
        { name: "address", label: "Address", type: "textarea", hideInTable: true },
      ]} />
    </DashShell>
  );
}