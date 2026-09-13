import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useProfile, useSession } from "@/hooks/useAuth";
import {
  certificationsQuery,
  coursesQuery,
  resultsQuery,
  studentQuery,
  type Course,
} from "@/lib/gapzero";
import { ExternalLink, Play } from "lucide-react";

export const Route = createFileRoute("/_authenticated/student/")({
  component: StudentHome,
});

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="glass-tile rounded-2xl px-4 py-3">
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <a
      href={course.link}
      target="_blank"
      rel="noreferrer"
      className="glass-tile group flex min-w-[230px] max-w-[230px] flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative h-28 w-full overflow-hidden bg-muted">
        {course.thumbnail_url && (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute bottom-2 left-2 grid size-7 place-items-center rounded-full bg-background/85 backdrop-blur">
          <Play className="size-3.5" />
        </span>
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug">{course.title}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {course.platform} · {course.duration ?? course.area}
        </p>
      </div>
    </a>
  );
}

function StudentHome() {
  const { session } = useSession();
  const { data: profile } = useProfile(session);
  const { data: student } = useQuery(studentQuery(profile?.email));
  const { data: courses = [] } = useQuery(coursesQuery());
  const { data: certs = [] } = useQuery(certificationsQuery());
  const { data: results = [] } = useQuery(resultsQuery(profile?.email));

  const interest = student?.interest ?? "Web Dev";
  const weak = results[0]?.weak_areas ?? [];
  const recommended = [
    ...courses.filter((c) => weak.includes(c.area)),
    ...courses.filter((c) => c.area === interest && !weak.includes(c.area)),
    ...courses,
  ]
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
    .slice(0, 8);
  const recCerts = [
    ...certs.filter((c) => weak.includes(c.area) || c.area === interest),
    ...certs,
  ]
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
    .slice(0, 4);

  return (
    <>
      <section className="spectrum-edge animate-rise rounded-3xl bg-glass p-5 backdrop-blur-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Welcome back
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
          {student?.name ?? profile?.full_name ?? "Student"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {student?.course ?? "—"} · {student?.branch ?? "—"} · focused on {interest}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <Stat value={`${student?.avg_score ?? 0}%`} label="Avg score" />
          <Stat value={student?.assessments_taken ?? 0} label="Tests" />
          <Stat value={student?.internships_done ?? 0} label="Interns" />
        </div>

        {weak.length > 0 && (
          <p className="mt-4 rounded-2xl bg-glass-strong px-3.5 py-3 text-[13px] leading-snug ring-1 ring-border">
            Your last assessment flagged{" "}
            <span className="font-semibold text-primary">{weak.join(", ")}</span> as weak areas —
            the courses below target exactly that.
          </p>
        )}
      </section>

      <section>
        <div className="flex items-end justify-between px-1">
          <h2 className="text-[15px] font-bold tracking-tight">Recommended for you</h2>
          <Link
            to="/student/assess"
            className="font-mono text-[10px] uppercase tracking-wider text-primary"
          >
            Retake test
          </Link>
        </div>
        <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
          {recommended.map((c) => (
            <div key={c.id} className="snap-start">
              <CourseCard course={c} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="px-1 text-[15px] font-bold tracking-tight">Certifications to stack</h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {recCerts.map((c) => (
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
                  {c.provider} · {c.type}
                </p>
              </div>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
