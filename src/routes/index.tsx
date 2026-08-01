import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { STUDENTS, PERIOD_ORDER, isFree } from "@/data/schedule";
import { WednesdayNote } from "@/components/WednesdayNote";

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
  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-bold">The Aura Crew</h1>
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
