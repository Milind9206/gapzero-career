import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProfile, useSession } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { studentQuery } from "@/lib/gapzero";

export const Route = createFileRoute("/_authenticated/student")({
  component: StudentLayout,
});

function StudentLayout() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { data: profile } = useProfile(session);
  const { data: student } = useQuery(studentQuery(profile?.email));

  useEffect(() => {
    if (profile && !profile.onboarded) navigate({ to: "/onboarding" });
  }, [profile, navigate]);

  return (
    <AppShell
      roleLabel="Student"
      userName={student?.name ?? profile?.full_name ?? "Student"}
      photoUrl={student?.photo_url ?? null}
      nav={[
        { to: "/student", label: "Home" },
        { to: "/student/internships", label: "Interns" },
        { to: "/student/jobs", label: "Jobs" },
        { to: "/student/assess", label: "Assess" },
      ]}
    >
      <Outlet />
    </AppShell>
  );
}
