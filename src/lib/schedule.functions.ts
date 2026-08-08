import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function adminPasswordMatches(input: string): boolean {
  const expected = process.env["ADMIN_PASSWORD"];
  console.log("[verifyAdmin] Checking password", {
    inputLength: input.length,
    expectedLength: expected?.length,
    hasExpected: !!expected,
  });
  if (!expected) {
    console.log("[verifyAdmin] No ADMIN_PASSWORD env var set");
    return false;
  }
  if (input.length !== expected.length) {
    console.log("[verifyAdmin] Password length mismatch");
    return false;
  }
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  const matches = diff === 0;
  console.log("[verifyAdmin] Comparison result:", { matches, diff });
  return matches;
}

export const extractSchedule = createServerFn({ method: "POST" })
  .inputValidator((data: { images: string[] }) =>
    z
      .object({
        images: z
          .array(z.string().startsWith("data:image/").max(900_000))
          .min(1)
          .max(2),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { extractScheduleFromImages } = await import("./schedule.server");
    return extractScheduleFromImages(data.images);
  });

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) =>
    z.object({ password: z.string().min(1).max(100) }).parse(data),
  )
  .handler(async ({ data }) => {
    try {
      console.log("[verifyAdmin] Handler started");
      const result = { ok: adminPasswordMatches(data.password) };
      console.log("[verifyAdmin] Returning result:", result);
      return result;
    } catch (error) {
      console.error("[verifyAdmin] Handler error:", error);
      throw error;
    }
  });

export const removeCommunitySchedule = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string }) =>
    z.object({ password: z.string().min(1).max(100), id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    if (!adminPasswordMatches(data.password)) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("community_schedules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
