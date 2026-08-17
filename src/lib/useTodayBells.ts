import { useEffect, useState } from "react";
import {
  BELL_TIMES,
  bellTimesForDay,
  bellTimesForDate,
  isSpecialDay,
  type PeriodId,
} from "@/data/schedule";

/** Hydration-safe bell times for today, honoring the one-time special schedule. */
export function useTodayBellTimes(): {
  times: Partial<Record<PeriodId, string>>;
  special: boolean;
} {
  const [state, setState] = useState<{
    times: Partial<Record<PeriodId, string>>;
    special: boolean;
  }>({ times: BELL_TIMES, special: false });

  useEffect(() => {
    const now = new Date();
    setState({ times: bellTimesForDate(now), special: isSpecialDay(now) });
  }, []);

  return state;
}

/**
 * Bell times for the selected weekday. When the selection is today, honors the
 * one-time special schedule; Wednesday uses the shortened bells (no homeroom).
 */
export function useBellTimesForDay(day: number): {
  times: Partial<Record<PeriodId, string>>;
  special: boolean;
} {
  const [today, setToday] = useState<{ day: number; special: boolean } | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday({ day: now.getDay(), special: isSpecialDay(now) });
  }, []);

  if (today && today.day === day && today.special) {
    return { times: bellTimesForDate(new Date()), special: true };
  }
  return { times: bellTimesForDay(day), special: false };
}
