import { useEffect, useState } from "react";

/** Clamp weekends to Monday. */
function schoolDay(d: number) {
  return d >= 1 && d <= 5 ? d : 1;
}

/** Selected weekday (1=Mon…5=Fri), defaulting to today after hydration. */
export function useSelectedDay() {
  const [day, setDay] = useState(1);
  const [today, setToday] = useState<number | undefined>(undefined);

  useEffect(() => {
    const t = schoolDay(new Date().getDay());
    setToday(t);
    setDay(t);
  }, []);

  return { day, setDay, today };
}
