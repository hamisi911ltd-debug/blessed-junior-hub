import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { useAuth } from "@/hooks/useAuth";
import { useLookupMap } from "@/hooks/useLookupMap";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/my-children")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { map: classesById } = useLookupMap<{ name: string }>("classes");
  const { data: children = [] } = useQuery({
    queryKey: ["my-children", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const links = await api.list<{ student_id: string }>("parent_students", { eq: { parent_id: user!.id }, select: "student_id" });
      const ids = links.map((l) => l.student_id);
      if (!ids.length) return [];
      return api.list<any>("students", { in: { id: ids } });
    },
  });

  return (
    <DashShell title="My Children" subtitle="View your children's records">
      {children.length === 0 && (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          No children linked to your account yet. Please contact the school administrator to link your child.
        </div>
      )}
      <div className="grid gap-4">
        {children.map((c: any) => (
          <ChildCard key={c.id} student={c} className={classesById.get(c.class_id)?.name} />
        ))}
      </div>
    </DashShell>
  );
}

function ChildCard({ student, className }: { student: any; className?: string }) {
  const { data: payments = [] } = useQuery({
    queryKey: ["child-payments", student.id],
    queryFn: async () => api.list<any>("payments", { eq: { student_id: student.id }, orderBy: "created_at", ascending: false }),
  });
  const { data: results = [] } = useQuery({
    queryKey: ["child-results", student.id],
    queryFn: async () => api.list<any>("results", { eq: { student_id: student.id } }),
  });
  const { map: subjectsById } = useLookupMap<{ name: string }>("subjects");
  const { map: examsById } = useLookupMap<{ name: string }>("exams");
  const { map: termsById } = useLookupMap<{ name: string }>("terms");

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{student.full_name}</span>
          <Badge variant="secondary">{className ?? "No class"}</Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">Admission No: {student.admission_no}</div>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="font-semibold mb-2">Recent payments</h3>
          {payments.length === 0 ? <p className="text-sm text-muted-foreground">No payments recorded yet.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Amount</TableHead><TableHead>Term</TableHead><TableHead>Date paid</TableHead><TableHead>Method</TableHead></TableRow></TableHeader>
              <TableBody>
                {payments.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>KES {Number(p.amount).toLocaleString()}</TableCell>
                    <TableCell>{termsById.get(p.term_id)?.name ?? "—"}</TableCell>
                    <TableCell>{p.paid_at?.slice(0, 10) ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline">{p.method}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
        <section>
          <h3 className="font-semibold mb-2">Results</h3>
          {results.length === 0 ? <p className="text-sm text-muted-foreground">No results yet.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Exam</TableHead><TableHead>Subject</TableHead><TableHead>Score</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
              <TableBody>
                {results.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{examsById.get(r.exam_id)?.name}</TableCell>
                    <TableCell>{subjectsById.get(r.subject_id)?.name}</TableCell>
                    <TableCell>{r.score} / {r.max_score}</TableCell>
                    <TableCell>{r.grade ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
