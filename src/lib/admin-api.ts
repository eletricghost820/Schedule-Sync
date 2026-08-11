export type TrashItem = {
  id: string;
  name: string;
  initials: string;
  deleted_at: string;
  kind?: "community" | "builtin";
};

export async function adminRequest(body: {
  password: string;
  action: "verify" | "remove" | "trash" | "restore" | "purge" | "hide" | "unhide";
  id?: string;
  name?: string;
  initials?: string;
}): Promise<{ ok: boolean; error?: string; items?: TrashItem[] }> {
  const res = await fetch("/api/public/admin", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; error?: string; items?: TrashItem[] }
    | null;
  if (!data) throw new Error("Unexpected response");
  return {
    ok: !!data.ok,
    ...(data.error ? { error: data.error } : {}),
    ...(data.items ? { items: data.items } : {}),
  };
}