import { supabase } from "@/integrations/supabase/client";

export const ME_KEY = "schedule-sync-me";
const VISITOR_KEY = "schedule-sync-visitor";
const SESSION_KEY = "schedule-sync-visit-logged";

function visitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export async function logVisit(name: string | null) {
  try {
    await supabase.from("visitor_logs").insert({
      visitor_id: visitorId(),
      name: name && name.length ? name.slice(0, 60) : null,
      path: window.location.pathname.slice(0, 200),
      user_agent: navigator.userAgent.slice(0, 400),
    });
  } catch {
    // Logging must never break the page.
  }
}

export function alreadyLoggedThisSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function markLoggedThisSession() {
  sessionStorage.setItem(SESSION_KEY, "1");
}

const LAST_NAME_KEY = "schedule-sync-last-logged-name";

/**
 * Call this anywhere the user tells us who they are (name pickers, the
 * "Who are you?" prompt, submitting a schedule). Remembers the identity and
 * logs a named visit whenever the name changes, so the log isn't all
 * "Anonymous".
 */
export function identify(name: string | null, id?: string | null) {
  if (typeof window === "undefined") return;
  const clean = name?.trim();
  if (!clean) return;
  try {
    if (id) localStorage.setItem(ME_KEY, id);
    markLoggedThisSession();
    if (localStorage.getItem(LAST_NAME_KEY) === clean) return;
    localStorage.setItem(LAST_NAME_KEY, clean);
  } catch {
    // ignore storage failures, still log
  }
  void logVisit(clean);
}
