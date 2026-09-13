import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are Forge, the AI career assistant inside GapZero — a platform that helps students close their skill gaps.
You answer questions about the platform (dashboards for students, colleges and recruiters; self-assessments; recommended courses; internships; jobs; resume tailoring) and give practical, encouraging career advice for students in India.
Keep answers short: 2-4 sentences, plain language, no markdown headings. Be concrete and actionable.`;

export const Route = createFileRoute("/api/forge")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: ChatMessage[] };
        const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
        if (messages.length === 0) {
          return Response.json({ error: "No messages" }, { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return Response.json({ error: "AI is not configured yet." }, { status: 500 });
        }

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "google/gemini-3.8-flash",
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Forge gateway error", res.status, text);
          const message =
            res.status === 429
              ? "Forge is getting a lot of questions right now — try again in a moment."
              : res.status === 402
                ? "Forge is out of AI credits. Add credits to keep chatting."
                : "Forge could not answer that right now.";
          return Response.json({ error: message }, { status: res.status });
        }

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const reply = data.choices?.[0]?.message?.content?.trim();
        return Response.json({ reply: reply || "I'm not sure about that one — try rephrasing?" });
      },
    },
  },
});
