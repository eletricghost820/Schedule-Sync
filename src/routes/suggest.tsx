import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bug, Lightbulb, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ME_KEY } from "@/lib/visits";

const title = "Suggest a Feature · Schedule Sync";
const description =
  "Report a bug or suggest a new feature for Schedule Sync — send it straight to the admins.";

export const Route = createFileRoute("/suggest")({
  component: SuggestPage,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function SuggestPage() {
  const [kind, setKind] = useState<"bug" | "feature">("feature");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text) {
      toast.error("Type something first");
      return;
    }
    setBusy(true);
    try {
      let visitorId: string | null = null;
      try {
        visitorId = localStorage.getItem(ME_KEY);
      } catch {
        visitorId = null;
      }
      const { error } = await supabase.from("feedback").insert({
        kind,
        message: text.slice(0, 2000),
        name: name.trim() ? name.trim().slice(0, 60) : null,
        visitor_id: visitorId,
      });
      if (error) throw error;
      setSent(true);
      setMessage("");
      toast.success(kind === "bug" ? "Bug report sent" : "Suggestion sent");
    } catch {
      toast.error("Could not send that — try again");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h1 className="mt-3 font-display text-xl font-bold">Thanks!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your {kind === "bug" ? "bug report" : "suggestion"} was sent to the admins.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-primary-foreground"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">
        Suggest a feature
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Found something broken or have an idea? Let us know.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            What is this?
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(
              [
                { value: "bug", label: "Bug report", Icon: Bug },
                { value: "feature", label: "Feature idea", Icon: Lightbulb },
              ] as const
            ).map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${
                  kind === value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`size-5 ${kind === value ? "text-primary" : ""}`} />
                <span className="font-display text-sm font-bold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="fb-message" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {kind === "bug" ? "What went wrong?" : "What should we add?"}
          </label>
          <textarea
            id="fb-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={2000}
            placeholder={
              kind === "bug"
                ? "Describe the bug and what you were doing when it happened…"
                : "Describe your idea…"
            }
            className="mt-2 w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          />
          <p className="mt-1 text-right text-[11px] text-muted-foreground">
            {message.length}/2000
          </p>
        </div>

        <div>
          <label htmlFor="fb-name" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your name (optional)
          </label>
          <input
            id="fb-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Anonymous"
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-50"
        >
          <Send className="size-4" />
          {busy ? "Sending…" : "Send it"}
        </button>
      </form>
    </div>
  );
}