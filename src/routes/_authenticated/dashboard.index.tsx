import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useLookupMap } from "@/hooks/useLookupMap";
import { Users, GraduationCap, DollarSign, School, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/hooks/useAuth";
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

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Overview() {
  const { user } = useAuth();
  const firstName = (user?.full_name ?? "").split(" ")[0];
  const students = useCount("students");
  const teachers = useCount("teachers");
  const classes = useCount("classes");
  const paymentsTotal = useSum("payments", "amount");
  const expTotal = useSum("expenditures", "amount");

  const stats = [
    { label: "Students", value: students.data ?? "—", icon: <Users className="h-5 w-5" /> },
    { label: "Teachers", value: teachers.data ?? "—", icon: <GraduationCap className="h-5 w-5" /> },
    { label: "Classes", value: classes.data ?? "—", icon: <School className="h-5 w-5" /> },
    { label: "Total collected", value: fmt(paymentsTotal.data ?? 0), icon: <DollarSign className="h-5 w-5" /> },
    { label: "Total spent", value: fmt(expTotal.data ?? 0), icon: <TrendingDown className="h-5 w-5" /> },
  ];

  return (
    <DashShell title="Overview" subtitle="Everything at a glance">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-gradient text-brand-foreground">{s.icon}</div>
            <div className="mt-4 text-2xl md:text-3xl font-bold font-display truncate">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PaymentsChart />
        <StudentsByClassChart />
      </div>

      <div className="mt-8 relative rounded-2xl overflow-hidden shadow-card">
        <img src={welcomeImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
        <div className="relative p-6 md:p-8 text-white max-w-xl">
          <div className="font-display font-bold text-xl md:text-2xl">
            {firstName ? `Welcome back, ${firstName}.` : "Welcome to Mombasa Kiongozi Academy"}
          </div>
          <p className="text-sm opacity-90 mt-2">
            Use the sidebar to manage students, teachers, classes, fees, results and more. Parents can
            jump to <b>My children</b> to view their child's records.
          </p>
        </div>
      </div>
    </DashShell>
  );
}

function PaymentsChart() {
  const { data: payments = [] } = useQuery({
    queryKey: ["payments", "by-month"],
    queryFn: async () => api.list<{ amount: number; paid_at: string }>("payments", { select: "amount,paid_at" }).catch(() => []),
  });

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
      <div className="font-display font-semibold mb-4">Payments collected — last 6 months</div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={byMonth}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" fontSize={12} stroke="var(--muted-foreground)" />
          <YAxis fontSize={12} stroke="var(--muted-foreground)" tickFormatter={(v) => fmt(Number(v))} width={70} />
          <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
          <Bar dataKey="total" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StudentsByClassChart() {
  const { data: studentsList = [] } = useQuery({
    queryKey: ["students", "by-class"],
    queryFn: async () => api.list<{ id: string; class_id: string | null }>("students", { select: "id,class_id" }).catch(() => []),
  });
  const { map: classesById } = useLookupMap<{ name: string }>("classes");

  const byClass = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of studentsList) {
      const name = (s.class_id && classesById.get(s.class_id)?.name) || "Unassigned";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [studentsList, classesById]);

  if (!byClass.length) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-card grid place-items-center text-sm text-muted-foreground">
        No students enrolled yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="font-display font-semibold mb-4">Students per class</div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={byClass} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => `${e.name} (${e.value})`}>
            {byClass.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function fmt(n: number) { return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n); }
