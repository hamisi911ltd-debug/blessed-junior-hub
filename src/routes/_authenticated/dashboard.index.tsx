import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useLookupMap } from "@/hooks/useLookupMap";
import { useAuth } from "@/hooks/useAuth";
import { Users, BookOpen, TrendingUp, UserCheck, UserPlus, CreditCard } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import welcomeImg from "@/j.jpeg";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Overview,
});

function useCount(table: string) {
  return useQuery({
    queryKey: [table, "count"],
    queryFn: async () => {
      const rows = await api.list<{ id: string }>(table, { select: "id" }).catch(() => []);
      return rows.length;
    },
  });
}

function useSum(table: string, column: string) {
  return useQuery({
    queryKey: [table, "sum", column],
    queryFn: async () => {
      const rows = await api.list<Record<string, unknown>>(table, { select: column }).catch(() => []);
      return rows.reduce((a, r) => a + Number(r[column] ?? 0), 0);
    },
  });
}

function isThisMonth(iso: string | null | undefined) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return !Number.isNaN(d.getTime()) && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function Overview() {
  const { user } = useAuth();
  const firstName = (user?.full_name ?? "").split(" ")[0];

  const { data: students = [] } = useQuery({
    queryKey: ["students", "overview"],
    queryFn: () => api.list<{ id: string; full_name: string; created_at: string; enrolled_at: string | null }>("students", { select: "id,full_name,created_at,enrolled_at" }).catch(() => []),
  });
  const { data: payments = [] } = useQuery({
    queryKey: ["payments", "overview"],
    queryFn: () => api.list<{ id: string; student_id: string; amount: number; method: string; paid_at: string }>("payments", { select: "id,student_id,amount,method,paid_at" }).catch(() => []),
  });
  const teachers = useCount("teachers");
  const classes = useCount("classes");
  const paymentsTotal = useSum("payments", "amount");
  const { map: studentsById } = useLookupMap<{ full_name: string }>("students");

  const newStudentsThisMonth = students.filter((s) => isThisMonth(s.enrolled_at ?? s.created_at)).length;
  const paymentsThisMonth = payments.filter((p) => isThisMonth(p.paid_at)).length;

  return (
    <DashShell title="Overview" subtitle="Everything at a glance">
      <div className="relative rounded-2xl overflow-hidden shadow-card h-24 md:h-28">
        <img src={welcomeImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
        <div className="relative h-full flex flex-col justify-center px-5 md:px-8 text-white">
          <div className="font-display font-bold text-base md:text-lg">
            {firstName ? `Welcome back, ${firstName}.` : "Welcome to Mombasa Kiongozi Academy"}
          </div>
          <p className="text-xs md:text-sm opacity-90 mt-0.5">Live data from your school's database.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-4 w-4" />} iconTone="blue"
          badge={`${newStudentsThisMonth} this month`}
          value={students.length} label="Total students"
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4" />} iconTone="violet"
          badge="All classes"
          value={classes.data ?? "—"} label="Active classes"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />} iconTone="green"
          badge="All payments"
          value={fmtCompact(paymentsTotal.data ?? 0)} label="Revenue (KES)"
        />
        <StatCard
          icon={<UserCheck className="h-4 w-4" />} iconTone="amber"
          badge="Teaching staff"
          value={teachers.data ?? "—"} label="Total teachers"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RegistrationsChart students={students} />
        <RevenueChart payments={payments} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity students={students} payments={payments} studentsById={studentsById} />
        <div className="space-y-6">
          <ThisMonthCard newStudents={newStudentsThisMonth} classes={classes.data ?? 0} paymentsThisMonth={paymentsThisMonth} totalStudents={students.length} />
          <TotalRevenueCard total={paymentsTotal.data ?? 0} />
        </div>
      </div>
    </DashShell>
  );
}

const ICON_TONES: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600",
  violet: "bg-violet-500/10 text-violet-600",
  green: "bg-emerald-500/10 text-emerald-600",
  amber: "bg-amber-500/10 text-amber-600",
};

