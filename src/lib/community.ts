import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PERIOD_ORDER, STUDENTS, type PeriodId, type Slot, type Student } from "@/data/schedule";

export type CommunityStudent = Student & { community: true; rowId: string };

export type ExtractedSchedule = {
  name: string;
  initials: string;
  counselor?: string | null;
  slots: Partial<Record<PeriodId, Slot>>;
};

export function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return (letters.join("") || "??").slice(0, 4);
}

function sanitizeSlots(raw: unknown): Partial<Record<PeriodId, Slot>> {
  const out: Partial<Record<PeriodId, Slot>> = {};
  if (!raw || typeof raw !== "object") return out;
  const obj = raw as Record<string, unknown>;
  for (const p of PERIOD_ORDER) {
    const v = obj[p] as Partial<Slot> | undefined;
    if (!v || typeof v !== "object" || !v.className) continue;
    const slot: Slot = {
      className: String(v.className),
      teacher: String(v.teacher ?? "—"),
      room: String(v.room ?? "—"),
    };
    if (v.days) slot.days = String(v.days);
    if (v.alt && typeof v.alt === "object" && v.alt.className) {
      slot.alt = {
        className: String(v.alt.className),
        teacher: String(v.alt.teacher ?? "—"),
        room: String(v.alt.room ?? "—"),
        days: String(v.alt.days ?? ""),
      };
    }
    out[p] = slot;
  }
  return out;
}

type Row = {
  id: string;
  name: string;
  initials: string;
  counselor: string | null;
  slots: unknown;
};

export function rowToStudent(row: Row): CommunityStudent {
  return {
    id: `c-${row.id}`,
    rowId: row.id,
    community: true,
    name: row.name,
    initials: row.initials || initialsFor(row.name),
    ...(row.counselor ? { counselor: row.counselor } : {}),
    slots: sanitizeSlots(row.slots),
  };
}

export const communityQueryKey = ["community-schedules"] as const;

export async function fetchCommunityStudents(): Promise<CommunityStudent[]> {
  const { data, error } = await supabase
    .from("community_schedules")
    .select("id,name,initials,counselor,slots")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => rowToStudent(r as Row));
}

/** Built-in crew plus every community-submitted schedule. */
export function useAllStudents() {
  const query = useQuery({
    queryKey: communityQueryKey,
    queryFn: fetchCommunityStudents,
    staleTime: 30_000,
  });
  const community = query.data ?? [];
  return {
    students: [...STUDENTS, ...community] as Student[],
    community,
    isLoading: query.isLoading,
  };
}

export function useRefreshCommunity() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: communityQueryKey });
}

export function isCommunityStudent(s: Student): s is CommunityStudent {
  return s.id.startsWith("c-");
}
