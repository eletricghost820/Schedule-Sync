import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Shield, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { verifyAdmin } from "@/lib/schedule.functions";
import { useAdminMode } from "@/hooks/useAdminMode";
import { Modal } from "@/components/Modal";

export function AdminControl() {
  const { admin, enable, disable } = useAdminMode();
  const check = useServerFn(verifyAdmin);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  if (admin) {
    return (
      <button
        type="button"
        onClick={() => {
          disable();
          toast("Admin mode off");
        }}
        title="Exit admin mode"
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary/20"
      >
        <ShieldCheck className="size-3.5" />
        Admin
        <X className="size-3" />
      </button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const res = await check({ data: { password: value } });
      if (res.ok) {
        enable(value);
        setOpen(false);
        setValue("");
        toast.success("Admin mode enabled");
      } else {
        setError(true);
        toast.error("Incorrect password");
      }
    } catch {
      setError(true);
      toast.error("Could not check that password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Admin mode"
        title="Admin mode"
        className="rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:text-primary"
      >
        <Shield className="size-4" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} label="Admin password">
        <form
          onSubmit={submit}
          className="mx-auto w-full max-w-xs rounded-2xl border border-border bg-card p-5 shadow-xl"
        >
            <p className="font-display text-base font-bold">Admin password</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Unlocks removing schedules from the site.
            </p>
            <input
              autoFocus
              type="password"
              inputMode="numeric"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
              className={`mt-4 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 ${
                error ? "border-destructive" : "border-border"
              }`}
              placeholder="••••"
            />
            {error && (
              <p className="mt-2 text-xs font-semibold text-destructive">
                Incorrect password — admin mode not enabled.
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || value.length === 0}
                className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {busy ? "Checking…" : "Unlock"}
              </button>
            </div>
        </form>
      </Modal>
    </>
  );
}
