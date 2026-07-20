import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfilesWithRoles } from "@/hooks/useProfilesWithRoles";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, isAdmin as checkIsAdmin } from "@/hooks/useRoles";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/dashboard/classes")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles(user?.id);
  const admin = checkIsAdmin(roles);
  const { data: profiles = [] } = useProfilesWithRoles();
  const teacherOptions = useMemo(
    () => profiles.filter((p) => p.roles.includes("teacher")).map((p) => ({ value: p.id, label: p.full_name || "Unnamed" })),
    [profiles],
  );
  const teacherNameById = useMemo(() => new Map(profiles.map((p) => [p.id, p.full_name])), [profiles]);

  return (
    <DashShell title="Classes & Subjects" subtitle="Manage classes and subjects">
      <Tabs defaultValue="classes">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>
        <TabsContent value="classes" className="mt-4">
          <CrudPage table="classes" title="Class" canWrite={admin} fields={[
            { name: "name", label: "Class name", required: true },
            { name: "level", label: "Level (e.g. P1, P7, Baby)" },
            { name: "stream", label: "Stream (e.g. East, West)" },
            {
              name: "class_teacher_id", label: "Class teacher", type: "select", options: teacherOptions,
              format: (v) => (v ? teacherNameById.get(v) ?? "—" : "—"),
            },
            { name: "capacity", label: "Capacity", type: "number" },
            { name: "room", label: "Room" },
            { name: "description", label: "Description", type: "textarea", hideInTable: true },
          ]} />
        </TabsContent>
        <TabsContent value="subjects" className="mt-4">
          <CrudPage table="subjects" title="Subject" canWrite={admin} fields={[
            { name: "name", label: "Subject name", required: true },
            { name: "code", label: "Code" },
            { name: "description", label: "Description", type: "textarea", hideInTable: true },
          ]} />
        </TabsContent>
      </Tabs>
    </DashShell>
  );
}
