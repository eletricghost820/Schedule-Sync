import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const extractSchedule = createServerFn({ method: "POST" })
  .inputValidator((data: { images: string[] }) =>
    z
      .object({
        images: z
          .array(z.string().startsWith("data:image/").max(3_000_000))
          .min(1)
          .max(3),
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
    const { adminPasswordMatches } = await import("./schedule.server");
    return { ok: adminPasswordMatches(data.password) };
  });

export const removeCommunitySchedule = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string }) =>
    z.object({ password: z.string().min(1).max(100), id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { adminPasswordMatches } = await import("./schedule.server");
    if (!adminPasswordMatches(data.password)) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("community_schedules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
