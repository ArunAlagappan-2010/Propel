-- Phase 6: mentor bookings (mirror of Cal.com state), session scores,
-- and mentor access to connected projects.
-- Booking rows are written ONLY by the Cal.com webhook handler via
-- service_role — there are deliberately no client INSERT/UPDATE policies.

create type public.booking_status as enum
  ('confirmed', 'rescheduled', 'cancelled', 'completed');

create table public.mentor_bookings (
  id uuid primary key default gen_random_uuid(),
  cal_com_booking_uid text not null unique,
  mentor_id uuid references public.profiles (id) on delete set null,
  student_id uuid references public.profiles (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  initiated_by uuid references public.profiles (id) on delete set null,
  title text,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz,
  mentor_timezone text,
  attendee_timezone text,
  meet_link text,
  status public.booking_status not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mentor_bookings_mentor_idx
  on public.mentor_bookings (mentor_id, scheduled_start desc);
create index mentor_bookings_student_idx
  on public.mentor_bookings (student_id, scheduled_start desc);

alter table public.mentor_bookings enable row level security;

-- The booking IDOR check: only the people on the booking (or admins).
create policy "booking parties read own bookings"
  on public.mentor_bookings for select
  to authenticated
  using (
    mentor_id = auth.uid()
    or student_id = auth.uid()
    or initiated_by = auth.uid()
    or public.is_admin()
  );

-- Mentors' Cal.com link lives on their profile; self-serve editable.
alter table public.profiles add column cal_com_username text;
grant update (cal_com_username) on table public.profiles to authenticated;

-- Email mirrored onto profiles so the webhook can attribute bookings
-- (auth.users is not queryable via the API). Kept in sync by trigger;
-- readable under the existing profiles RLS policies only.
alter table public.profiles add column email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  requested_role text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
begin
  if requested_role not in ('student', 'mentor') then
    requested_role := 'student';
  end if;

  insert into public.profiles (
    id, email, full_name, role, school_name, grade,
    parental_consent_confirmed, parent_guardian_name, parent_guardian_contact
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    requested_role::public.user_role,
    nullif(new.raw_user_meta_data ->> 'school_name', ''),
    nullif(new.raw_user_meta_data ->> 'grade', '')::smallint,
    coalesce((new.raw_user_meta_data ->> 'parental_consent')::boolean, false),
    nullif(new.raw_user_meta_data ->> 'parent_guardian_name', ''),
    nullif(new.raw_user_meta_data ->> 'parent_guardian_contact', '')
  );
  return new;
end;
$$;

-- A mentor is "connected" to a project once they have a booking with the
-- project directly or with any of its members.
create or replace function public.is_mentor_connected(pid uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.mentor_bookings b
    where b.mentor_id = auth.uid()
      and (
        b.project_id = pid
        or exists (
          select 1 from public.project_members pm
          where pm.project_id = pid and pm.student_id = b.student_id
        )
      )
  );
$$;

create policy "connected mentors read projects"
  on public.projects for select
  to authenticated
  using (public.is_mentor_connected(id));

create policy "connected mentors read membership"
  on public.project_members for select
  to authenticated
  using (public.is_mentor_connected(project_id));

create policy "connected mentors read milestones"
  on public.project_milestones for select
  to authenticated
  using (public.is_mentor_connected(project_id));

create policy "connected mentors update milestones"
  on public.project_milestones for update
  to authenticated
  using (public.is_mentor_connected(project_id))
  with check (public.is_mentor_connected(project_id));

-- Session rubric scores (mentor feedback after a completed session).
create table public.session_scores (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.mentor_bookings (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  creativity_score smallint not null check (creativity_score between 1 and 5),
  execution_score smallint not null check (execution_score between 1 and 5),
  presentation_score smallint not null check (presentation_score between 1 and 5),
  feedback_text text,
  submitted_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (booking_id, student_id)
);

alter table public.session_scores enable row level security;

create policy "score parties read scores"
  on public.session_scores for select
  to authenticated
  using (
    student_id = auth.uid()
    or submitted_by = auth.uid()
    or public.is_admin()
  );

-- Only the mentor on the booking may submit, and only as themselves.
create policy "booking mentor submits scores"
  on public.session_scores for insert
  to authenticated
  with check (
    submitted_by = auth.uid()
    and exists (
      select 1 from public.mentor_bookings b
      where b.id = booking_id and b.mentor_id = auth.uid()
    )
  );
