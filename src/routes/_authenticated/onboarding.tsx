import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/hooks/useAuth";
import { Backdrop } from "@/components/AppShell";
import { BRANCH_OPTIONS, COURSES_OPTIONS, INTEREST_AREAS } from "@/lib/gapzero";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-[13px] font-medium ring-1 transition-colors ${
        active
          ? "bg-foreground text-background ring-transparent"
          : "bg-glass-strong text-muted-foreground ring-border"
      }`}
    >
      {children}
    </button>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { data: profile } = useProfile(session);
  const [name, setName] = useState("");
  const [course, setCourse] = useState("BTech");
  const [branch, setBranch] = useState("CS");
  const [interest, setInterest] = useState<string>("Web Dev");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile?.full_name && !name) setName(profile.full_name);
  }, [profile, name]);

  useEffect(() => {
    if (profile?.onboarded) navigate({ to: "/student" });
  }, [profile, navigate]);

  async function finish(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || busy) return;
    setBusy(true);
    try {
      const { error: sErr } = await supabase.from("students").upsert(
        {
          email: profile.email,
          name: name || profile.email.split("@")[0] || "Student",
          course,
          branch,
          interest,
        },
        { onConflict: "email" },
      );
      if (sErr) throw sErr;
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ onboarded: true, full_name: name })
        .eq("id", profile.id);
      if (pErr) throw pErr;
      navigate({ to: "/student" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Backdrop />
      <div className="relative mx-auto max-w-md px-5 py-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Step 1 of 1
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Let's set up your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Forge uses this to pick your courses, internships and assessments.
        </p>

        <form
          onSubmit={finish}
          className="spectrum-edge animate-rise mt-6 space-y-5 rounded-3xl bg-glass p-5 backdrop-blur-md"
        >
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="mt-2 w-full rounded-xl bg-glass-strong px-3.5 py-3 text-sm outline-none ring-1 ring-border focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Course
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COURSES_OPTIONS.map((c) => (
                <Chip key={c} active={course === c} onClick={() => setCourse(c)}>
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Branch
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {BRANCH_OPTIONS.map((b) => (
                <Chip key={b} active={branch === b} onClick={() => setBranch(b)}>
                  {b}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Interest area
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {INTEREST_AREAS.map((i) => (
                <Chip key={i} active={interest === i} onClick={() => setInterest(i)}>
                  {i}
                </Chip>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-background disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Enter GapZero
          </button>
        </form>
      </div>
    </div>
  );
}
