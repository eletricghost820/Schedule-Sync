const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM = `You read screenshots of a US high school student class schedule and turn them into JSON.

The school day has exactly these period keys: "01","02","03","HR","04","05","06","07","08","09".
"HR" means Homeroom (sometimes shown as HR, Homeroom, or an "HR ##" section code).

Return ONLY minified JSON of this shape:
{"name":string|null,"counselor":string|null,"slots":{"01":{"className":string,"teacher":string,"room":string,"days":string|null,"alt":{"className":string,"teacher":string,"room":string,"days":string}|null}}}

Rules:
- Strip course codes: "SC1B05 - Biology Hon" => "Biology Hon". "MI1L10 - LUNCH" => "Lunch".
- Title-case class names (LUNCH => Lunch).
- teacher: "Last, First" as printed. Use "—" when blank, null, or Staff-only.
- room: prefix numeric rooms with "Rm " (2410 => "Rm 2410"). GYM => "Gym". CAFE => "Cafe". Keep text rooms like "So Lobby" as-is.
- Day letters: M=Mon, T=Tue, W=Wed, R=Thu, F=Fri. If a class meets all five days, set days to null.
- If one period has two different classes on different days, put the one meeting the most days in the slot and the other in "alt", each with a "days" string like "Mon/Thu".
- Merge duplicate rows for the same period and same class into one entry with combined days.
- Omit periods that are not in the screenshot.
- No markdown, no code fences, no commentary.`;

export type AiSlot = {
  className: string;
  teacher?: string;
  room?: string;
  days?: string | null;
  alt?: { className: string; teacher?: string; room?: string; days?: string } | null;
};

export type AiResult = {
  name: string | null;
  counselor: string | null;
  slots: Record<string, AiSlot>;
};

export async function extractScheduleFromImages(images: string[]): Promise<AiResult> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.5-flash",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract this class schedule. Multiple images may be different parts of the same schedule.",
            },
            ...images.map((url) => ({ type: "image_url", image_url: { url } })),
          ],
        },
      ],
    }),
  });

  if (res.status === 429) throw new Error("Too many requests right now — try again in a minute.");
  if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
  if (!res.ok) throw new Error(`Could not read that screenshot (${res.status}).`);

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content ?? "";
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The AI couldn't find a schedule in that image.");

  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<AiResult>;
  return {
    name: parsed.name ?? null,
    counselor: parsed.counselor ?? null,
    slots: parsed.slots ?? {},
  };
}

export function adminPasswordMatches(input: string): boolean {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
