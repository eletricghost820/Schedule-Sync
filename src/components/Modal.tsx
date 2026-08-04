import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@/hooks/useHydrated";

type Props = {
  open: boolean;
  onClose: () => void;
  label?: string;
  align?: "center" | "bottom";
  children: ReactNode;
};

/**
 * Single popup primitive: portals to <body> (escapes the page-transition
 * transform), pins to the visual viewport with dvh, locks background scroll,
 * and closes on Escape / backdrop click.
 */
export function Modal({ open, onClose, label, align = "center", children }: Props) {
  const hydrated = useHydrated();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!hydrated || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      style={{ height: "100dvh" }}
      className={`fixed inset-x-0 top-0 z-[100] flex justify-center overflow-y-auto overscroll-contain bg-background/70 p-3 backdrop-blur-sm ${
        align === "bottom" ? "items-end sm:items-center" : "items-center"
      }`}
    >
      <div onClick={(e) => e.stopPropagation()} className="my-auto w-full max-w-sm">
        {children}
      </div>
    </div>,
    document.body,
  );
}
