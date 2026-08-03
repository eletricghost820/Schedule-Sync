import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

const OUT_MS = 130;
const IN_MS = 170;

/**
 * Cross-fades + slides route content when switching tabs so navigation
 * never feels like an instant cut.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [shownPath, setShownPath] = useState(pathname);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const pending = useRef<ReactNode>(children);
  const shownNode = useRef<ReactNode>(children);

  pending.current = children;
  if (shownPath === pathname) shownNode.current = children;

  useEffect(() => {
    if (pathname === shownPath) return;
    setPhase("out");
    const swap = window.setTimeout(() => {
      shownNode.current = pending.current;
      setShownPath(pathname);
      setPhase("in");
    }, OUT_MS);
    return () => window.clearTimeout(swap);
  }, [pathname, shownPath]);

  return (
    <div
      style={{
        transitionDuration: `${phase === "out" ? OUT_MS : IN_MS}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionProperty: "opacity, transform",
        opacity: phase === "out" ? 0 : 1,
        transform: phase === "out" ? "translateY(10px) scale(0.995)" : "none",
        willChange: "opacity, transform",
      }}
    >
      {shownNode.current}
    </div>
  );
}
