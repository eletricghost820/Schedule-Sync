import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BELL_TIMES,
  PERIOD_LABEL,
  PERIOD_ORDER,
  PERIOD_SHORT,
  STUDENTS,
  classKey,
  type PeriodId,
  type Student,
} from "@/data/schedule";
import { WednesdayNote } from "@/components/WednesdayNote";

const title = "Class Overlap — Schedule Sync";
const description =
  "Pick a period and see which friends share the same class, teacher, and room during it.";

export const Route = createFileRoute("/overlap")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Overlap,
});

type Entry = { student: Student; teacher: string; room: string; days?: string | undefined };

/** Homeroom shown last in the period picker. */
const PICKER_ORDER: PeriodId[] = [...PERIOD_ORDER.filter((p) => p !== "HR"), "HR"];

function Overlap() {
  const [period, setPeriod] = useState<PeriodId>("01");

  const groups = new Map<string, { label: string; entries: Entry[] }>();
  for (const student of STUDENTS) {
    const slot = student.slots[period];
    if (!slot) continue;
    const arrangements = [
      { className: slot.className, teacher: slot.teacher, room: slot.room, days: slot.days },
      ...(slot.alt ? [slot.alt] : []),
    ];
    for (const a of arrangements) {
      const key = classKey(a.className);
      const g = groups.get(key) ?? { label: a.className, entries: [] };
      g.entries.push({ student, teacher: a.teacher, room: a.room, days: a.days });
      groups.set(key, g);
    }
  }

  const sorted = [...groups.values()].sort((a, b) => b.entries.length - a.entries.length);
  const shared = sorted.filter((g) => g.entries.length > 1);
  const solo = sorted.filter((g) => g.entries.length === 1);

  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-2xl font-bold">Class Overlap</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a period to see who&rsquo;s together.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {PICKER_ORDER.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`min-w-11 rounded-lg border px-3 py-2 font-display text-sm font-bold transition-colors ${
              p === period
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50"
            }`}
          >
            {PERIOD_SHORT[p]}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-secondary px-3 py-2 text-sm">
        <span className="font-display font-bold">{PERIOD_LABEL[period]}</span>
        <span className="text-muted-foreground"> · {BELL_TIMES[period]}</span>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Shared classes</h2>
        {shared.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nobody shares a class this period — everyone&rsquo;s on their own.
          </p>
        ) : (
          shared.map((g) => <GroupCard key={g.label} label={g.label} entries={g.entries} shared />)
        )}
      </section>

      {solo.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Solo</h2>
          {solo.map((g) => (
            <GroupCard key={g.label} label={g.label} entries={g.entries} />
          ))}
        </section>
      ) : null}

      <WednesdayNote />
    </div>
  );
}

function GroupCard({
  label,
  entries,
  shared,
}: {
  label: string;
  entries: Entry[];
  shared?: boolean;
}) {
  const teachers = [...new Set(entries.map((e) => `${e.teacher} · ${e.room}`))];
  return (
    <div
      className={`rounded-xl border bg-card p-3 shadow-sm ${
        shared ? "border-primary/40" : "border-border"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-bold">{label}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            shared ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          {entries.length} {entries.length === 1 ? "friend" : "friends"}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{teachers.join("  |  ")}</p>
      <ul className="mt-2 space-y-1">
        {entries.map((e) => (
          <li key={e.student.id + e.teacher}>
            <Link
              to="/student/$studentId"
              params={{ studentId: e.student.id }}
              className="flex items-center gap-2 text-sm hover:text-primary"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                {e.student.initials}
              </span>
              <span className="font-medium">{e.student.name}</span>
              {e.days ? (
                <span className="text-xs text-muted-foreground">({e.days})</span>
              ) : null}
              <span className="ml-auto text-xs text-muted-foreground">{e.room}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}