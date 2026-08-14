import {
  BELL_TIMES,
  PERIOD_ORDER,
  WEDNESDAY_BELL_TIMES,
  FRIDAY_BELL_TIMES,
  type PeriodId,
} from "@/data/schedule";

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

function buildBlocks(times: Partial<Record<PeriodId, string>>): BellBlock[] {
  return PERIOD_ORDER.flatMap((period) => {
    const raw = times[period];
    if (!raw) return [];
    const [rawStart = "", rawEnd = ""] = raw.split(/[–-]/);
    const endMer = /PM/i.test(rawEnd) ? "PM" : "AM";
    return [
      {
        period,
        start: parseClock(rawStart, endMer),
        end: parseClock(rawEnd, endMer),
      },
    ];
  }).sort((a, b) => a.start - b.start);
}

/** Minutes-from-midnight blocks for the standard Mon/Tue/Thu/Fri bells. */
export const BELL_BLOCKS: BellBlock[] = buildBlocks(BELL_TIMES);

/** Shortened Wednesday bells (no homeroom, later start). */
export const WEDNESDAY_BLOCKS: BellBlock[] = buildBlocks(WEDNESDAY_BELL_TIMES);

/** Friday bells — extended homeroom. */
export const FRIDAY_BLOCKS: BellBlock[] = buildBlocks(FRIDAY_BELL_TIMES);

export function blocksForDay(day: number): BellBlock[] {
  if (day === 3) return WEDNESDAY_BLOCKS;
  if (day === 5) return FRIDAY_BLOCKS;
  return BELL_BLOCKS;
}

/** Bell times for a given weekday, falling back to the standard schedule. */
export function bellTimesForDay(day: number): Partial<Record<PeriodId, string>> {
  if (day === 3) return WEDNESDAY_BELL_TIMES;
  if (day === 5) return FRIDAY_BELL_TIMES;
  return BELL_TIMES;
}

export type BellStatus =
  | { kind: "in-class"; current: BellBlock; next?: BellBlock; endsIn: number }
  | { kind: "passing"; next: BellBlock; startsIn: number }
  | { kind: "before-school"; next: BellBlock; startsIn: number }
  | { kind: "after-school"; nextDay: string; firstBell: string }
  | { kind: "weekend"; nextDay: string; firstBell: string };

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function clockLabel(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const mer = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")} ${mer}`;
}

/** The next weekday with classes, and when its first bell rings. */
function nextSchoolDay(day: number): { nextDay: string; firstBell: string } {
  let d = day;
  for (let i = 0; i < 7; i++) {
    d = (d + 1) % 7;
    if (d === 0 || d === 6) continue;
    const first = blocksForDay(d)[0];
    return {
      nextDay: DAY_NAMES[d]!,
      firstBell: first ? clockLabel(first.start) : "—",
    };
  }
  return { nextDay: "Monday", firstBell: "—" };
}

export function bellStatusAt(now: Date): BellStatus {
  const day = now.getDay();
  if (day === 0 || day === 6) return { kind: "weekend", ...nextSchoolDay(day) };

  const blocks = blocksForDay(day);
  const mins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;
    if (mins >= block.start && mins < block.end) {
      const next = blocks[i + 1];
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
  return { kind: "after-school", ...nextSchoolDay(day) };
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
