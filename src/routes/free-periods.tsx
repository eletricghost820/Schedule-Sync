import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BELL_TIMES,
  PERIOD_LABEL,
  PERIOD_ORDER,
  isFree,
  isPartiallyFree,
} from "@/data/schedule";
import { useAllStudents } from "@/lib/community";
import { WednesdayNote } from "@/components/WednesdayNote";
import { ShareScheduleButton } from "@/components/ShareScheduleButton";

const title = "Free Period Finder — Schedule Sync";
const description =
  "Color-coded matrix of all six friends across periods 1–9 plus homeroom, highlighting periods where two or more are free.";

export const Route = createFileRoute("/free-periods")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: FreePeriods,
});

function FreePeriods() {
  const { students } = useAllStudents();
  const shareRef = useRef<HTMLDivElement>(null);
  const rows = PERIOD_ORDER.map((p) => {
    const cells = students.map((s) => {
      const slot = s.slots[p];
      const free = p !== "HR" && isFree(slot);
      return {
        student: s,
        slot,
        free,
        partial: free && isPartiallyFree(slot),
      };
    });
    const freeNames = cells.filter((c) => c.free).map((c) => c.student.name.split(" ")[0]);
    return { period: p, cells, freeNames };
  });

  return (
    <div ref={shareRef} className="space-y-4">
      <section>
        <h1 className="text-2xl font-bold">Free Period Finder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Green = Lunch or Study Hall. Rows with 2+ free friends are highlighted.
        </p>
        <ShareScheduleButton
          targetRef={shareRef}
          fileName="free-period-finder"
          shareTitle="Free Period Finder"
          className="mt-3"
        />
      </section>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Legend className="bg-free-soft text-free-foreground" label="Free" />
        <Legend className="bg-partial-soft text-partial-foreground" label="Free some days" />
        <Legend className="bg-busy-soft text-busy-foreground" label="In class" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[520px] border-collapse text-center text-xs">
          <thead>
            <tr className="bg-secondary text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="sticky left-0 z-10 bg-secondary px-3 py-2 text-left font-semibold">
                Period
              </th>
              {students.map((s) => (
                <th key={s.id} className="px-2 py-2 font-semibold">
                  {s.initials}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ period, cells, freeNames }) => {
              const overlap = freeNames.length >= 2;
              return (
                <tr
                  key={period}
                  className={`border-t border-border ${overlap ? "bg-free-soft/40" : ""}`}
                >
                  <th
                    className={`sticky left-0 z-10 px-3 py-2 text-left font-medium ${
                      overlap ? "bg-free-soft/60" : "bg-card"
                    }`}
                  >
                    <div className="font-display font-bold">{PERIOD_LABEL[period]}</div>
                    <div className="text-[10px] font-normal text-muted-foreground">
                      {BELL_TIMES[period]}
                    </div>
                  </th>
                  {cells.map((c) => (
                    <td key={c.student.id} className="p-1">
                      <div
                        title={c.slot ? `${c.student.name}: ${c.slot.className}` : ""}
                        className={`rounded-md px-1 py-2 text-[10px] font-semibold leading-tight ${
                          c.partial
                            ? "bg-partial-soft text-partial-foreground"
                            : c.free
                              ? "bg-free-soft text-free-foreground"
                              : "bg-busy-soft text-busy-foreground"
                        }`}
                      >
                        {c.slot ? c.slot.className : "—"}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Overlapping free time</h2>
        {rows.filter((r) => r.freeNames.length >= 2).length === 0 ? (
          <p className="text-sm text-muted-foreground">No shared free periods.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {rows
              .filter((r) => r.freeNames.length >= 2)
              .map((r) => (
                <div
                  key={r.period}
                  className="rounded-lg border border-free/40 bg-free-soft/50 px-3 py-2 text-sm"
                >
                  <span className="font-display font-bold">{PERIOD_LABEL[r.period]}</span>
                  <span className="text-muted-foreground"> · {BELL_TIMES[r.period]}</span>
                  <div className="text-free-foreground">
                    {r.freeNames.length} free: {r.freeNames.join(", ")}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      <WednesdayNote />
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block size-3 rounded ${className}`} />
      {label}
    </span>
  );
}