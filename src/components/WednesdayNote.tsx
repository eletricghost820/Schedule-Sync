import { AlertTriangle } from "lucide-react";
import { WEDNESDAY_NOTE } from "@/data/schedule";

export function WednesdayNote() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-partial-foreground/25 bg-partial-soft px-3 py-2 text-xs leading-relaxed text-partial-foreground">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-bold">Wednesday note:</span> {WEDNESDAY_NOTE}
      </p>
    </div>
  );
}