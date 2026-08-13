update public.community_schedules
set slots = jsonb_set(
  jsonb_set(slots::jsonb, '{02,days}', '"Mon/Wed/Fri"'),
  '{02,alt,days}', '"Tue/Thu"')
where name = 'Sebastian Camarena'
  and slots::jsonb #>> '{02,alt,className}' ilike '%biolog%';