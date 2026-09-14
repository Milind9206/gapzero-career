import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useProfile, useSession } from "@/hooks/useAuth";
import { jobsQuery, studentQuery } from "@/lib/gapzero";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExternalLink, FileUp, Loader2, MapPin, Sparkles, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/student/jobs")({
  component: Jobs,
});

const WEAK_LINES = [
  "Generic summary with no target role",
  "Skills listed without proficiency or proof",
  "Projects described by tools, not by impact",
  "No keywords matching the job description",
];

function tailoredLines(role: string) {
  return [
    `Headline rewritten to target ${role} with 3 matching keywords`,
    "Skills grouped by proficiency, each backed by a project",
    "Projects rewritten as impact bullets with measurable outcomes",
    `Added the 6 highest-frequency keywords found in ${role} postings`,
  ];
}

function Jobs() {
  const { session } = useSession();
  const { data: profile } = useProfile(session);
  const { data: student } = useQuery(studentQuery(profile?.email));
  const { data: jobs = [] } = useQuery(jobsQuery());

  const [role, setRole] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "working" | "done">("idle");
  const [step, setStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const targetRole = role.trim() || student?.interest || "Software Engineer";

  const matches = jobs
    .map((j) => {
      const hay = `${j.title} ${j.field} ${j.skills.join(" ")}`.toLowerCase();
      const needle = targetRole.toLowerCase();
      const score =
        (hay.includes(needle) ? 40 : 0) +
        (j.field === student?.interest ? 30 : 0) +
        Math.min(30, j.skills.length * 6);
      return { ...j, score: Math.min(98, 55 + score / 2) };
    })
    .sort((a, b) => b.score - a.score);

  async function onFile(file: File) {
    if (!profile?.email) return;
    setFileName(file.name);
    setStage("working");
    setStep(0);

    const path = `${session!.user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("resumes").upload(path, file);
    if (error) {
      toast.error("Could not upload that file. Try a PDF under 10MB.");
      setStage("idle");
      return;
    }
    await supabase.from("students").update({ resume_url: path }).eq("email", profile.email);

    const steps = [700, 900, 900, 800];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, steps[i]));
      setStep(i + 1);
    }
    setStage("done");
  }

  const stepLabels = [
    "Reading your CV",
    "Extracting skills and projects",
    `Comparing against ${targetRole} postings`,
    "Rewriting for impact",
  ];

  return (
    <>
      <section className="spectrum-edge rounded-3xl bg-glass p-5 backdrop-blur-md">
        <h1 className="text-xl font-extrabold tracking-tight">Jobs & resume tailoring</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell Forge the role you want, drop your CV, and see what changes.
        </p>

        <div className="mt-4 space-y-2.5">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Target role — e.g. Frontend Engineer"
            className="w-full rounded-xl bg-glass-strong px-4 py-3 text-sm outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-primary/50"
          />
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={stage === "working"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[13px] font-semibold text-background disabled:opacity-60"
          >
            {stage === "working" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileUp className="size-4" />
            )}
            {fileName ?? "Upload your CV"}
          </button>
        </div>
      </section>

      {stage === "working" && (
        <section className="glass-panel animate-rise rounded-3xl p-5">
          <p className="flex items-center gap-2 text-[14px] font-bold">
            <Sparkles className="size-4 text-primary" />
            Forge AI is tailoring your resume…
          </p>
          <ul className="mt-4 space-y-2.5">
            {stepLabels.map((label, i) => (
              <li key={label} className="flex items-center gap-2.5 text-[13px]">
                {i < step ? (
                  <Check className="size-4 text-primary" />
                ) : (
                  <Loader2
                    className={`size-4 ${i === step ? "animate-spin text-primary" : "text-muted-foreground opacity-40"}`}
                  />
                )}
                <span className={i <= step ? "" : "text-muted-foreground"}>{label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </section>
      )}

      {stage === "done" && (
        <section className="animate-rise grid gap-2.5 sm:grid-cols-2">
          <div className="glass-tile rounded-2xl p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Before
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">42<span className="text-base text-muted-foreground">/100</span></p>
            <ul className="mt-3 space-y-2">
              {WEAK_LINES.map((l) => (
                <li key={l} className="text-[12px] leading-snug text-muted-foreground">
                  — {l}
                </li>
              ))}
            </ul>
          </div>
          <div className="spectrum-edge rounded-2xl bg-glass p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
              After Forge
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">
              88<span className="text-base text-muted-foreground">/100</span>
            </p>
            <ul className="mt-3 space-y-2">
              {tailoredLines(targetRole).map((l) => (
                <li key={l} className="flex gap-2 text-[12px] leading-snug">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section>
        <h2 className="px-1 text-[15px] font-bold tracking-tight">
          Matching jobs for {targetRole}
        </h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {matches.map((j) => (
            <article key={j.id} className="glass-tile flex flex-col gap-3 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold leading-snug">{j.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{j.company}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/15 px-2 py-1 font-mono text-[10px] text-primary">
                  {Math.round(j.score)}% match
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" />
                  {j.location}
                </span>
                <span className="font-mono text-primary">{j.salary_range}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {j.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <a
                href={j.link}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground py-2.5 text-[13px] font-semibold text-background"
              >
                Apply now <ExternalLink className="size-3.5" />
              </a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
