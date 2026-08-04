import { useEffect, useState } from "react";

/** True only after the client has hydrated — safe gate for portals. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
