import { createFileRoute } from "@tanstack/react-router";
import { useProfile, useSession } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { StudentDirectory } from "@/components/StudentDirectory";

export const Route = createFileRoute("/_authenticated/college")({
  head: () => ({
    meta: [
      { title: "College dashboard — GapZero" },
      {
        name: "description",
        content:
          "Track every student's profile, assessment history and resume from one GapZero college dashboard.",
      },
      { property: "og:title", content: "College dashboard — GapZero" },
      {
        property: "og:description",
        content: "Student profiles, assessment history and resumes in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollegeDashboard,
});

function CollegeDashboard() {
  const { session } = useSession();
  const { data: profile } = useProfile(session);

  return (
    <AppShell
      roleLabel="College"
      userName={profile?.full_name ?? "College"}
      nav={[{ to: "/college", label: "Students" }]}
    >
      <StudentDirectory />
    </AppShell>
  );
}
