import { useBellTimesForDay } from "@/lib/useTodayBells";
import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PERIOD_LABEL,
  PERIOD_ORDER,
  classKey,
  isFreeName,
  slotForDay,
  type PeriodId,
  type Slot,
  type Student,
} from "@/data/schedule";
import { useAllStudents } from "@/lib/community";
import { WednesdayNote } from "@/components/WednesdayNote";
import { ShareScheduleButton } from "@/components/ShareScheduleButton";
import { DayPicker } from "@/components/DayPicker";
import { useSelectedDay } from "@/lib/useDay";
import { identify } from "@/lib/visits";

const title = "Class Overlap — Schedule Sync";
const description =
  "Pick your name and see, period by period, who shares each of your classes.";

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

type Match = { student: Student; teacher: string; room: string; days?: string | undefined };

function arrangements(slot: Slot) {
  return [
    { className: slot.className, teacher: slot.teacher, room: slot.room, days: slot.days },
    ...(slot.alt ? [slot.alt] : []),
  ];
}

function Overlap() {
  const { students, isLoading } = useAllStudents();
  const [meId, setMeId] = useState<string>("");
  const shareRef = useRef<HTMLDivElement>(null);
  const { day, setDay, today } = useSelectedDay();
  const { times } = useBellTimesForDay(day);

  const me = students.find((s) => s.id === meId);

  const rows = useMemo(() => {
    if (!me) return [];
    return PERIOD_ORDER.filter((period) => times[period]).map((period) => {
      const slot = slotForDay(me.slots[period], day);
      const mine = slot ? arrangements(slot) : [];
      const blocks = mine.map((a) => {
        const matches: Match[] = [];
        for (const other of students) {
          if (other.id === me.id) continue;
          const os = slotForDay(other.slots[period], day);
          if (!os) continue;
          for (const b of arrangements(os)) {
            if (classKey(b.className) === classKey(a.className)) {
              matches.push({ student: other, teacher: b.teacher, room: b.room, days: b.days });
              break;
            }
          }
        }
        return { ...a, matches };
      });
      return { period, blocks };
    });
  }, [me, students, day, times]);

  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-2xl font-bold">Class Overlap</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick your name to see who&rsquo;s in each of your classes.
        </p>
      </section>

      <label className="block max-w-sm space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Your name
        </span>
        <select
          value={meId}
          onChange={(e) => {
            const id = e.target.value;
            setMeId(id);
            const picked = students.find((s) => s.id === id);
            if (picked) identify(picked.name, picked.id);
          }}
          className="w-full rounded-xl border border-border bg-card px-3 py-3 text-base font-medium text-foreground outline-none focus:border-primary"
        >
          <option value="">
            {isLoading ? "Loading names…" : "Select your name…"}
          </option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <DayPicker day={day} onChange={setDay} today={today} />

      {!me ? (
        <p className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
          Choose your name above. Don&rsquo;t see it?{" "}
          <Link to="/add-schedule" className="font-semibold text-primary">
            Add your schedule
          </Link>
          .
        </p>
      ) : (
        <section ref={shareRef} className="space-y-3">
          <div className="flex items-center justify-between gap-2" data-share-hide>
            <span className="text-sm text-muted-foreground">{me.name}&rsquo;s overlaps</span>
            <ShareScheduleButton
              targetRef={shareRef}
              fileName={`${me.name.replace(/\s+/g, "-").toLowerCase()}-class-overlap`}
              shareTitle={`${me.name}'s class overlaps`}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ period, blocks }) => (
            <div key={period} className="h-full rounded-xl border border-border bg-card p-3 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-sm font-bold">{PERIOD_LABEL[period]}</span>
                <span className="text-[11px] text-muted-foreground">{times[period]}</span>
              </div>

              {blocks.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">No class this period.</p>
              ) : (
                blocks.map((b) => (
                  <div key={b.className + b.teacher} className="mt-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold">
                        {b.className}
                        {b.days ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            ({b.days})
                          </span>
                        ) : null}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          b.matches.length > 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {b.matches.length > 0 ? `+${b.matches.length}` : "just you"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Room {b.room}</span>
                      {" · "}
                      {b.teacher}
                      <span className="ml-1 text-[10px] uppercase tracking-wide">(yours)</span>
                    </p>

                    {b.matches.length === 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isFreeName(b.className)
                          ? "Free period — nobody else is free with you here."
                          : "No overlap — nobody else has this class."}
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-1.5">
                        {b.matches.map((m) => {
                          const same = m.room === b.room && m.teacher === b.teacher;
                          return (
                            <li key={m.student.id}>
                              <Link
                                to="/student/$studentId"
                                params={{ studentId: m.student.id }}
                                className="flex items-start gap-2 rounded-lg border border-border/60 bg-background/40 p-2 text-sm hover:border-primary/50 hover:text-primary"
                              >
                                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                                  {m.student.initials}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block font-medium">{m.student.name}</span>
                                  <span className="block text-xs text-muted-foreground">
                                    Room {m.room} · {m.teacher}
                                  </span>
                                </span>
                                <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                    same
                                      ? "bg-primary/15 text-primary"
                                      : "bg-destructive/15 text-destructive"
                                  }`}
                                >
                                  {same ? "Same room" : "Different room"}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          ))}
          </div>
        </section>
      )}

      <WednesdayNote />
    </div>
  );
}
