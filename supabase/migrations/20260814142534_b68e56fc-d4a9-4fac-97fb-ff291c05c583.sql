CREATE TABLE public.visitor_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  name text,
  path text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.visitor_logs TO anon, authenticated;
GRANT ALL ON public.visitor_logs TO service_role;

ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a visit"
ON public.visitor_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(visitor_id) BETWEEN 1 AND 64
  AND (name IS NULL OR length(name) <= 60)
  AND (path IS NULL OR length(path) <= 200)
  AND (user_agent IS NULL OR length(user_agent) <= 400)
);

CREATE INDEX visitor_logs_created_at_idx ON public.visitor_logs (created_at DESC);