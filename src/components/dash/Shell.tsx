import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, isStaff, isAdmin, isBursar, isParent, isStudent, isTeacher } from "@/hooks/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, School, Calendar,
  ClipboardList, DollarSign, Receipt, Wallet, Megaphone, UserCog,
  Baby, LogOut, BookMarked, TrendingDown,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReactNode } from "react";

type NavItem = { to: string; label: string; icon: ReactNode; show?: (r: string[]) => boolean };

const NAV: NavItem[] = [
  { to: "/_authenticated/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/_authenticated/dashboard/students", label: "Students", icon: <Users className="h-4 w-4" />, show: (r) => isStaff(r as any) },
  { to: "/_authenticated/dashboard/teachers", label: "Teachers", icon: <GraduationCap className="h-4 w-4" />, show: (r) => isStaff(r as any) },
  { to: "/_authenticated/dashboard/classes", label: "Classes", icon: <School className="h-4 w-4" />, show: (r) => isStaff(r as any) },
  { to: "/_authenticated/dashboard/subjects", label: "Subjects", icon: <BookOpen className="h-4 w-4" />, show: (r) => isStaff(r as any) },
  { to: "/_authenticated/dashboard/curriculum", label: "Curriculum", icon: <BookMarked className="h-4 w-4" />, show: (r) => isStaff(r as any) },
  { to: "/_authenticated/dashboard/terms", label: "Terms", icon: <Calendar className="h-4 w-4" />, show: (r) => isAdmin(r as any) },
  { to: "/_authenticated/dashboard/exams", label: "Exams", icon: <ClipboardList className="h-4 w-4" />, show: (r) => isStaff(r as any) },
  { to: "/_authenticated/dashboard/results", label: "Results", icon: <ClipboardList className="h-4 w-4" /> },
  { to: "/_authenticated/dashboard/fees", label: "Fee structures", icon: <DollarSign className="h-4 w-4" />, show: (r) => isAdmin(r as any) || isBursar(r as any) },
  { to: "/_authenticated/dashboard/invoices", label: "Invoices", icon: <Receipt className="h-4 w-4" /> },
  { to: "/_authenticated/dashboard/payments", label: "Payments", icon: <Wallet className="h-4 w-4" /> },
  { to: "/_authenticated/dashboard/expenditures", label: "Expenditure", icon: <TrendingDown className="h-4 w-4" />, show: (r) => isAdmin(r as any) || isBursar(r as any) },
  { to: "/_authenticated/dashboard/announcements", label: "Announcements", icon: <Megaphone className="h-4 w-4" /> },
  { to: "/_authenticated/dashboard/my-children", label: "My children", icon: <Baby className="h-4 w-4" />, show: (r) => isParent(r as any) || isStudent(r as any) || isTeacher(r as any) === false },
  { to: "/_authenticated/dashboard/users", label: "Users & roles", icon: <UserCog className="h-4 w-4" />, show: (r) => isAdmin(r as any) },
];

export function DashShell({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles(user?.id);
  const nav = useNavigate();
  const qc = useQueryClient();
  const loc = useLocation();

  const items = NAV.filter((i) => !i.show || i.show(roles));

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    nav({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr] bg-secondary/30">
      <aside className="hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><School className="h-5 w-5" /></span>
          <span className="font-display font-bold">Blessed Junior</span>
        </Link>
        <nav className="flex-1 p-3 space-y-1 overflow-auto">
          {items.map((i) => {
            const active = loc.pathname === i.to || (i.to !== "/_authenticated/dashboard" && loc.pathname.startsWith(i.to));
            return (
              <Link key={i.to} to={i.to as any}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                {i.icon}{i.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 text-xs">
            <div className="font-medium truncate">{user?.email}</div>
            <div className="opacity-70 mt-0.5">{roles.join(", ") || "no role"}</div>
          </div>
          <Button variant="ghost" onClick={signOut} className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex flex-col min-w-0">
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}