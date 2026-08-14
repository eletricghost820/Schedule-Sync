import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import {
  PERIOD_LABEL,
  type PeriodId,
  type Slot,
  isFreeName,
  bellTimesForDate,
} from "@/data/schedule";
import {
  bellStatusAt,
  formatCountdown,
  type BellStatus,
} from "@/lib/bell";
import { useAllStudents } from "@/lib/community";
import { useHydrated } from "@/hooks/useHydrated";

const ME_KEY = "schedule-sync-me";

function slotLabel(slot: Slot | undefined): string | null {
  if (!slot) return null;
  return slot.alt ? `${slot.className} / ${slot.alt.className}` : slot.className;
}

function SlotLine({ slot }: { slot: Slot | undefined }) {
  const label = slotLabel(slot);
  if (!label) return <p className="text-sm text-muted-foreground">No class listed</p>;
  const free = isFreeName(slot!.className);
  return (
    <div>
      <p
        className={`font-display text-lg font-bold leading-tight ${free ? "text-free" : ""}`}
      >
        {label}
      </p>
      <p className="text-xs text-muted-foreground">
        {slot!.teacher} · Room {slot!.room}
        {slot!.days ? ` · ${slot!.days}` : ""}
      </p>
    </div>
  );
}

function headline(status: BellStatus) {
  switch (status.kind) {
    case "in-class":
      return "Now";
    case "passing":
      return "Passing period";
    case "before-school":
      return "Before school";
    case "after-school":
      return "School's out";
    case "weekend":
      return "Weekend";
  }
}

export function NextClassCountdown() {
  const hydrated = useHydrated();
  const { students } = useAllStudents();
  const [now, setNow] = useState(() => new Date());
  const [meId, setMeId] = useState<string>("");

  useEffect(() => {
    const id = window.localStorage.getItem(ME_KEY);
    if (id) setMeId(id);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const me = useMemo(
    () => students.find((s) => s.id === meId),
    [students, meId],
  );

  const status = useMemo(() => bellStatusAt(now), [now]);
  const day = now.getDay();
  const isWednesday = day === 3;
  const times = bellTimesForDate(now);

  function pick(id: string) {
    setMeId(id);
    if (id) window.localStorage.setItem(ME_KEY, id);
    else window.localStorage.removeItem(ME_KEY);
  }

  const currentPeriod: PeriodId | null =
    status.kind === "in-class" ? status.current.period : null;
  const nextPeriod: PeriodId | null =
    status.kind === "in-class"
      ? (status.next?.period ?? null)
      : status.kind === "passing" || status.kind === "before-school"
        ? status.next.period
        : null;

  const countdown =
    status.kind === "in-class"
      ? { label: "Ends in", value: formatCountdown(status.endsIn) }
      : status.kind === "passing" || status.kind === "before-school"
        ? { label: "Starts in", value: formatCountdown(status.startsIn) }
        : null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          <Clock className="size-3.5" /> {hydrated ? headline(status) : "Bell schedule"}
        </span>
        {hydrated && isWednesday ? (
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            Wednesday · shortened
          </span>
        ) : null}
        <select
          value={meId}
          onChange={(e) => pick(e.target.value)}
          className="ml-auto rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold"
          aria-label="Pick your name to personalize the countdown"
        >
          <option value="">Pick your name</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {!hydrated ? (
        <p className="mt-4 text-sm text-muted-foreground">Checking the bell…</p>
      ) : countdown ? (
        <>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {countdown.label}
            </p>
            <p className="mt-1 font-display text-5xl font-extrabold leading-none tabular-nums text-primary sm:text-6xl">
              {countdown.value}
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {currentPeriod ? (
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {PERIOD_LABEL[currentPeriod]} · {times[currentPeriod]}
                </p>
                <div className="mt-1">
                  {me ? (
                    <SlotLine slot={me.slots[currentPeriod]} />
                  ) : (
                    <p className="font-display text-lg font-bold">In session</p>
                  )}
                </div>
              </div>
            ) : null}

            {nextPeriod ? (
              <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Up next · {PERIOD_LABEL[nextPeriod]} · {times[nextPeriod]}
                </p>
                <div className="mt-1">
                  {me ? (
                    <SlotLine slot={me.slots[nextPeriod]} />
                  ) : (
                    <p className="font-display text-lg font-bold">
                      {PERIOD_LABEL[nextPeriod]}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="font-display text-lg font-bold">Last block of the day</p>
                <p className="text-xs text-muted-foreground">No period after this one.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {status.kind === "weekend" || status.kind === "after-school"
            ? `${status.kind === "weekend" ? "No bells today" : "The day is done"} — first period rings ${status.nextDay} at ${status.firstBell}.`
            : null}
        </p>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground">
        {isWednesday
          ? "Using the shortened Wednesday bells — first period at 9:40 AM, no homeroom."
          : "Using the standard Mon/Tue/Thu/Fri bells. Wednesdays run a shortened schedule."}
      </p>
    </section>
  );
}
