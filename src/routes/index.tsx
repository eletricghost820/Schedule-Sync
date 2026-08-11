import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PERIOD_ORDER, isFree } from "@/data/schedule";
import { WednesdayNote } from "@/components/WednesdayNote";
import { InstallButton } from "@/components/InstallButton";
import { AdminControl } from "@/components/AdminControl";
import { TrashSection } from "@/components/TrashSection";
import { NextClassCountdown } from "@/components/NextClassCountdown";
import { useAdminMode } from "@/hooks/useAdminMode";
import { isCommunityStudent, useAllStudents, useRefreshCommunity } from "@/lib/community";
import { adminRequest } from "@/lib/admin-api";

const title = "Schedule Sync — Shared Class Schedules";
const description =
  "View all six friends' daily class schedules, find overlapping free periods, and see which classes you share.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  const { students } = useAllStudents();
  const { admin, password } = useAdminMode();
  const refresh = useRefreshCommunity();
  const [trashTick, setTrashTick] = useState(0);

  async function handleRemove(s: (typeof students)[number]) {
    if (!password) return;
    const community = isCommunityStudent(s);
    try {
      const res = await adminRequest({
        password,
        action: community ? "remove" : "hide",
        id: community ? s.rowId : s.id,
        name: s.name,
        initials: s.initials,
      });
      if (!res.ok) {
        toast.error("Admin password no longer valid");
        return;
      }
      await refresh();
      setTrashTick((n) => n + 1);
      toast.success(`Moved ${s.name} to trash`);
    } catch {
      toast.error("Could not remove that schedule");
    }
  }

  return (
    <div className="space-y-8">
      <section className="relative -mx-4 overflow-hidden border-b border-border px-4 py-12 sm:-mx-6 sm:px-6 lg:rounded-3xl lg:border lg:px-12 lg:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(120% 90% at 85% 0%, color-mix(in oklab, var(--primary) 38%, transparent) 0%, transparent 60%), radial-gradient(90% 70% at 0% 100%, color-mix(in oklab, var(--primary) 20%, transparent) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(70% 60% at 50% 40%, black, transparent 100%)",
          }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Class of 2030
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            Schedule
          </h1>
          <p className="mt-1 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-primary sm:text-6xl lg:text-7xl xl:text-8xl">
            Sync
          </p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base lg:max-w-xl lg:text-lg">
            Full daily schedules for all {students.length} of us — plus a shared
            class matcher, so nobody eats lunch alone.
          </p>

          <div className="mt-7 flex w-full max-w-xs flex-col items-stretch gap-3">
            <Link
              to="/overlap"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
            >
              Class overlap <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/add-schedule"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold uppercase tracking-wide text-foreground transition-transform hover:-translate-y-0.5"
            >
              Add yours <Plus className="size-4" />
            </Link>
            <InstallButton className="w-full justify-center px-6" />
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:gap-x-10 lg:text-xs">
            <span className="flex items-center gap-2">
              <i className="size-1.5 rounded-full bg-primary" />
              {students.length} friends tracked
            </span>
            <span className="flex items-center gap-2">
              <i className="size-1.5 rounded-full bg-primary" />
              9 daily periods
            </span>
          </div>
        </div>
      </section>

      <NextClassCountdown />

      <section>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">
            The Crew
          </h2>
          <div className="ml-auto">
            <AdminControl />
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap a friend to see their full day, period by period.
          {admin
            ? " Admin mode is on — removed schedules go to trash for 7 days."
            : ""}
        </p>
      </section>

      {admin ? <TrashSection key={trashTick} onChange={() => void refresh()} /> : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {students.map((s) => {
          const freeCount = PERIOD_ORDER.filter(
            (p) => p !== "HR" && isFree(s.slots[p]),
          ).length;
          return (
            <div key={s.id} className="relative">
              <Link
                to="/student/$studentId"
                params={{ studentId: s.id }}
                className="group flex h-full flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                  {s.initials}
                </span>
                <span className="mt-3 font-display text-base font-bold leading-tight">
                  {s.name}
                </span>
                <span className="mt-1 flex items-center text-xs text-muted-foreground">
                  {freeCount} free {freeCount === 1 ? "period" : "periods"}
                  <ChevronRight className="ml-auto size-4 text-primary transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              {admin ? (
                <button
                  type="button"
                  onClick={() => void handleRemove(s)}
                  className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-destructive/50 bg-destructive/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-destructive"
                >
                  <Trash2 className="size-3" /> Remove
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <WednesdayNote />
    </div>
  );
}
