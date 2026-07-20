import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, isStaff, isAdmin, isBursar, isParent } from "@/hooks/useRoles";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  LayoutDashboard, Users, School, UserCog,
  Wallet, ClipboardList, Megaphone, Settings,
  Baby, LogOut, Menu, ClipboardCheck, Banknote,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, type ReactNode } from "react";
import logo from "@/LOGO.jpeg";

type NavItem = { to: string; label: string; icon: ReactNode; show?: (r: string[]) => boolean };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/dashboard/students", label: "Students", icon: <Users className="h-4 w-4" />, show: (r) => isStaff(r as any) },
  { to: "/dashboard/classes", label: "Classes & Subjects", icon: <School className="h-4 w-4" />, show: (r) => isStaff(r as any) },
  { to: "/dashboard/teachers", label: "Staff & Roles", icon: <UserCog className="h-4 w-4" />, show: (r) => isStaff(r as any) },
  { to: "/dashboard/payments", label: "Payments", icon: <Wallet className="h-4 w-4" /> },
  { to: "/dashboard/marks", label: "Marks & Reports", icon: <ClipboardList className="h-4 w-4" /> },
  { to: "/dashboard/attendance", label: "Attendance", icon: <ClipboardCheck className="h-4 w-4" /> },
  { to: "/dashboard/salary", label: "Salary", icon: <Banknote className="h-4 w-4" />, show: (r) => isStaff(r as any) },
  { to: "/dashboard/sms", label: "SMS Broadcast", icon: <Megaphone className="h-4 w-4" />, show: (r) => isStaff(r as any) },
  { to: "/dashboard/settings", label: "Settings", icon: <Settings className="h-4 w-4" />, show: (r) => isAdmin(r as any) || isBursar(r as any) },
  { to: "/dashboard/my-children", label: "My children", icon: <Baby className="h-4 w-4" />, show: (r) => isParent(r as any) },
];

function NavLinks({ items, active, onNavigate }: { items: NavItem[]; active: (to: string) => boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 p-3 space-y-1 overflow-auto">
      {items.map((i) => (
        <Link key={i.to} to={i.to as any} onClick={onNavigate}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active(i.to) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
          {i.icon}{i.label}
        </Link>
      ))}
    </nav>
  );
}

// The crest is a tall shield on a white card, not a square — object-cover was cropping
// most of it away. object-contain + a white backing keeps the whole crest legible at
// any size, on both the light header and the dark sidebar.
function Crest({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg overflow-hidden bg-white p-0.5 ${className}`}>
      <img src={logo} alt="Mombasa Kiongozi Academy crest" className="h-full w-full object-contain" />
    </span>
  );
}

export function DashShell({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles(user?.id);
  const nav = useNavigate();
  const qc = useQueryClient();
  const loc = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = NAV.filter((i) => !i.show || i.show(roles));
  const isActive = (to: string) => loc.pathname === to || (to !== "/dashboard" && loc.pathname.startsWith(to));

  const signOut = async () => {
    await qc.cancelQueries();
    await api.auth.signOut();
    qc.clear();
    toast.success("Signed out");
    nav({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr] bg-secondary/30">
      <aside className="hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
          <Crest className="h-10 w-10" />
          <span className="font-display font-bold leading-tight">Mombasa Kiongozi Academy</span>
        </Link>
        <NavLinks items={items} active={isActive} />
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 text-xs">
            <div className="font-medium truncate">{user?.email ?? user?.phone}</div>
            <div className="opacity-70 mt-0.5">{roles.join(", ") || "no role"}</div>
          </div>
          <Button variant="ghost" onClick={signOut} className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex md:hidden items-center justify-between h-14 px-4 border-b bg-sidebar text-sidebar-foreground sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <Crest className="h-9 w-9" />
          <span className="font-display font-bold text-sm leading-tight truncate">Mombasa Kiongozi Academy</span>
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 flex flex-col bg-sidebar text-sidebar-foreground w-72">
            <SheetHeader className="px-5 h-16 flex-row items-center gap-2.5 border-b border-sidebar-border space-y-0 text-left">
              <Crest className="h-9 w-9" />
              <SheetTitle className="text-sidebar-foreground font-display leading-tight">Mombasa Kiongozi Academy</SheetTitle>
            </SheetHeader>
            <NavLinks items={items} active={isActive} onNavigate={() => setMobileOpen(false)} />
            <div className="p-3 border-t border-sidebar-border">
              <div className="px-3 py-2 text-xs">
                <div className="font-medium truncate">{user?.email ?? user?.phone}</div>
                <div className="opacity-70 mt-0.5">{roles.join(", ") || "no role"}</div>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" onClick={signOut} className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex flex-col min-w-0">
        <header className="hidden md:flex h-16 border-b bg-card px-6 items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <div className="md:hidden px-4 pt-4 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-display font-bold">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
