import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  images: z.array(z.string().startsWith("data:image/").max(900_000)).min(1).max(2),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export const Route = createFileRoute("/api/public/extract-schedule")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          let raw: unknown;
          try {
            raw = await request.json();
          } catch {
            return json({ error: "That upload wasn't readable. Try one screenshot at a time." }, 400);
          }

          const parsed = Body.safeParse(raw);
          if (!parsed.success) {
            return json(
              { error: "That image is too large — try a smaller or cropped screenshot." },
              413,
            );
          }

          const { extractScheduleFromImages } = await import("@/lib/schedule.server");
          const result = await extractScheduleFromImages(parsed.data.images);
          return json(result);
        } catch (error) {
          const message =
            error instanceof Error && error.message
              ? error.message
              : "Something went wrong reading that schedule.";
          console.error("extract-schedule failed:", error);
          return json({ error: message }, 502);
        }
      },
    },
  },
});