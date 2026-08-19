import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, RefreshCw, Bug, Lightbulb, Check, Trash2 } from "lucide-react";
import { adminRequest, type VisitRow, type FeedbackRow } from "@/lib/admin-api";
import { useAdminMode } from "@/hooks/useAdminMode";

export const Route = createFileRoute("/admin-tools")({
  component: AdminToolsPage,
  head: () => ({
    meta: [
      { title: "Admin Tools · Schedule Sync" },
      {
        name: "description",
        content: "Admin-only tools: the visitor log plus submitted bug reports and feature ideas.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Tools · Schedule Sync" },
      {
        property: "og:description",
        content: "Admin-only tools: the visitor log plus submitted bug reports and feature ideas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function when(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function device(ua: string | null) {
  if (!ua) return "Unknown device";
  if (/iPhone|iPad/i.test(ua)) return "iPhone / iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  return "Other";
}

function AdminToolsPage() {
  const { admin, password } = useAdminMode();
  const [tab, setTab] = useState<"visitors" | "suggestions">("visitors");
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(pw: string) {
    setBusy(true);
    setError(null);
    try {
      const [visits, fb] = await Promise.all([
        adminRequest({ password: pw, action: "visits" }),
        adminRequest({ password: pw, action: "feedback" }),
      ]);
      if (!visits.ok || !fb.ok) throw new Error(visits.error ?? fb.error ?? "Not allowed");
      setRows(visits.visits ?? []);
      setFeedback(fb.feedback ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load admin data");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (password) void load(password);
  }, [password]);

  async function act(action: "feedback_toggle" | "feedback_delete", id: string) {
    if (!password) return;
    await adminRequest({ password, action, id });
    await load(password);
  }

  if (!admin) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <h1 className="font-display text-xl font-bold">Admin only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Unlock admin mode to use the admin tools.
        </p>
      </div>
    );
  }

  const named = rows.filter((r) => r.name).length;
  const openCount = feedback.filter((f) => !f.resolved).length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Admin tools</h1>
        <button
          type="button"
          onClick={() => password && load(password)}
          disabled={busy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mt-4 flex gap-2 rounded-full border border-border bg-card p-1">
        {(
          [
            { id: "visitors", label: `Visitors (${rows.length})`, Icon: Users },
            { id: "suggestions", label: `Suggestions (${openCount})`, Icon: Lightbulb },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
              tab === id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm font-semibold text-destructive">{error}</p> : null}

      {tab === "visitors" ? (
        <section className="mt-4">
          <p className="text-sm text-muted-foreground">
            {rows.length} visits · {named} with a name · newest first (last 500)
          </p>
          <ul className="mt-4 space-y-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="font-display text-sm font-bold">{r.name ?? "Anonymous"}</span>
                <span className="text-xs text-muted-foreground">
                  {device(r.user_agent)} · {r.path ?? "/"}
                </span>
                <span className="ml-auto text-xs font-semibold tabular-nums text-primary">
                  {when(r.created_at)}
                </span>
              </li>
            ))}
          </ul>
          {!busy && !rows.length && !error ? (
            <p className="mt-6 text-sm text-muted-foreground">No visits logged yet.</p>
          ) : null}
        </section>
      ) : (
        <section className="mt-4">
          <p className="text-sm text-muted-foreground">
            {feedback.length} submissions · {openCount} still open
          </p>
          <ul className="mt-4 space-y-2">
            {feedback.map((f) => (
              <li
                key={f.id}
                className={`rounded-xl border border-border bg-card px-4 py-3 ${
                  f.resolved ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      f.kind === "bug"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {f.kind === "bug" ? <Bug className="size-3" /> : <Lightbulb className="size-3" />}
                    {f.kind === "bug" ? "Bug" : "Feature"}
                  </span>
                  <span className="font-display text-sm font-bold">{f.name ?? "Anonymous"}</span>
                  <span className="ml-auto text-xs font-semibold tabular-nums text-muted-foreground">
                    {when(f.created_at)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{f.message}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void act("feedback_toggle", f.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                  >
                    <Check className="size-3" />
                    {f.resolved ? "Reopen" : "Mark done"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void act("feedback_delete", f.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-destructive/50 bg-destructive/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-destructive"
                  >
                    <Trash2 className="size-3" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {!busy && !feedback.length && !error ? (
            <p className="mt-6 text-sm text-muted-foreground">No suggestions yet.</p>
          ) : null}
        </section>
      )}
    </div>
  );
}
