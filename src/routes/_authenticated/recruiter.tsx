import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfile, useSession } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { StudentDirectory } from "@/components/StudentDirectory";
import { conversationQuery, type Student } from "@/lib/gapzero";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/recruiter")({
  head: () => ({
    meta: [
      { title: "Recruiter dashboard — GapZero" },
      {
        name: "description",
        content:
          "Browse student talent, review assessment scores and message candidates directly on GapZero.",
      },
      { property: "og:title", content: "Recruiter dashboard — GapZero" },
      {
        property: "og:description",
        content: "Find, review and message student candidates on GapZero.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecruiterDashboard,
});

function RecruiterDashboard() {
  const { session } = useSession();
  const { data: profile } = useProfile(session);
  const [chatWith, setChatWith] = useState<Student | null>(null);

  return (
    <AppShell
      roleLabel="Recruiter"
      userName={profile?.full_name ?? "Recruiter"}
      nav={[{ to: "/recruiter", label: "Talent" }]}
    >
      <StudentDirectory
        action={(s) => (
          <button
            onClick={() => setChatWith(s)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-primary ring-1 ring-primary/30"
          >
            <MessageSquare className="size-3" /> Message
          </button>
        )}
        renderPanel={(s) => (
          <button
            onClick={() => setChatWith(s)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/15 py-2.5 text-[13px] font-semibold text-primary ring-1 ring-primary/30"
          >
            <MessageSquare className="size-4" /> Message {s.name.split(" ")[0]}
          </button>
        )}
      />
      {chatWith && profile?.email && (
        <ChatSheet
          me={profile.email}
          student={chatWith}
          onClose={() => setChatWith(null)}
        />
      )}
    </AppShell>
  );
}

function ChatSheet({
  me,
  student,
  onClose,
}: {
  me: string;
  student: Student;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { data: messages = [] } = useQuery(conversationQuery(me, student.email));
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const text = body.trim();
    if (!text) return;
    setBody("");
    await supabase.from("messages").insert({
      sender_email: me,
      recipient_email: student.email,
      body: text,
    });
    void qc.invalidateQueries({ queryKey: ["conversation", me, student.email] });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/20 backdrop-blur-sm sm:items-center">
      <div className="flex h-[85vh] w-full max-w-md flex-col rounded-t-3xl bg-glass-strong ring-1 ring-border backdrop-blur-xl sm:h-[70vh] sm:rounded-3xl">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          {student.photo_url ? (
            <img src={student.photo_url} alt={student.name} className="size-9 rounded-full object-cover" />
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-muted text-xs font-bold">
              {student.name.slice(0, 1)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold">{student.name}</p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">
              {student.interest ?? "Candidate"}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close chat" className="text-muted-foreground">
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <p className="text-center font-mono text-[11px] text-muted-foreground">
              No messages yet — say hello.
            </p>
          )}
          {messages.map((m) => {
            const mine = m.sender_email === me;
            return (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${
                  mine
                    ? "ml-auto bg-foreground text-background"
                    : "bg-glass ring-1 ring-border"
                }`}
              >
                {m.body}
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div className="flex items-center gap-2 border-t border-border px-3 py-3">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Write a message…"
            className="flex-1 rounded-xl bg-glass px-3.5 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-primary/50"
          />
          <button
            onClick={send}
            aria-label="Send"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-foreground text-background"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
