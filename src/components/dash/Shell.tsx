import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, isStaff, isAdmin, isBursar, isParent } from "@/hooks/useRoles";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import {
  LayoutDashboard, Users, School, UserCog,
  Wallet, ClipboardList, Megaphone, Settings,
  Baby, LogOut, ClipboardCheck, Banknote, User, Plus,
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
  { to: "/dashboard/sms", label: "SMS Broadcast", icon: <Megaphone className="h-4 w-4" /> },
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

function BottomNavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      to={item.to as any}
      className={`flex flex-col items-center justify-center gap-1 h-full text-[10px] font-medium transition ${active ? "text-white" : "text-sidebar-foreground/60"}`}
    >
      {item.icon}
      <span className="truncate max-w-[60px]">{item.label}</span>
    </Link>
  );
}

export function DashShell({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles(user?.id);
  const nav = useNavigate();
  const qc = useQueryClient();
  const loc = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const items = NAV.filter((i) => !i.show || i.show(roles));
  const isActive = (to: string) => loc.pathname === to || (to !== "/dashboard" && loc.pathname.startsWith(to));

  // On mobile the first 4 items live in the bottom bar (2 either side of the "+" button);
  // everything else opens in the "+" sheet, alongside sign out.
  const primaryItems = items.slice(0, 4);
  const overflowItems = items.slice(4);

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
          <Crest className="h-9 w-9" />
          <span className="font-display font-bold">Kiongozi Academy</span>
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

      {/* Mobile top bar: profile icon (left) balanced against a spacer (right) so the brand stays centered */}
      <div className="flex md:hidden items-center justify-between h-14 px-4 border-b bg-sidebar text-sidebar-foreground sticky top-0 z-40">
        <Link to="/dashboard/settings" aria-label="Your profile" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
          <User className="h-4 w-4" />
        </Link>
        <Link to="/" className="flex items-center gap-2">
          <Crest className="h-8 w-8" />
          <span className="font-display font-bold text-sm">Kiongozi Academy</span>
        </Link>
        <span className="h-9 w-9 shrink-0" aria-hidden />
      </div>

      {/* Mobile bottom nav: 2 items either side of a raised "+" that opens everything else */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-sidebar text-sidebar-foreground border-t border-sidebar-border pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 items-stretch h-16 px-1">
          {primaryItems.slice(0, 2).map((i) => <BottomNavLink key={i.to} item={i} active={isActive(i.to)} />)}
          <div className="grid place-items-center">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-label="More navigation"
              className="grid h-12 w-12 -mt-6 place-items-center rounded-full bg-brand-gradient text-brand-foreground shadow-glow border-4 border-sidebar"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          {primaryItems.slice(2, 4).map((i) => <BottomNavLink key={i.to} item={i} active={isActive(i.to)} />)}
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="md:hidden p-0 flex flex-col rounded-t-2xl max-h-[75vh]">
          <SheetHeader className="px-5 py-4 border-b space-y-0 text-left">
            <SheetTitle className="font-display">More</SheetTitle>
          </SheetHeader>
          <div className="p-3 grid grid-cols-3 gap-2 overflow-auto">
            {overflowItems.map((i) => (
              <SheetClose asChild key={i.to}>
                <Link
                  to={i.to as any}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-4 text-xs font-medium text-center transition ${isActive(i.to) ? "bg-secondary text-primary" : "hover:bg-secondary"}`}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary">{i.icon}</span>
                  {i.label}
                </Link>
              </SheetClose>
            ))}
          </div>
          <div className="p-3 border-t mt-auto">
            <SheetClose asChild>
              <Button variant="ghost" onClick={signOut} className="w-full justify-start text-muted-foreground">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

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
        <div className="p-4 md:p-6 pb-24 md:pb-6">{children}</div>
      </main>
    </div>
  );
}
