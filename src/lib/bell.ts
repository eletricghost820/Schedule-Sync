import { BELL_TIMES, PERIOD_ORDER, type PeriodId } from "@/data/schedule";

export type BellBlock = { period: PeriodId; start: number; end: number };

function parseClock(raw: string, fallbackMeridiem: "AM" | "PM"): number {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return 0;
  let hour = Number(m[1]);
  const min = Number(m[2]);
  const mer = (m[3]?.toUpperCase() as "AM" | "PM" | undefined) ?? fallbackMeridiem;
  if (mer === "PM" && hour !== 12) hour += 12;
  if (mer === "AM" && hour === 12) hour = 0;
  return hour * 60 + min;
}

/** Minutes-from-midnight blocks derived from the reference bell schedule. */
export const BELL_BLOCKS: BellBlock[] = PERIOD_ORDER.map((period) => {
  const [rawStart = "", rawEnd = ""] = BELL_TIMES[period].split(/[–-]/);
  const endMer = /PM/i.test(rawEnd) ? "PM" : "AM";
  return {
    period,
    start: parseClock(rawStart, endMer),
    end: parseClock(rawEnd, endMer),
  };
}).sort((a, b) => a.start - b.start);

export const FIRST_BLOCK = BELL_BLOCKS[0]!;
export const LAST_BLOCK = BELL_BLOCKS[BELL_BLOCKS.length - 1]!;

export type BellStatus =
  | { kind: "in-class"; current: BellBlock; next?: BellBlock; endsIn: number }
  | { kind: "passing"; next: BellBlock; startsIn: number }
  | { kind: "before-school"; next: BellBlock; startsIn: number }
  | { kind: "after-school" }
  | { kind: "weekend" };

export function bellStatusAt(now: Date): BellStatus {
  const day = now.getDay();
  if (day === 0 || day === 6) return { kind: "weekend" };

  const mins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  for (let i = 0; i < BELL_BLOCKS.length; i++) {
    const block = BELL_BLOCKS[i]!;
    if (mins >= block.start && mins < block.end) {
      const next = BELL_BLOCKS[i + 1];
      return {
        kind: "in-class",
        current: block,
        ...(next ? { next } : {}),
        endsIn: block.end - mins,
      };
    }
    if (mins < block.start) {
      return i === 0
        ? { kind: "before-school", next: block, startsIn: block.start - mins }
        : { kind: "passing", next: block, startsIn: block.start - mins };
    }
  }
  return { kind: "after-school" };
}

/** "4:05" style countdown from a fractional-minute duration. */
export function formatCountdown(minutes: number): string {
  const total = Math.max(0, Math.ceil(minutes * 60));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
