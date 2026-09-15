import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { homeForRole, type Role } from "@/hooks/useAuth";
import { Backdrop } from "@/components/AppShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { GraduationCap, Building2, Briefcase, Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — GapZero" },
      {
        name: "description",
        content:
          "Sign in to GapZero to close your skill gaps with AI recommendations, assessments and resume guidance.",
      },
      { property: "og:title", content: "Sign in — GapZero" },
      {
        property: "og:description",
        content: "AI career platform for students, colleges and recruiters.",
      },
    ],
  }),
  component: AuthPage,
});

const ROLES: { value: Role; label: string; icon: typeof GraduationCap }[] = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "college", label: "College", icon: Building2 },
  { value: "recruiter", label: "Recruiter", icon: Briefcase },
];

const DEMOS: { role: Role; email: string; name: string }[] = [
  { role: "student", email: "student@gapzero.demo", name: "Ananya Iyer" },
  { role: "college", email: "college@gapzero.demo", name: "Northfield Institute" },
  { role: "recruiter", email: "recruiter@gapzero.demo", name: "Meera Kapoor" },
];

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) await routeByRole(data.session.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function routeByRole(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("role, onboarded")
      .eq("id", userId)
      .maybeSingle();
    const r = (data?.role as Role) ?? "student";
    if (r === "student" && data && !data.onboarded) {
      navigate({ to: "/onboarding" });
      return;
    }
    navigate({ to: homeForRole(r) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy("form");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { role, full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await routeByRole(data.user.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign you in");
    } finally {
      setBusy(null);
    }
  }

  async function demoLogin(demo: (typeof DEMOS)[number]) {
    if (busy) return;
    setBusy(demo.role);
    const password = "demo1234";
    try {
      let res = await supabase.auth.signInWithPassword({ email: demo.email, password });
      if (res.error) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: demo.email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { role: demo.role, full_name: demo.name, onboarded: true },
          },
        });
        if (signUpError) throw signUpError;
        res = await supabase.auth.signInWithPassword({ email: demo.email, password });
        if (res.error) throw res.error;
      }
      navigate({ to: homeForRole(demo.role) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Backdrop />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-lg bg-foreground text-sm font-extrabold text-background">
            G
          </div>
          <div>
            <h1 className="text-[19px] font-extrabold tracking-tight">GapZero</h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Close the skill gap
            </p>
          </div>
          <ThemeToggle className="ml-auto" />
        </div>

        <section className="spectrum-edge animate-rise rounded-3xl bg-glass p-5 backdrop-blur-md">
          <div className="flex gap-1 rounded-full bg-glass-strong p-1 ring-1 ring-border">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-full py-2 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  mode === m ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-[12px] font-semibold ring-1 transition-colors ${
                        role === r.value
                          ? "bg-primary/10 text-foreground ring-primary/40"
                          : "bg-glass-strong text-muted-foreground ring-border"
                      }`}
                    >
                      <r.icon className="size-4" />
                      {r.label}
                    </button>
                  ))}
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl bg-glass-strong px-3.5 py-3 text-sm outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-primary/50"
                />
              </>
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl bg-glass-strong px-3.5 py-3 text-sm outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-primary/50"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl bg-glass-strong px-3.5 py-3 text-sm outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={busy === "form"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy === "form" && <Loader2 className="size-4 animate-spin" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </section>

        <section className="mt-5">
          <p className="px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Quick demo login
          </p>
          <div className="mt-2.5 grid gap-2">
            {DEMOS.map((d) => (
              <button
                key={d.role}
                onClick={() => demoLogin(d)}
                disabled={!!busy}
                className="flex items-center justify-between rounded-2xl bg-glass px-4 py-3 text-left ring-1 ring-border backdrop-blur-md transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                <div>
                  <p className="text-sm font-semibold capitalize tracking-tight">{d.role} demo</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{d.email}</p>
                </div>
                {busy === d.role ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                    Enter
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