function StatCard({ icon, iconTone, badge, value, label }: { icon: ReactNode; iconTone: string; badge: string; value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 md:p-5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${ICON_TONES[iconTone]}`}>{icon}</div>
        <span className="text-[11px] text-muted-foreground text-right truncate">{badge}</span>
      </div>
      <div className="mt-3 text-2xl md:text-3xl font-bold font-display truncate">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function RegistrationsChart({ students }: { students: { created_at: string; enrolled_at: string | null }[] }) {
  const byMonth = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-KE", { month: "short" }), total: 0 });
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]));
    for (const s of students) {
      const d = new Date(s.enrolled_at ?? s.created_at);
      if (Number.isNaN(d.getTime())) continue;
      const bucket = byKey.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (bucket) bucket.total += 1;
    }
    return buckets;
  }, [students]);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="font-display font-semibold">Student Registrations</div>
      <div className="text-xs text-muted-foreground mb-4">Last 6 months</div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={byMonth}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" fontSize={12} stroke="var(--muted-foreground)" />
          <YAxis fontSize={12} stroke="var(--muted-foreground)" allowDecimals={false} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
          <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--accent-2)" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenueChart({ payments }: { payments: { amount: number; paid_at: string }[] }) {
  const byMonth = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-KE", { month: "short" }), total: 0 });
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]));
    for (const p of payments) {
      const d = new Date(p.paid_at);
      if (Number.isNaN(d.getTime())) continue;
      const bucket = byKey.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (bucket) bucket.total += Number(p.amount ?? 0);
    }
    return buckets;
  }, [payments]);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="font-display font-semibold">Revenue by Month</div>
      <div className="text-xs text-muted-foreground mb-4">KES — last 6 months</div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={byMonth}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" fontSize={12} stroke="var(--muted-foreground)" />
          <YAxis fontSize={12} stroke="var(--muted-foreground)" tickFormatter={(v) => fmtCompact(Number(v))} width={60} />
          <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
          <Bar dataKey="total" fill="var(--accent-2)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type Activity = { id: string; icon: ReactNode; text: string; when: string; at: number };

function RecentActivity({
  students, payments, studentsById,
}: {
  students: { id: string; full_name: string; created_at: string; enrolled_at: string | null }[];
  payments: { id: string; student_id: string; amount: number; method: string; paid_at: string }[];
  studentsById: Map<string, { full_name: string }>;
}) {
  const items = useMemo<Activity[]>(() => {
    const monthLabel = (iso: string) => {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-KE", { month: "short" });
    };
    const studentEvents: Activity[] = students.map((s) => {
      const when = s.enrolled_at ?? s.created_at;
      return {
        id: `s-${s.id}`,
        icon: <UserPlus className="h-4 w-4" />,
        text: `${s.full_name} registered`,
        when: monthLabel(when),
        at: new Date(when).getTime() || 0,
      };
    });
    const paymentEvents: Activity[] = payments.map((p) => ({
      id: `p-${p.id}`,
      icon: <CreditCard className="h-4 w-4" />,
      text: `${studentsById.get(p.student_id)?.full_name ?? "A student"} paid ${fmt(p.amount)} via ${p.method}`,
      when: monthLabel(p.paid_at),
      at: new Date(p.paid_at).getTime() || 0,
    }));
    return [...studentEvents, ...paymentEvents].sort((a, b) => b.at - a.at).slice(0, 8);
  }, [students, payments, studentsById]);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="font-display font-semibold mb-4">Recent Activity</div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No activity yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.id} className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">{i.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm truncate">{i.text}</div>
                <div className="text-xs text-muted-foreground">{i.when}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ThisMonthCard({ newStudents, classes, paymentsThisMonth, totalStudents }: { newStudents: number; classes: number; paymentsThisMonth: number; totalStudents: number }) {
  const rows = [
    { dot: "bg-blue-500", label: "New Students", value: newStudents },
    { dot: "bg-violet-500", label: "Active Classes", value: classes },
    { dot: "bg-emerald-500", label: "Payments Received", value: paymentsThisMonth },
    { dot: "bg-amber-500", label: "Total Students", value: totalStudents },
  ];
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="font-display font-semibold mb-4">This Month</div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground"><span className={`h-2 w-2 rounded-full ${r.dot}`} />{r.label}</span>
            <span className="font-semibold">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TotalRevenueCard({ total }: { total: number }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card text-center">
      <div className="font-display font-semibold">Total Revenue</div>
      <div className="mt-2 text-3xl font-bold font-display">{fmtCompact(total)}</div>
      <div className="text-xs text-muted-foreground mt-1">KES — all time</div>
      <div className="mt-4 h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div className="h-full w-full rounded-full bg-brand-gradient" />
      </div>
    </div>
  );
}

function fmt(n: number) { return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n); }
function fmtCompact(n: number) { return new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 }).format(n); }
