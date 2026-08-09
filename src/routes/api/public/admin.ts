import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  password: z.string().min(1).max(100),
  action: z.enum(["verify", "remove", "trash", "restore", "purge"]),
  id: z.string().uuid().optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

function adminPasswordMatches(input: string): boolean {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected || input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          let raw: unknown;
          try {
            raw = await request.json();
          } catch {
            return json({ ok: false, error: "Bad request" }, 400);
          }

          const parsed = Body.safeParse(raw);
          if (!parsed.success) return json({ ok: false, error: "Bad request" }, 400);

          if (!adminPasswordMatches(parsed.data.password)) return json({ ok: false });

          if (parsed.data.action === "verify") return json({ ok: true });

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Anything trashed more than a week ago is gone for good.
          const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          await supabaseAdmin
            .from("community_schedules")
            .delete()
            .not("deleted_at", "is", null)
            .lt("deleted_at", cutoff);

          if (parsed.data.action === "trash") {
            const { data, error } = await supabaseAdmin
              .from("community_schedules")
              .select("id,name,initials,deleted_at")
              .not("deleted_at", "is", null)
              .order("deleted_at", { ascending: false });
            if (error) return json({ ok: false, error: error.message }, 502);
            return json({ ok: true, items: data ?? [] });
          }

          if (!parsed.data.id) return json({ ok: false, error: "Missing id" }, 400);

          if (parsed.data.action === "purge") {
            const { error } = await supabaseAdmin
              .from("community_schedules")
              .delete()
              .eq("id", parsed.data.id);
            if (error) return json({ ok: false, error: error.message }, 502);
            return json({ ok: true });
          }

          const { error } = await supabaseAdmin
            .from("community_schedules")
            .update({
              deleted_at: parsed.data.action === "restore" ? null : new Date().toISOString(),
            })
            .eq("id", parsed.data.id);
          if (error) return json({ ok: false, error: error.message }, 502);
          return json({ ok: true });
        } catch (error) {
          console.error("admin route failed:", error);
          return json({ ok: false, error: "Server error" }, 502);
        }
      },
    },
  },
});
