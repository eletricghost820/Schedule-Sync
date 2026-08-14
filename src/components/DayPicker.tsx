import { WEEKDAYS } from "@/data/schedule";

export function DayPicker({
  day,
  onChange,
  today,
}: {
  day: number;
  onChange: (day: number) => void;
  today?: number | undefined;
}) {
  return (
    <div className="flex items-center gap-2" data-share-hide>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Day
      </span>
      <div className="flex gap-1 rounded-full border border-border bg-card p-1">
        {WEEKDAYS.map((d) => {
          const active = d.day === day;
          return (
            <button
              key={d.day}
              type="button"
              onClick={() => onChange(d.day)}
              aria-label={d.label}
              aria-pressed={active}
              className={`min-w-9 rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.short}
            </button>
          );
        })}
      </div>
      {today === day ? (
        <span className="text-[11px] font-medium text-muted-foreground">Today</span>
      ) : null}
    </div>
  );
}
