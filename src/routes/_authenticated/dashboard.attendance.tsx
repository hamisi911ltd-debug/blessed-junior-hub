import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { CrudPage } from "@/components/dash/CrudPage";
import { useLookup } from "@/lib/crud-helpers";
import { useLookupMap } from "@/hooks/useLookupMap";
import { useBulkUpsert } from "@/hooks/useBulkUpsert";
import { RosterInputGrid } from "@/components/dash/RosterInputGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, isStaff as checkIsStaff, isParent as checkIsParent, isStudent as checkIsStudent } from "@/hooks/useRoles";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard/attendance")({
  component: Page,
});

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  present: "default", absent: "destructive", late: "secondary", excused: "outline",
};

function Page() {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles(user?.id);
  const staff = checkIsStaff(roles);
  const guardianOrLearner = checkIsParent(roles) || checkIsStudent(roles);

  // Roles load async, so the correct default tab isn't known on first paint. Tabs'
  // defaultValue is uncontrolled (set once at mount), so a naive `staff ? "take" : "mine"`
  // computed before roles resolve would lock in the wrong tab. Track it explicitly instead.
  const [tab, setTab] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (tab || (!staff && !guardianOrLearner)) return;
    setTab(staff ? "take" : "mine");
  }, [staff, guardianOrLearner, tab]);

  return (
    <DashShell title="Attendance" subtitle="Daily class attendance">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {staff && <TabsTrigger value="take">Take Attendance</TabsTrigger>}
          {staff && <TabsTrigger value="history">History</TabsTrigger>}
          {guardianOrLearner && <TabsTrigger value="mine">My Attendance</TabsTrigger>}
        </TabsList>
        {staff && (
          <TabsContent value="take" className="mt-4">
            <TakeAttendanceTab />
          </TabsContent>
        )}
        {staff && (
          <TabsContent value="history" className="mt-4">
            <HistoryTab />
          </TabsContent>
        )}
        {guardianOrLearner && (
          <TabsContent value="mine" className="mt-4">
            <MyAttendanceTab />
          </TabsContent>
        )}
      </Tabs>
    </DashShell>
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function TakeAttendanceTab() {
  const { user } = useAuth();
  const { data: classes = [] } = useLookup("classes", "name");
  const { data: myClasses = [] } = useQuery({
    queryKey: ["classes", "my-class-teacher", user?.id],
    enabled: !!user,
    queryFn: () => api.list<{ id: string }>("classes", { eq: { class_teacher_id: user!.id } }),
  });
  const { data: currentTerm } = useQuery({
    queryKey: ["terms", "current"],
    queryFn: async () => {
      const terms = await api.list<{ id: string; is_current: boolean }>("terms");
      return terms.find((t) => t.is_current) ?? null;
    },
  });

  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(todayIso());

  useEffect(() => {
    if (!classId && myClasses.length) setClassId(myClasses[0].id);
  }, [myClasses, classId]);

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["students", "by-class", classId],
    enabled: !!classId,
    queryFn: () => api.list<{ id: string; full_name: string; admission_no: string }>("students", { eq: { class_id: classId }, orderBy: "full_name", ascending: true }),
  });

  const { data: existing = [] } = useQuery({
    queryKey: ["attendance", "for-bulk", classId, date],
    enabled: !!classId && !!date,
    queryFn: () => api.list<{ id: string; student_id: string; status: string }>("attendance", { eq: { class_id: classId, date } }),
  });

  const existingByStudent = useMemo(() => new Map(existing.map((r) => [r.student_id, r])), [existing]);
  const initialValues = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, existingByStudent.get(s.id)?.status ?? "present"])),
    [students, existingByStudent],
  );

  const bulk = useBulkUpsert("attendance");

  const saveAll = (values: Record<string, any>) => {
    const ops = students.map((s) => ({
      existingId: existingByStudent.get(s.id)?.id,
      values: {
        student_id: s.id, class_id: classId, date, status: values[s.id] ?? "present",
        recorded_by: user?.id ?? null, term_id: currentTerm?.id ?? null,
      },
    }));
    if (!ops.length) return;
    bulk.mutate(ops);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4 shadow-card grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Class</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>{classes.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {!classId ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Pick a class and date to mark attendance for the whole class at once.
        </div>
      ) : (
        <RosterInputGrid
          students={students}
          isLoading={loadingStudents}
          initialValues={initialValues}
          valueLabel="Status"
          saving={bulk.isPending}
          onSaveAll={saveAll}
          renderCell={(value, onChange) => (
            <Select value={value ?? "present"} onValueChange={onChange}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          )}
        />
      )}
    </div>
  );
}

function HistoryTab() {
  const { data: students = [] } = useLookup("students", "full_name");
  const { data: classes = [] } = useLookup("classes", "name");
  const { map: studentsById } = useLookupMap<{ full_name: string }>("students");
  const { map: classesById } = useLookupMap<{ name: string }>("classes");
  return (
    <CrudPage table="attendance" title="Attendance record" orderBy="date" fields={[
      {
        name: "student_id", label: "Student", type: "select", options: students, required: true,
        format: (v) => (v ? studentsById.get(v)?.full_name ?? "—" : "—"),
      },
      {
        name: "class_id", label: "Class", type: "select", options: classes, required: true,
        format: (v) => (v ? classesById.get(v)?.name ?? "—" : "—"),
      },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, defaultValue: "present" },
    ]} />
  );
}

function MyAttendanceTab() {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles(user?.id);
  const parent = checkIsParent(roles);
  const { map: classesById } = useLookupMap<{ name: string }>("classes");

  const { data: children = [] } = useQuery({
    queryKey: ["my-attendance-children", user?.id, parent],
    enabled: !!user,
    queryFn: async () => {
      if (parent) {
        const links = await api.list<{ student_id: string }>("parent_students", { eq: { parent_id: user!.id }, select: "student_id" });
        const ids = links.map((l) => l.student_id);
        if (!ids.length) return [];
        return api.list<{ id: string; full_name: string; class_id: string; admission_no: string }>("students", { in: { id: ids } });
      }
      return api.list<{ id: string; full_name: string; class_id: string; admission_no: string }>("students", { eq: { profile_id: user!.id } });
    },
  });

  if (!children.length) {
    return <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">No linked student records found.</div>;
  }

  return (
    <div className="grid gap-4">
      {children.map((c) => (
        <ChildAttendanceCard key={c.id} student={c} className={classesById.get(c.class_id)?.name} />
      ))}
    </div>
  );
}

function ChildAttendanceCard({ student, className }: { student: { id: string; full_name: string; admission_no: string }; className?: string }) {
  const { data: rows = [] } = useQuery({
    queryKey: ["child-attendance", student.id],
    queryFn: () => api.list<{ id: string; date: string; status: string }>("attendance", { eq: { student_id: student.id }, orderBy: "date", ascending: false }),
  });

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{student.full_name}</span>
          {className && <Badge variant="secondary">{className}</Badge>}
        </CardTitle>
        <div className="text-sm text-muted-foreground">Admission No: {student.admission_no}</div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">No attendance recorded yet.</p> : (
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
