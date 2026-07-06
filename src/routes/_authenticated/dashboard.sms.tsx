import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/sms")({
  component: Page,
});

const AUDIENCE_OPTIONS = [
  { value: "all", label: "Everyone" },
  { value: "teachers", label: "Teachers" },
  { value: "students", label: "Specific students" },
];

type Announcement = { id: string; title: string; body: string; audience: string; created_at: string };
type Student = { id: string; full_name: string; admission_no: string };

function Page() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const { data: students = [] } = useQuery({
    queryKey: ["students-list-mini"],
    queryFn: async () => api.list<Student>("students", { orderBy: "full_name", ascending: true }),
  });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements-list"],
    queryFn: async () => api.list<Announcement>("announcements", { orderBy: "created_at", ascending: false }),
  });
  const { data: recipients = [] } = useQuery({
    queryKey: ["announcement-students-list"],
    queryFn: async () => api.list<{ announcement_id: string; student_id: string }>("announcement_students"),
  });
  const studentsById = new Map(students.map((s) => [s.id, s]));

  const send = useMutation({
    mutationFn: async () => {
      if (audience === "students" && selectedStudents.length === 0) {
        throw new Error("Pick at least one student");
      }
      const created = await api.create<Announcement>("announcements", { title, body, audience });
      if (audience === "students") {
        for (const student_id of selectedStudents) {
          await api.create("announcement_students", { announcement_id: created.id, student_id });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements-list"] });
      qc.invalidateQueries({ queryKey: ["announcement-students-list"] });
      toast.success("Broadcast sent");
      setTitle(""); setBody(""); setAudience("all"); setSelectedStudents([]); setStudentSearch("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filteredStudents = students.filter((s) =>
    !studentSearch.trim() ||
    `${s.full_name} ${s.admission_no}`.toLowerCase().includes(studentSearch.trim().toLowerCase()));

  const toggleStudent = (id: string) =>
    setSelectedStudents((sel) => sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id]);

  return (
    <DashShell title="SMS Broadcast" subtitle="Send announcements to the school community">
      <div className="rounded-2xl border bg-card p-4 mb-4 text-sm text-muted-foreground shadow-card">
        Messages below are posted as in-app broadcasts. Connect an SMS gateway (e.g. Africa's Talking) later to
        also deliver these as text messages. Parents don't have separate accounts — reach them by targeting
        their child under <b>Specific students</b>.
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send.mutate(); }}
        className="rounded-2xl border bg-card p-6 shadow-card space-y-4 mb-6"
      >
        <div>
          <Label>Title</Label>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Message</Label>
          <Textarea required value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="max-w-xs">
          <Label>Audience</Label>
          <Select value={audience} onValueChange={(v) => { setAudience(v); setSelectedStudents([]); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {AUDIENCE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {audience === "students" && (
          <div className="space-y-2">
            <Label>Students ({selectedStudents.length} selected)</Label>
            <Input placeholder="Search students…" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
            <ScrollArea className="h-56 rounded-lg border p-2">
              <div className="space-y-1">
                {filteredStudents.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary cursor-pointer">
                    <Checkbox checked={selectedStudents.includes(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                    {s.full_name} <span className="text-xs text-muted-foreground">({s.admission_no})</span>
                  </label>
                ))}
                {filteredStudents.length === 0 && <p className="text-sm text-muted-foreground px-2 py-4">No students found.</p>}
              </div>
            </ScrollArea>
          </div>
        )}
        <Button type="submit" disabled={send.isPending} className="bg-brand-gradient text-brand-foreground">
          <Megaphone className="h-4 w-4 mr-1" /> Send broadcast
        </Button>
      </form>

      <div className="rounded-2xl border bg-card overflow-x-auto shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Sent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4}>Loading…</TableCell></TableRow>
            ) : announcements.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-10">No broadcasts yet.</TableCell></TableRow>
            ) : announcements.map((a) => {
              const targeted = recipients.filter((r) => r.announcement_id === a.id);
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{a.body}</TableCell>
                  <TableCell>
                    {a.audience === "students" && targeted.length ? (
                      <div className="flex flex-wrap gap-1">
                        {targeted.map((r) => (
                          <Badge key={r.student_id} variant="secondary">{studentsById.get(r.student_id)?.full_name ?? "—"}</Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="outline">{AUDIENCE_OPTIONS.find((o) => o.value === a.audience)?.label ?? a.audience}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.created_at?.slice(0, 10)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </DashShell>
  );
}
