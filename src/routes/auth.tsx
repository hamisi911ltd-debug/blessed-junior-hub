import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle } from "lucide-react";
import logo from "@/LOGO.jpeg";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { user } = await api.auth.me();
    if (user) throw redirect({ to: "/dashboard" });
  },
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — Mombasa Kiongozi Academy" }] }),
});

function AuthPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.signIn(identifier, password);
      await qc.invalidateQueries({ queryKey: ["auth-me"] });
      toast.success("Welcome back!");
      nav({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async () => {
    try {
      const contact = await fetch("/api/public/school-contact").then((r) => r.json()) as { name: string | null; phone: string | null };
      const digits = contact.phone?.replace(/\D/g, "") ?? "";
      if (!digits) {
        toast.error("No admin WhatsApp number is set up yet — contact the school office directly.");
        return;
      }
      const who = identifier.trim() ? ` My sign-in ID is "${identifier.trim()}".` : "";
      const text = `Hello, I've forgotten my password for the ${contact.name ?? "school"} portal and need it reset.${who}`;
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Couldn't open WhatsApp — contact the school office directly.");
    }
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.signUp(email, password, fullName);
      await qc.invalidateQueries({ queryKey: ["auth-me"] });
      toast.success("Account created — welcome!");
      nav({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero grid place-items-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <div className="rounded-3xl border border-border bg-card shadow-card p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg overflow-hidden bg-white p-0.5"><img src={logo} alt="" className="h-full w-full object-contain" /></span>
            <div>
              <div className="font-display font-bold text-lg">Mombasa Kiongozi Academy</div>
              <div className="text-xs text-muted-foreground">School Management Portal</div>
            </div>
          </div>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={onSignIn} className="space-y-4 mt-4">
                <div>
                  <Label>Email, phone or username</Label>
                  <Input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email, phone, full name or staff ID" />
                </div>
                <div><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <Button disabled={loading} className="w-full bg-brand-gradient text-brand-foreground">Sign in</Button>
                <button type="button" onClick={onForgotPassword} className="flex items-center justify-center gap-1.5 w-full text-xs text-primary hover:underline">
                  <MessageCircle className="h-3.5 w-3.5" /> Forgot password? Message the admin on WhatsApp
                </button>
                <div className="text-xs text-muted-foreground text-center space-y-0.5">
                  <p>Parents: your phone number + your child's admission number.</p>
                  <p>Students: your full name + your parent's phone number.</p>
                  <p>Teachers: your ID number + your phone number.</p>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={onSignUp} className="space-y-4 mt-4">
                <div><Label>Full name</Label><Input required value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
                <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <Button disabled={loading} className="w-full bg-brand-gradient text-brand-foreground">Create account</Button>
                <p className="text-xs text-muted-foreground text-center">
                  For school staff. The first person to sign up automatically becomes the school Admin.
                  Parents don't need to sign up — a portal login is created automatically when a child is enrolled.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
