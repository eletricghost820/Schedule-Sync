export async function adminRequest(body: {
  password: string;
  action: "verify" | "remove";
  id?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/public/admin", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; error?: string }
    | null;
  if (!data) throw new Error("Unexpected response");
  return { ok: !!data.ok, ...(data.error ? { error: data.error } : {}) };
}