import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useProfile, useSession } from "@/hooks/useAuth";
import { coursesQuery, questionsQuery, resultsQuery, studentQuery } from "@/lib/gapzero";
import { supabase } from "@/integrations/supabase/client";
import { Timer, Trophy, ArrowRight, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/student/assess")({
  component: Assess,
});

const SECONDS_PER_Q = 30;
const TOTAL_Q = 30;

function Assess() {
  const { session } = useSession();
  const { data: profile } = useProfile(session);
  const { data: student } = useQuery(studentQuery(profile?.email));
  const { data: pool = [] } = useQuery(questionsQuery());
  const { data: courses = [] } = useQuery(coursesQuery());
  const { data: history = [] } = useQuery(resultsQuery(profile?.email));
  const qc = useQueryClient();

  const [phase, setPhase] = useState<"intro" | "live" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [left, setLeft] = useState(SECONDS_PER_Q);
  const [summary, setSummary] = useState<{
    score: number;
    strong: string[];
    weak: string[];
  } | null>(null);

  const questions = useMemo(() => {
    if (pool.length === 0) return [];
    const out = [];
    for (let i = 0; i < TOTAL_Q; i++) out.push(pool[i % pool.length]);
    return out;
  }, [pool]);

  useEffect(() => {
    if (phase !== "live") return;
    setLeft(SECONDS_PER_Q);
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [phase, index]);

  useEffect(() => {
    if (phase === "live" && left <= 0) answer(null);
  }, [left, phase]);

  function answer(choice: number | null) {
    const next = [...answers];
    next[index] = choice;
    setAnswers(next);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      void finish(next);
    }
  }

  async function finish(all: (number | null)[]) {
    const bySubject = new Map<string, { right: number; total: number }>();
    let score = 0;
    questions.forEach((q, i) => {
      const s = bySubject.get(q.subject) ?? { right: 0, total: 0 };
      s.total += 1;
      if (all[i] === q.correct_index) {
        s.right += 1;
        score += 1;
      }
      bySubject.set(q.subject, s);
    });
    const strong: string[] = [];
    const weak: string[] = [];
    bySubject.forEach((v, k) => {
      (v.right / v.total >= 0.6 ? strong : weak).push(k);
    });

    setSummary({ score, strong, weak });
    setPhase("done");

    if (profile?.email) {
      await supabase.from("assessment_results").insert({
        student_email: profile.email,
        score,
        total: questions.length,
        strong_areas: strong,
        weak_areas: weak,
      });
      const taken = (student?.assessments_taken ?? 0) + 1;
      const pct = Math.round((score / questions.length) * 100);
      const avg = Math.round(
        (((student?.avg_score ?? 0) * (taken - 1)) + pct) / taken,
      );
      await supabase
        .from("students")
        .update({ assessments_taken: taken, avg_score: avg })
        .eq("email", profile.email);
      void qc.invalidateQueries({ queryKey: ["results", profile.email] });
      void qc.invalidateQueries({ queryKey: ["student", profile.email] });
    }
  }

  if (phase === "intro") {
    return (
      <>
        <section className="spectrum-edge rounded-3xl bg-glass p-5 backdrop-blur-md">
          <h1 className="text-xl font-extrabold tracking-tight">Self-assessment</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            30 questions, one at a time, {SECONDS_PER_Q} seconds each. It auto-advances — no going
            back. You get strong and weak areas at the end.
          </p>
          <button
            onClick={() => {
              setAnswers([]);
              setIndex(0);
              setPhase("live");
            }}
            disabled={questions.length === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[13px] font-semibold text-background disabled:opacity-50"
          >
            Start the test <ArrowRight className="size-4" />
          </button>
        </section>

        {history.length > 0 && (
          <section>
            <h2 className="px-1 text-[15px] font-bold tracking-tight">Past attempts</h2>
            <div className="mt-3 space-y-2">
              {history.map((r) => (
                <div
                  key={r.id}
                  className="glass-tile flex items-center justify-between rounded-2xl px-4 py-3"
                >
                  <div>
                    <p className="text-[13px] font-semibold">
                      {r.score}/{r.total} · {Math.round((r.score / r.total) * 100)}%
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {new Date(r.taken_at).toLocaleDateString()} · weak:{" "}
                      {r.weak_areas.join(", ") || "none"}
                    </p>
                  </div>
                  <Trophy className="size-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  if (phase === "live") {
    const q = questions[index];
    if (!q) return null;
    return (
      <section className="glass-panel rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {index + 1} / {questions.length} · {q.subject}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] ${
              left <= 5 ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"
            }`}
          >
            <Timer className="size-3.5" />
            {Math.max(0, left)}s
          </span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>

        <h2 className="mt-5 text-[17px] font-bold leading-snug">{q.question}</h2>

        <div className="mt-4 space-y-2.5">
          {q.options.map((opt, i) => (
            <button
              key={`${q.id}-${i}`}
              onClick={() => answer(i)}
              className="flex w-full items-center gap-3 rounded-2xl bg-glass-strong px-4 py-3.5 text-left text-[14px] ring-1 ring-border transition hover:ring-primary/50"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted font-mono text-[11px]">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </section>
    );
  }

  const s = summary!;
  const pct = Math.round((s.score / questions.length) * 100);
  const recommended = courses.filter((c) => s.weak.includes(c.area)).slice(0, 6);

  return (
    <>
      <section className="spectrum-edge animate-rise rounded-3xl bg-glass p-5 backdrop-blur-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Result saved
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          {s.score}
          <span className="text-lg text-muted-foreground">/{questions.length}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">You scored {pct}%.</p>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <div className="glass-tile rounded-2xl p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Strong areas
            </p>
            <p className="mt-1 text-[14px] font-semibold">{s.strong.join(", ") || "—"}</p>
          </div>
          <div className="glass-tile rounded-2xl p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
              Weak areas
            </p>
            <p className="mt-1 text-[14px] font-semibold">{s.weak.join(", ") || "None — clean sweep"}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2.5">
          <button
            onClick={() => {
              setPhase("intro");
              setSummary(null);
            }}
            className="flex-1 rounded-xl bg-glass-strong py-2.5 text-[13px] font-semibold ring-1 ring-border"
          >
            Retake
          </button>
          <Link
            to="/student"
            className="flex-1 rounded-xl bg-foreground py-2.5 text-center text-[13px] font-semibold text-background"
          >
            Back home
          </Link>
        </div>
      </section>

      {recommended.length > 0 && (
        <section>
          <h2 className="px-1 text-[15px] font-bold tracking-tight">
            Courses to close these gaps
          </h2>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {recommended.map((c) => (
              <a
                key={c.id}
                href={c.link}
                target="_blank"
                rel="noreferrer"
                className="glass-tile flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">{c.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {c.platform} · {c.area}
                  </p>
                </div>
                <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
