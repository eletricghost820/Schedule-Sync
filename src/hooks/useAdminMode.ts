import { useCallback, useEffect, useState } from "react";

const KEY = "schedule-sync-admin";
const EVENT = "schedule-sync-admin-change";

/**
 * Client-side admin flag. The password is always re-verified on the server
 * before anything is actually deleted.
 */
export function useAdminMode() {
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setPassword(sessionStorage.getItem(KEY));
    read();
    window.addEventListener(EVENT, read);
    return () => window.removeEventListener(EVENT, read);
  }, []);

  const enable = useCallback((pw: string) => {
    sessionStorage.setItem(KEY, pw);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const disable = useCallback(() => {
    sessionStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { admin: password !== null, password, enable, disable };
}
