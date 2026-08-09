import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminRequest, type TrashItem } from "@/lib/admin-api";
import { useAdminMode } from "@/hooks/useAdminMode";

const WEEK = 7 * 24 * 60 * 60 * 1000;

function daysLeft(deletedAt: string) {
  const ms = new Date(deletedAt).getTime() + WEEK - Date.now();
  if (ms <= 0) return "deleting now";
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  return `${days} day${days === 1 ? "" : "s"} left`;
}

/** Admin-only recycle bin. Removed schedules sit here for one week. */
export function TrashSection({ onChange }: { onChange?: () => void }) {
  const { admin, password } = useAdminMode();
  const [items, setItems] = useState<TrashItem[] | null>(null);

  const load = useCallback(async () => {
    if (!password) return;
    try {
      const res = await adminRequest({ password, action: "trash" });
      if (res.ok) setItems(res.items ?? []);
    } catch {
      /* ignore */
    }
  }, [password]);

  useEffect(() => {
    if (admin) void load();
  }, [admin, load]);

  if (!admin) return null;

  async function act(action: "restore" | "purge", item: TrashItem) {
    if (!password) return;
    try {
      const res = await adminRequest({ password, action, id: item.id });
      if (!res.ok) {
        toast.error("Admin password no longer valid");
        return;
      }
      toast.success(action === "restore" ? `Restored ${item.name}` : `Deleted ${item.name}`);
      await load();
      onChange?.();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-center gap-2">
        <Trash2 className="size-4 text-destructive" />
        <h2 className="font-display text-base font-bold uppercase tracking-tight">Trash</h2>
        <span className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Admin only · auto-deletes after 7 days
        </span>
      </div>

      {items === null ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Trash is empty.</p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-display text-xs font-bold">
                {item.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{item.name}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {daysLeft(item.deleted_at)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => void act("restore", item)}
                title="Restore"
                className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:text-primary"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => void act("purge", item)}
                title="Delete forever"
                className="rounded-full border border-destructive/50 p-1.5 text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
