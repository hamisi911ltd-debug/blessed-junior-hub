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
import { useBulkUpsert } from "@/hooks/useBulkUpsert";
import { RosterInputGrid } from "@/components/dash/RosterInputGrid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
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
  const { map: termsById } = useLookupMap<{ name: string }>("terms");
  const { map: studentsById } = useLookupMap<{ full_name: string }>("students");
  const { map: examsById } = useLookupMap<{ name: string }>("exams");
  const { map: subjectsById } = useLookupMap<{ name: string }>("subjects");

  return (
    <DashShell title="Marks & Reports" subtitle="Exams, results and performance reports">
      <Tabs defaultValue="results">
        <TabsList>
          {staff && <TabsTrigger value="exams">Exams</TabsTrigger>}
          <TabsTrigger value="results">Results</TabsTrigger>
          {staff && <TabsTrigger value="bulk">Bulk Entry</TabsTrigger>}
          {staff && <TabsTrigger value="reports">Reports</TabsTrigger>}
        </TabsList>
        {staff && (
          <TabsContent value="exams" className="mt-4">
            <CrudPage table="exams" title="Exam" fields={[
              { name: "name", label: "Name", required: true },
              {
                name: "term_id", label: "Term", type: "select", options: terms,
                format: (v) => (v ? termsById.get(v)?.name ?? "—" : "—"),
              },
              { name: "exam_date", label: "Date", type: "date" },
            ]} />
          </TabsContent>
        )}
        <TabsContent value="results" className="mt-4">
          <CrudPage table="results" title="Result" fields={[
            {
              name: "student_id", label: "Student", type: "select", options: students, required: true,
              format: (v) => (v ? studentsById.get(v)?.full_name ?? "—" : "—"),
            },
            {
              name: "exam_id", label: "Exam", type: "select", options: exams, required: true,
              format: (v) => (v ? examsById.get(v)?.name ?? "—" : "—"),
            },
            {
              name: "subject_id", label: "Subject", type: "select", options: subjects, required: true,
              format: (v) => (v ? subjectsById.get(v)?.name ?? "—" : "—"),
            },
            { name: "score", label: "Score", type: "number", required: true },
            { name: "max_score", label: "Out of", type: "number", defaultValue: 100 },
            { name: "grade", label: "Grade" },
            { name: "remark", label: "Remark" },
          ]} />
        </TabsContent>
        {staff && (
          <TabsContent value="bulk" className="mt-4">
            <BulkResultsTab />
          </TabsContent>
        )}
        {staff && (
          <TabsContent value="reports" className="mt-4">
            <ReportsTab />
          </TabsContent>
        )}
      </Tabs>
    </DashShell>
  );
}

function BulkResultsTab() {
  const { user } = useAuth();
  const { data: terms = [] } = useLookup("terms", "name");
  const { data: allExams = [] } = useQuery({
    queryKey: ["exams", "all-with-term"],
    queryFn: () => api.list<{ id: string; name: string; term_id: string | null }>("exams", { orderBy: "name", ascending: true }),
  });
  const { data: subjects = [] } = useLookup("subjects", "name");
  const { data: classes = [] } = useLookup("classes", "name");
  const [termId, setTermId] = useState("");
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");
  const [outOf, setOutOf] = useState("100");

  const examsForTerm = useMemo(
    () => allExams.filter((e) => e.term_id === termId).map((e) => ({ value: e.id, label: e.name })),
    [allExams, termId],
  );
  // Picking a different term invalidates whichever exam was selected for the old one.
  useEffect(() => {
    if (examId && !examsForTerm.some((e) => e.value === examId)) setExamId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termId]);

  const ready = !!(examId && subjectId && classId);

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["students", "by-class", classId],
    enabled: !!classId,
    queryFn: () => api.list<{ id: string; full_name: string; admission_no: string }>("students", { eq: { class_id: classId }, orderBy: "full_name", ascending: true }),
  });

  const { data: existingResults = [] } = useQuery({
    queryKey: ["results", "for-bulk", examId, subjectId],
    enabled: !!examId && !!subjectId,
    queryFn: () => api.list<{ id: string; student_id: string; score: number; max_score: number }>("results", { eq: { exam_id: examId, subject_id: subjectId } }),
  });

  const existingByStudent = useMemo(() => new Map(existingResults.map((r) => [r.student_id, r])), [existingResults]);
  const initialValues = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, existingByStudent.get(s.id)?.score?.toString() ?? ""])),
    [students, existingByStudent],
  );

  const bulk = useBulkUpsert("results");

  const saveAll = (values: Record<string, any>) => {
    const ops = students
      .filter((s) => values[s.id] !== "" && values[s.id] !== undefined && values[s.id] !== null)
      .map((s) => ({
        existingId: existingByStudent.get(s.id)?.id,
        values: {
          student_id: s.id, exam_id: examId, subject_id: subjectId,
          score: Number(values[s.id]), max_score: Number(outOf) || 100,
          recorded_by: user?.id ?? null,
        },
      }));
    if (!ops.length) return;
    bulk.mutate(ops);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4 shadow-card grid gap-3 sm:grid-cols-5">
        <div>
          <Label>Term</Label>
          <Select value={termId} onValueChange={setTermId}>
            <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
            <SelectContent>{terms.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Exam</Label>
          <Select value={examId} onValueChange={setExamId} disabled={!termId}>
            <SelectTrigger><SelectValue placeholder={termId ? "Select exam" : "Pick a term first"} /></SelectTrigger>
            <SelectContent>
              {examsForTerm.length === 0 && <div className="px-2 py-1.5 text-sm text-muted-foreground">No exams for this term yet</div>}
              {examsForTerm.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Subject</Label>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
            <SelectContent>{subjects.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Class</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>{classes.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Out of</Label>
          <Input type="number" value={outOf} onChange={(e) => setOutOf(e.target.value)} />
        </div>
      </div>

      {!ready ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Pick an exam, subject and class to enter scores for the whole class at once.
        </div>
      ) : (
        <RosterInputGrid
          students={students}
          isLoading={loadingStudents}
          initialValues={initialValues}
          valueLabel={`Score (out of ${outOf || 100})`}
          saving={bulk.isPending}
          onSaveAll={saveAll}
          renderCell={(value, onChange) => (
            <Input type="number" className="w-28" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
          )}
        />
      )}
    </div>
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
