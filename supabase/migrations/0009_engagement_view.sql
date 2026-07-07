-- Phase 7: engagement rollup, computed on read (no counter drift).
-- security_invoker: the querying user's RLS applies — admins see all
-- students, a student effectively sees only themselves.

create or replace view public.student_engagement
with (security_invoker = true) as
select
  p.id as student_id,
  p.full_name,
  p.school_name,
  p.grade,
  (select count(*) from public.posts po where po.author_id = p.id) as posts_count,
  (select count(*) from public.comments c where c.author_id = p.id) as comments_count,
  (
    select count(*) from public.mentor_bookings b
    where b.student_id = p.id and b.status = 'completed'
  ) as sessions_attended
from public.profiles p
where p.role = 'student';
