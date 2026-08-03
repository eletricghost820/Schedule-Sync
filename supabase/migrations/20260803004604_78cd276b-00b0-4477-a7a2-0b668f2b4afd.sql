CREATE TABLE public.community_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  initials text NOT NULL,
  counselor text,
  slots jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.community_schedules TO anon;
GRANT SELECT, INSERT ON public.community_schedules TO authenticated;
GRANT ALL ON public.community_schedules TO service_role;

ALTER TABLE public.community_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community schedules"
  ON public.community_schedules FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can add a community schedule"
  ON public.community_schedules FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 60
    AND length(initials) BETWEEN 1 AND 4
    AND (counselor IS NULL OR length(counselor) <= 80)
    AND pg_column_size(slots) < 8000
  );