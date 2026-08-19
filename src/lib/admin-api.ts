export type TrashItem = {
  id: string;
  name: string;
  initials: string;
  deleted_at: string;
  kind?: "community" | "builtin";
};

export type VisitRow = {
  id: string;
  name: string | null;
  visitor_id: string;
  path: string | null;
  user_agent: string | null;
  created_at: string;
};

export type FeedbackRow = {
  id: string;
  kind: "bug" | "feature";
  message: string;
  name: string | null;
  resolved: boolean;
  created_at: string;
};

export async function adminRequest(body: {
  password: string;
  action:
    | "verify"
    | "remove"
    | "trash"
    | "restore"
    | "purge"
    | "hide"
    | "unhide"
    | "visits"
    | "feedback"
    | "feedback_toggle"
    | "feedback_delete";
  id?: string;
  name?: string;
  initials?: string;
}): Promise<{
  ok: boolean;
  error?: string;
  items?: TrashItem[];
  visits?: VisitRow[];
  feedback?: FeedbackRow[];
}> {
  const res = await fetch("/api/public/admin", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as
    | {
        ok?: boolean;
        error?: string;
        items?: TrashItem[];
        visits?: VisitRow[];
        feedback?: FeedbackRow[];
      }
    | null;
  if (!data) throw new Error("Unexpected response");
  return {
    ok: !!data.ok,
    ...(data.error ? { error: data.error } : {}),
    ...(data.items ? { items: data.items } : {}),
    ...(data.visits ? { visits: data.visits } : {}),
    ...(data.feedback ? { feedback: data.feedback } : {}),
  };
}