import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, RefreshCw } from "lucide-react";
import { adminRequest, type VisitRow } from "@/lib/admin-api";
import { useAdminMode } from "@/hooks/useAdminMode";

export const Route = createFileRoute("/admin-tools")({
  component: VisitorsPage,
  head: () => ({
    meta: [
      { title: "Visitor Log · Schedule Sync" },
      { name: "description", content: "Admin-only log of who opened Schedule Sync and when." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Visitor Log · Schedule Sync" },
      { property: "og:description", content: "Admin-only log of who opened Schedule Sync and when." },
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

function VisitorsPage() {
  const { admin, password } = useAdminMode();
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(pw: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await adminRequest({ password: pw, action: "visits" });
      if (!res.ok) throw new Error(res.error ?? "Not allowed");
      setRows(res.visits ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the log");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (password) void load(password);
  }, [password]);

  if (!admin) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <h1 className="font-display text-xl font-bold">Admin only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Unlock admin mode to see the visitor log.
        </p>
      </div>
    );
  }

  const named = rows.filter((r) => r.name).length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          <Users className="mr-2 inline size-6 text-primary" />
          Visitor log
        </h1>
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
      <p className="mt-1 text-sm text-muted-foreground">
        {rows.length} visits · {named} with a name · newest first (last 500)
      </p>

      {error ? (
        <p className="mt-4 text-sm font-semibold text-destructive">{error}</p>
      ) : null}

      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="font-display text-sm font-bold">
              {r.name ?? "Anonymous"}
            </span>
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
    </div>
  );
}
