CREATE TABLE public.hidden_students (
  student_id text PRIMARY KEY,
  name text NOT NULL,
  initials text NOT NULL,
  hidden_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hidden_students TO anon, authenticated;
GRANT ALL ON public.hidden_students TO service_role;

ALTER TABLE public.hidden_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hidden students"
ON public.hidden_students
FOR SELECT
TO anon, authenticated
USING (true);