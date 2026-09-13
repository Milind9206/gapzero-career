import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I'm Forge — your AI career assistant. Ask me about your skill gaps, internships, resumes, or how GapZero works.",
};

export function Forge() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/forge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? data.error ?? "Something went wrong." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I couldn't reach the network just now." },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open && (
        <div className="spectrum-edge animate-rise w-[min(21rem,calc(100vw-2rem))] rounded-3xl bg-glass p-3 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2.5 px-1 pb-2">
            <div className="grid size-8 place-items-center rounded-lg bg-foreground text-[11px] font-extrabold text-background">
              F
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold tracking-tight">Forge</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {busy ? "thinking…" : "AI career assistant"}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Forge"
              className="ml-auto grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="max-h-[min(22rem,50vh)] space-y-2 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "assistant"
                    ? "ml-1 max-w-[88%] rounded-2xl rounded-tl-md bg-glass-strong px-3 py-2 text-[13px] leading-snug"
                    : "ml-auto mr-1 max-w-[88%] rounded-2xl rounded-tr-md bg-foreground px-3 py-2 text-[13px] leading-snug text-background"
                }
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="ml-1 flex w-16 justify-center gap-1 rounded-2xl rounded-tl-md bg-glass-strong px-3 py-3">
                <span className="size-1.5 animate-blink rounded-full bg-muted-foreground" />
                <span className="size-1.5 animate-blink rounded-full bg-muted-foreground [animation-delay:120ms]" />
                <span className="size-1.5 animate-blink rounded-full bg-muted-foreground [animation-delay:240ms]" />
              </div>
            )}
          </div>

          <form
            onSubmit={send}
            className="mt-2 flex items-center gap-2 rounded-xl bg-glass-strong px-3 py-2 ring-1 ring-border"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Forge…"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={busy}
              aria-label="Send"
              className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="spectrum-edge flex items-center gap-2 rounded-full bg-foreground py-3 pl-3.5 pr-4 text-sm font-bold text-background shadow-xl transition-transform hover:-translate-y-0.5"
        >
          <Sparkles className="size-4" />
          Forge
        </button>
      )}
    </div>
  );
}
