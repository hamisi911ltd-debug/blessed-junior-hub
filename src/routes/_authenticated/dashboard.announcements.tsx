import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";

export const Route = createFileRoute("/_authenticated/dashboard/announcements")({
  component: () => (
    <DashShell title="Announcements" subtitle="Share news with the community">
      <CrudPage table="announcements" title="Announcement" fields={[
        { name: "title", label: "Title", required: true },
        { name: "body", label: "Message", type: "textarea", required: true },
        { name: "audience", label: "Audience", type: "select", options: [
          { value: "all", label: "Everyone" },
          { value: "parents", label: "Parents" },
          { value: "teachers", label: "Teachers" },
          { value: "students", label: "Students" },
        ], defaultValue: "all" },
      ]} />
    </DashShell>
  ),
});