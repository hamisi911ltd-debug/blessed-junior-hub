import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/dash/Shell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, GraduationCap, Receipt, TrendingDown, DollarSign, School } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Overview,
});

function useCount(table: string) {
  return useQuery({
    queryKey: [table, "count"],
    queryFn: async () => {
      const { count, error } = await supabase.from(table as any).select("*", { count: "exact", head: true });
      if (error) return 0;
      return count ?? 0;
    },
  });
}

function useSum(table: string, column: string) {
  return useQuery({
    queryKey: [table, "sum", column],
    queryFn: async () => {
      const { data, error } = await supabase.from(table as any).select(column);
      if (error) return 0;
      return (data ?? []).reduce((a: number, r: any) => a + Number(r[column] ?? 0), 0);
    },
  });
}

function Overview() {
  const students = useCount("students");
  const teachers = useCount("teachers");
  const classes = useCount("classes");
  const invoices = useCount("invoices");
  const paymentsTotal = useSum("payments", "amount");
  const expTotal = useSum("expenditures", "amount");

  const stats = [
    { label: "Students", value: students.data ?? "—", icon: <Users className="h-5 w-5" /> },
    { label: "Teachers", value: teachers.data ?? "—", icon: <GraduationCap className="h-5 w-5" /> },
    { label: "Classes", value: classes.data ?? "—", icon: <School className="h-5 w-5" /> },
    { label: "Invoices", value: invoices.data ?? "—", icon: <Receipt className="h-5 w-5" /> },
    { label: "Total collected", value: fmt(paymentsTotal.data ?? 0), icon: <DollarSign className="h-5 w-5" /> },
    { label: "Total spent", value: fmt(expTotal.data ?? 0), icon: <TrendingDown className="h-5 w-5" /> },
  ];

  return (
    <DashShell title="Overview" subtitle="Everything at a glance">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-gradient text-brand-foreground">{s.icon}</div>
            <div className="mt-4 text-3xl font-bold font-display">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-card">
        <div className="font-display font-semibold text-lg">Welcome to Blessed Junior School</div>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Use the sidebar to manage students, teachers, classes, curriculum,
          fees, results and more. Parents can jump to <b>My children</b> to
          view their child's records.
        </p>
      </div>
    </DashShell>
  );
}

function fmt(n: number) { return new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n); }