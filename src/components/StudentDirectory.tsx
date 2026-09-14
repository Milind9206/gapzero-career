import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { resultsQuery, studentsQuery, type Student } from "@/lib/gapzero";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, ArrowLeft, Loader2 } from "lucide-react";

export function StudentDirectory({
  action,
  renderPanel,
}: {
  action?: (s: Student) => React.ReactNode;
  renderPanel?: (s: Student) => React.ReactNode;
}) {
  const { data: students = [], isLoading } = useQuery(studentsQuery());
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);

  const list = students.filter((s) =>
    `${s.name} ${s.email} ${s.course ?? ""} ${s.branch ?? ""} ${s.interest ?? ""}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  if (selected) {
    return (
      <StudentDetail
        student={selected}
        onBack={() => setSelected(null)}
        panel={renderPanel?.(selected)}
      />
    );
  }

  return (
    <>
      <section className="spectrum-edge rounded-3xl bg-glass p-5 backdrop-blur-md">
        <h1 className="text-xl font-extrabold tracking-tight">Student directory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {students.length} students · search by name, course, branch or interest.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-glass-strong px-3.5 py-2.5 ring-1 ring-border focus-within:ring-primary/50">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search students"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </section>

      {isLoading && (
        <div className="grid place-items-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      <section className="glass-panel overflow-hidden rounded-3xl">
        <div className="hidden grid-cols-[2fr_1fr_1fr_auto] gap-3 border-b border-border px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Student</span>
          <span>Course</span>
          <span>Avg score</span>
          <span />
        </div>
        {list.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-1 items-center gap-3 border-b border-border px-5 py-3.5 last:border-0 sm:grid-cols-[2fr_1fr_1fr_auto]"
          >
            <button
              onClick={() => setSelected(s)}
              className="flex items-center gap-3 text-left"
            >
              {s.photo_url ? (
                <img
                  src={s.photo_url}
                  alt={s.name}
                  loading="lazy"
                  className="size-9 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <span className="grid size-9 place-items-center rounded-full bg-muted text-xs font-bold">
                  {s.name.slice(0, 1)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold">{s.name}</span>
                <span className="block truncate font-mono text-[10px] text-muted-foreground">
                  {s.email}
                </span>
              </span>
            </button>
            <span className="font-mono text-[11px] text-muted-foreground">
              {s.course ?? "—"} · {s.branch ?? "—"}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${s.avg_score}%` }}
                />
              </span>
              <span className="font-mono text-[11px]">{s.avg_score}%</span>
            </span>
            <span className="flex gap-2">
              <button
                onClick={() => setSelected(s)}
                className="rounded-full bg-glass-strong px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider ring-1 ring-border"
              >
                View
              </button>
              {action?.(s)}
            </span>
          </div>
        ))}
      </section>
    </>
  );
}

function StudentDetail({
  student,
  onBack,
  panel,
}: {
  student: Student;
  onBack: () => void;
  panel?: React.ReactNode;
}) {
  const { data: results = [] } = useQuery(resultsQuery(student.email));
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);

  async function openResume() {
    if (!student.resume_url) return;
    setLoadingResume(true);
    const { data } = await supabase.storage
      .from("resumes")
      .createSignedUrl(student.resume_url, 600);
    setResumeUrl(data?.signedUrl ?? null);
    setLoadingResume(false);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noreferrer");
  }

  return (
    <>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to directory
      </button>

      <section className="spectrum-edge animate-rise rounded-3xl bg-glass p-5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={student.name}
              className="size-16 rounded-2xl object-cover ring-1 ring-border"
            />
          ) : (
            <span className="grid size-16 place-items-center rounded-2xl bg-muted text-xl font-bold">
              {student.name.slice(0, 1)}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold tracking-tight">{student.name}</h1>
            <p className="truncate font-mono text-[11px] text-muted-foreground">{student.email}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {student.course ?? "—"} · {student.branch ?? "—"} · {student.interest ?? "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            [`${student.avg_score}%`, "Avg score"],
            [student.assessments_taken, "Tests"],
            [student.internships_done, "Interns"],
          ].map(([v, l]) => (
            <div key={String(l)} className="glass-tile rounded-2xl px-4 py-3">
              <p className="text-2xl font-extrabold tracking-tight">{v}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {l}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={openResume}
          disabled={!student.resume_url || loadingResume}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-[13px] font-semibold text-background disabled:opacity-50"
        >
          {loadingResume ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
          {student.resume_url ? "Preview resume" : "No resume uploaded"}
        </button>
        {resumeUrl && (
          <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">
            Opened in a new tab — link valid for 10 minutes.
          </p>
        )}
      </section>

      <section>
        <h2 className="px-1 text-[15px] font-bold tracking-tight">Assessment history</h2>
        <div className="mt-3 space-y-2">
          {results.length === 0 && (
            <p className="glass-tile rounded-2xl px-4 py-3.5 text-[13px] text-muted-foreground">
              No assessments taken yet.
            </p>
          )}
          {results.map((r) => (
            <div key={r.id} className="glass-tile rounded-2xl px-4 py-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold">
                  {r.score}/{r.total} · {Math.round((r.score / r.total) * 100)}%
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {new Date(r.taken_at).toLocaleDateString()}
                </p>
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                strong: {r.strong_areas.join(", ") || "—"} · weak:{" "}
                {r.weak_areas.join(", ") || "—"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {panel}
    </>
  );
}
