import { useCallback, useEffect, useState } from "react";

const KEY = "schedule-sync-admin";
const EVENT = "schedule-sync-admin-change";

/** Client-side admin flag. The password itself is verified on the server. */
export function useAdminMode() {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const read = () => setAdmin(sessionStorage.getItem(KEY) === "1");
    read();
    window.addEventListener(EVENT, read);
    return () => window.removeEventListener(EVENT, read);
  }, []);

  const enable = useCallback(() => {
    sessionStorage.setItem(KEY, "1");
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const disable = useCallback(() => {
    sessionStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { admin, enable, disable };
}
