UPDATE public.community_schedules
SET slots = jsonb_set(slots::jsonb, '{06}', '{"className":"Lunch","teacher":"Staff","room":"Cafe"}'::jsonb, true)
WHERE name = 'Sebastian Camarena';