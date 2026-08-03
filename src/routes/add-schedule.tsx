import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, ImagePlus, Loader2, RotateCcw, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  BELL_TIMES,
  PERIOD_LABEL,
  PERIOD_ORDER,
  type PeriodId,
  type Slot,
} from "@/data/schedule";
import { extractSchedule } from "@/lib/schedule.functions";
import { initialsFor, useRefreshCommunity } from "@/lib/community";
import { supabase } from "@/integrations/supabase/client";
import { WednesdayNote } from "@/components/WednesdayNote";

const title = "Add Your Own Schedule — Schedule Sync";
const description =
  "Upload a screenshot of your class schedule and let AI turn it into a shareable schedule alongside the rest of the crew.";

export const Route = createFileRoute("/add-schedule")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AddSchedule,
});

type Draft = {
  name: string;
  counselor: string;
  slots: Partial<Record<PeriodId, Slot>>;
};

function normalizeSlots(raw: Record<string, unknown>): Partial<Record<PeriodId, Slot>> {
  const out: Partial<Record<PeriodId, Slot>> = {};
  for (const p of PERIOD_ORDER) {
    const v = raw[p] as
      | { className?: string; teacher?: string; room?: string; days?: string | null; alt?: unknown }
      | undefined;
    if (!v?.className) continue;
    const slot: Slot = {
      className: v.className,
      teacher: v.teacher || "—",
      room: v.room || "—",
    };
    if (v.days) slot.days = v.days;
    const alt = v.alt as
      | { className?: string; teacher?: string; room?: string; days?: string }
      | null
      | undefined;
    if (alt?.className) {
      slot.alt = {
        className: alt.className,
        teacher: alt.teacher || "—",
        room: alt.room || "—",
        days: alt.days || "",
      };
    }
    out[p] = slot;
  }
  return out;
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.readAsDataURL(file);
  });
}

function AddSchedule() {
  const navigate = useNavigate();
  const runExtract = useServerFn(extractSchedule);
  const refresh = useRefreshCommunity();
  const inputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 3 - images.length);
    if (!picked.length) {
      toast.error("Please choose an image file.");
      return;
    }
    if (picked.some((f) => f.size > 6_000_000)) {
      toast.error("Images need to be under 6 MB.");
      return;
    }
    const urls = await Promise.all(picked.map(readFile));
    setImages((prev) => [...prev, ...urls].slice(0, 3));
  }

  async function extract() {
    if (!images.length) return;
    setReading(true);
    try {
      const res = await runExtract({ data: { images } });
      const slots = normalizeSlots((res.slots ?? {}) as Record<string, unknown>);
      if (Object.keys(slots).length === 0) {
        toast.error("No periods found in that screenshot. Try a clearer image.");
        return;
      }
      setDraft({
        name: res.name ?? "",
        counselor: res.counselor ?? "",
        slots,
      });
      toast.success("Schedule read — check it over before saving.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong reading that image.");
    } finally {
      setReading(false);
    }
  }

  async function save() {
    if (!draft) return;
    const name = draft.name.trim();
    if (name.length < 2) {
      toast.error("Add a name first.");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("community_schedules")
        .insert({
          name: name.slice(0, 60),
          initials: initialsFor(name),
          counselor: draft.counselor.trim() ? draft.counselor.trim().slice(0, 80) : null,
          slots: draft.slots as never,
        })
        .select("id")
        .single();
      if (error) throw error;
      await refresh();
      toast.success(`${name} added to the crew`);
      navigate({ to: "/student/$studentId", params: { studentId: `c-${data.id}` } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save that schedule.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
          Add your own schedule
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a screenshot of your schedule. AI reads the periods, classes and rooms — you
          confirm before it goes live for everyone.
        </p>
      </section>

      {!draft && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void addFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragging ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <Upload className="size-7 text-primary" />
            <p className="mt-3 font-display text-base font-bold">
              Drop a screenshot or tap to upload
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG or JPG, up to 3 images (if your schedule is split across screenshots)
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                void addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((src, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg border border-border">
                  <img src={src} alt={`Schedule screenshot ${i + 1}`} className="h-28 w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => setImages((prev) => prev.filter((_, n) => n !== i))}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                >
                  <ImagePlus className="size-5" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={!images.length || reading}
            onClick={() => void extract()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {reading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {reading ? "Reading your schedule…" : "Read schedule with AI"}
          </button>
        </>
      )}

      {draft && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your name
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="First Last"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Counselor (optional)
              <input
                value={draft.counselor}
                onChange={(e) => setDraft({ ...draft, counselor: e.target.value })}
                placeholder="Last, First"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Period</th>
                  <th className="px-3 py-2 font-semibold">Class</th>
                </tr>
              </thead>
              <tbody>
                {PERIOD_ORDER.map((p) => {
                  const slot = draft.slots[p];
                  return (
                    <tr key={p} className="border-t border-border align-top">
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <div className="font-display font-bold">{PERIOD_LABEL[p]}</div>
                        <div className="text-[11px] text-muted-foreground">{BELL_TIMES[p]}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        {slot ? (
                          <>
                            <input
                              value={slot.className}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  slots: { ...draft.slots, [p]: { ...slot, className: e.target.value } },
                                })
                              }
                              className="w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 font-semibold outline-none hover:border-border focus:border-primary/60"
                            />
                            <div className="text-xs text-muted-foreground">
                              {slot.teacher} · {slot.room}
                              {slot.days ? ` · ${slot.days}` : ""}
                            </div>
                            {slot.alt ? (
                              <div className="mt-1 border-l-2 border-primary/40 pl-2 text-xs text-muted-foreground">
                                {slot.alt.className} ({slot.alt.days}) · {slot.alt.teacher} ·{" "}
                                {slot.alt.room}
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {saving ? "Saving…" : "Looks right — add me"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide hover:border-primary/50 hover:text-primary"
            >
              <RotateCcw className="size-4" /> Redo
            </button>
          </div>
        </div>
      )}

      <WednesdayNote />
    </div>
  );
}
