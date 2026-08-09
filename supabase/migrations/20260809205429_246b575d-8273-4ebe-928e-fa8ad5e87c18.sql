ALTER TABLE public.community_schedules ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

DROP POLICY IF EXISTS "Anyone can view community schedules" ON public.community_schedules;
CREATE POLICY "Anyone can view community schedules"
ON public.community_schedules
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL);

CREATE INDEX IF NOT EXISTS community_schedules_deleted_at_idx
ON public.community_schedules (deleted_at);