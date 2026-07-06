import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { useLookup } from "@/lib/crud-helpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, isStaff as checkIsStaff } from "@/hooks/useRoles";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useLookupMap } from "@/hooks/useLookupMap";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard/marks")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles(user?.id);
  const staff = checkIsStaff(roles);
  const { data: terms = [] } = useLookup("terms", "name");
  const { data: students = [] } = useLookup("students", "full_name");
  const { data: exams = [] } = useLookup("exams", "name");
  const { data: subjects = [] } = useLookup("subjects", "name");

  return (
    <DashShell title="Marks & Reports" subtitle="Exams, results and performance reports">
      <Tabs defaultValue="results">
        <TabsList>
          {staff && <TabsTrigger value="exams">Exams</TabsTrigger>}
          <TabsTrigger value="results">Results</TabsTrigger>
          {staff && <TabsTrigger value="reports">Reports</TabsTrigger>}
        </TabsList>
        {staff && (
          <TabsContent value="exams" className="mt-4">
            <CrudPage table="exams" title="Exam" fields={[
              { name: "name", label: "Name", required: true },
              { name: "term_id", label: "Term", type: "select", options: terms },
              { name: "exam_date", label: "Date", type: "date" },
            ]} />
          </TabsContent>
        )}
        <TabsContent value="results" className="mt-4">
          <CrudPage table="results" title="Result" fields={[
            { name: "student_id", label: "Student", type: "select", options: students, required: true },
            { name: "exam_id", label: "Exam", type: "select", options: exams, required: true },
            { name: "subject_id", label: "Subject", type: "select", options: subjects, required: true },
            { name: "score", label: "Score", type: "number", required: true },
            { name: "max_score", label: "Out of", type: "number", defaultValue: 100 },
            { name: "grade", label: "Grade" },
            { name: "remark", label: "Remark" },
          ]} />
        </TabsContent>
        {staff && (
          <TabsContent value="reports" className="mt-4">
            <ReportsTab />
          </TabsContent>
        )}
      </Tabs>
    </DashShell>
  );
}

function ReportsTab() {
  const { data: results = [] } = useQuery({
    queryKey: ["results-report"],
    queryFn: async () => api.list<{ score: number; max_score: number; subject_id: string }>("results", { select: "score,max_score,subject_id" }),
  });
  const { map: subjectsById } = useLookupMap<{ name: string }>("subjects");

  const bySubject = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const r of results) {
      const name = subjectsById.get(r.subject_id)?.name ?? "Unknown";
      const pct = (Number(r.score) / Number(r.max_score || 100)) * 100;
      const entry = map.get(name) ?? { total: 0, count: 0 };
      entry.total += pct;
      entry.count += 1;
      map.set(name, entry);
    }
    return Array.from(map.entries()).map(([name, v]) => ({ name, average: Math.round(v.total / v.count) }));
  }, [results, subjectsById]);

  if (!bySubject.length) {
    return <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">No results recorded yet.</div>;
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="font-display font-semibold mb-4">Average score by subject (%)</div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={bySubject}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" />
          <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
          <Bar dataKey="average" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
