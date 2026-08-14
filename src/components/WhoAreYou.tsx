import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { useAllStudents } from "@/lib/community";
import { ME_KEY, logVisit, useVisitLogger } from "@/lib/visits";

const ASKED_KEY = "schedule-sync-asked-name";

/**
 * One-time "Who are you?" prompt. Remembers the pick so the countdown and
 * overlap pages personalize automatically, and stamps the visitor log.
 */
export function WhoAreYou() {
  const { students } = useAllStudents();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("");

  const resolveName = useCallback(() => {
    const id = localStorage.getItem(ME_KEY);
    return id ? id : null;
  }, []);

  useVisitLogger(resolveName);

  useEffect(() => {
    if (localStorage.getItem(ASKED_KEY)) return;
    if (localStorage.getItem(ME_KEY)) return;
    const t = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(t);
  }, []);

  function finish(save: boolean) {
    localStorage.setItem(ASKED_KEY, "1");
    if (save && choice) {
      localStorage.setItem(ME_KEY, choice);
      const picked = students.find((s) => s.id === choice);
      void logVisit(picked ? picked.name : choice);
    }
    setOpen(false);
  }

  return (
    <Modal open={open} onClose={() => finish(false)} label="Who are you?">
      <div className="mx-auto w-full max-w-xs rounded-2xl border border-border bg-card p-5 shadow-xl">
        <p className="font-display text-base font-bold">Who are you?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick your name once and the site will personalize your countdown and overlaps.
        </p>
        <select
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Select your name…</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => finish(false)}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium"
          >
            Skip
          </button>
          <button
            type="button"
            disabled={!choice}
            onClick={() => finish(true)}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            That's me
          </button>
        </div>
      </div>
    </Modal>
  );
}
