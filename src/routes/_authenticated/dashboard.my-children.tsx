import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/my-children")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data: children = [] } = useQuery({
    queryKey: ["my-children", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: links } = await supabase.from("parent_students").select("student_id").eq("parent_id", user!.id);
      const ids = (links ?? []).map((l: any) => l.student_id);
      if (!ids.length) return [];
      const { data } = await supabase.from("students").select("*, classes(name)").in("id", ids);
      return data ?? [];
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
        {children.map((c: any) => <ChildCard key={c.id} student={c} />)}
      </div>
    </DashShell>
  );
}

function ChildCard({ student }: { student: any }) {
  const { data: invoices = [] } = useQuery({
    queryKey: ["child-invoices", student.id],
    queryFn: async () => {
      const { data } = await supabase.from("invoices").select("*").eq("student_id", student.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: results = [] } = useQuery({
    queryKey: ["child-results", student.id],
    queryFn: async () => {
      const { data } = await supabase.from("results").select("*, subjects(name), exams(name)").eq("student_id", student.id);
      return data ?? [];
    },
  });

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{student.full_name}</span>
          <Badge variant="secondary">{student.classes?.name ?? "No class"}</Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">Admission No: {student.admission_no}</div>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="font-semibold mb-2">Recent invoices</h3>
          {invoices.length === 0 ? <p className="text-sm text-muted-foreground">No invoices yet.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Amount</TableHead><TableHead>Paid</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {invoices.map((i: any) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.amount}</TableCell>
                    <TableCell>{i.amount_paid}</TableCell>
                    <TableCell>{i.due_date ?? "—"}</TableCell>
                    <TableCell><Badge variant={i.status === "paid" ? "default" : "outline"}>{i.status}</Badge></TableCell>
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
                    <TableCell>{r.exams?.name}</TableCell>
                    <TableCell>{r.subjects?.name}</TableCell>
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