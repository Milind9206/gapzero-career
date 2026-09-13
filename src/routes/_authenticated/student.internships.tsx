import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useProfile, useSession } from "@/hooks/useAuth";
import { internshipsQuery, studentQuery } from "@/lib/gapzero";
import { ExternalLink, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/student/internships")({
  component: Internships,
});

function Internships() {
  const { session } = useSession();
  const { data: profile } = useProfile(session);
  const { data: student } = useQuery(studentQuery(profile?.email));
  const { data: internships = [] } = useQuery(internshipsQuery());
  const [field, setField] = useState<string>("All");
  const [mode, setMode] = useState<string>("All");

  const fields = ["All", ...Array.from(new Set(internships.map((i) => i.field)))];
  const modes = ["All", ...Array.from(new Set(internships.map((i) => i.type)))];

  const list = internships
    .filter((i) => (field === "All" ? true : i.field === field))
    .filter((i) => (mode === "All" ? true : i.type === mode))
    .sort((a, b) =>
      a.field === student?.interest ? -1 : b.field === student?.interest ? 1 : 0,
    );

  return (
    <>
      <section className="spectrum-edge rounded-3xl bg-glass p-5 backdrop-blur-md">
        <h1 className="text-xl font-extrabold tracking-tight">Internships</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Matched to your interest in {student?.interest ?? "tech"}.
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            {fields.map((f) => (
              <button
                key={f}
                onClick={() => setField(f)}
                className={`rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider ring-1 ${
                  field === f
                    ? "bg-foreground text-background ring-transparent"
                    : "bg-glass-strong text-muted-foreground ring-border"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider ring-1 ${
                  mode === m
                    ? "bg-primary/15 text-foreground ring-primary/40"
                    : "bg-glass-strong text-muted-foreground ring-border"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-2.5 sm:grid-cols-2">
        {list.map((i) => (
          <article key={i.id} className="glass-tile flex flex-col gap-3 rounded-2xl p-4">
            <div>
              <p className="text-[14px] font-bold leading-snug">{i.title}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{i.company}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {i.location}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5">{i.type}</span>
              {i.stipend && (
                <span className="font-mono text-primary">{i.stipend}</span>
              )}
            </div>
            <a
              href={i.link}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground py-2.5 text-[13px] font-semibold text-background"
            >
              Apply now <ExternalLink className="size-3.5" />
            </a>
          </article>
        ))}
      </section>
    </>
  );
}
