import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/dashboard/classes")({
  component: Page,
});

function Page() {
  return (
    <DashShell title="Classes & Subjects" subtitle="Manage classes and subjects">
      <Tabs defaultValue="classes">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>
        <TabsContent value="classes" className="mt-4">
          <CrudPage table="classes" title="Class" fields={[
            { name: "name", label: "Class name", required: true },
            { name: "level", label: "Level (e.g. P1, P7, Baby)" },
          ]} />
        </TabsContent>
        <TabsContent value="subjects" className="mt-4">
          <CrudPage table="subjects" title="Subject" fields={[
            { name: "name", label: "Subject name", required: true },
            { name: "code", label: "Code" },
            { name: "description", label: "Description", type: "textarea", hideInTable: true },
          ]} />
        </TabsContent>
      </Tabs>
    </DashShell>
  );
}
