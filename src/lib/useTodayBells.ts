import { useEffect, useState } from "react";
import {
  BELL_TIMES,
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
