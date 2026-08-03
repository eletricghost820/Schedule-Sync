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
  const [shown, setShown] = useState<{ key: string; node: ReactNode }>({
    key: pathname,
    node: children,
  });
  const [phase, setPhase] = useState<"in" | "out">("in");
  const pending = useRef<ReactNode>(children);

  pending.current = children;

  useEffect(() => {
    if (pathname === shown.key) {
      // Same route, content may have re-rendered — keep it fresh.
      setShown({ key: pathname, node: pending.current });
      return;
    }
    setPhase("out");
    const swap = window.setTimeout(() => {
      setShown({ key: pathname, node: pending.current });
      setPhase("in");
    }, OUT_MS);
    return () => window.clearTimeout(swap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, children]);

  return (
    <div
      key={shown.key}
      style={{
        transitionDuration: `${phase === "out" ? OUT_MS : IN_MS}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionProperty: "opacity, transform, filter",
        opacity: phase === "out" ? 0 : 1,
        transform: phase === "out" ? "translateY(10px) scale(0.99)" : "none",
      }}
    >
      {shown.node}
    </div>
  );
}
