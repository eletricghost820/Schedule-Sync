import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { STUDENTS, PERIOD_ORDER, isFree } from "@/data/schedule";
import { WednesdayNote } from "@/components/WednesdayNote";
import { InstallButton } from "@/components/InstallButton";

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
  const totalFree = STUDENTS.reduce(
    (n, s) =>
      n + PERIOD_ORDER.filter((p) => p !== "HR" && isFree(s.slots[p])).length,
    0,
  );
  return (
    <div className="space-y-8">
      <section className="relative -mx-4 overflow-hidden border-b border-border px-4 py-12 sm:-mx-6 sm:px-6">
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
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl">
            The Aura Crew
          </h1>
          <p className="mt-1 font-display text-2xl font-medium italic text-muted-foreground sm:text-3xl">
            Every period, every room
          </p>
          <p className="mt-1 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-primary sm:text-6xl">
            Synced up.
          </p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Full daily schedules for all {STUDENTS.length} of us — plus a free
            period finder and shared class matcher, so nobody eats lunch alone.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/free-periods"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
            >
              Find free periods <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/overlap"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide transition-colors hover:border-primary/50 hover:text-primary"
            >
              Class overlap <ArrowUpRight className="size-4" />
            </Link>
            <InstallButton />
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="flex items-center gap-2">
              <i className="size-1.5 rounded-full bg-primary" />
              {STUDENTS.length} friends tracked
            </span>
            <span className="flex items-center gap-2">
              <i className="size-1.5 rounded-full bg-free" />
              {totalFree} free periods
            </span>
            <span className="flex items-center gap-2">
              <i className="size-1.5 rounded-full bg-primary" />
              10 daily blocks
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">
          The Crew
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap a friend to see their full day, period by period.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {STUDENTS.map((s) => {
          const freeCount = PERIOD_ORDER.filter(
            (p) => p !== "HR" && isFree(s.slots[p]),
          ).length;
          return (
            <Link
              key={s.id}
              to="/student/$studentId"
              params={{ studentId: s.id }}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
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
          );
        })}
      </div>

      <WednesdayNote />
    </div>
  );
}
