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
      <div className="rounded-2xl border bg-card p-4 mb-4 text-sm text-muted-foreground shadow-card">
        Enrolling a student automatically creates a portal login for their guardian — sign in with the
        <b> guardian phone number</b> and the student's <b>admission number</b> as the password.
      </div>
      <CrudPage table="students" title="Student" fields={[
        { name: "photo_url", label: "Photo", type: "image" },
        { name: "admission_no", label: "Admission No", required: true },
        { name: "full_name", label: "Full name", required: true },
        { name: "gender", label: "Gender", type: "select", options: [
          { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" },
        ]},
        { name: "date_of_birth", label: "Date of birth", type: "date" },
        { name: "class_id", label: "Class", type: "select", options: classes },
        { name: "guardian_name", label: "Guardian name" },
        { name: "guardian_phone", label: "Guardian phone", required: true },
        { name: "address", label: "Address", type: "textarea", hideInTable: true },
      ]} />
    </DashShell>
  );
}