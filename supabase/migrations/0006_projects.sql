-- Phase 5a: projects, team membership, and the 5-stage milestone tracker.
-- Milestone rows are auto-created per project by trigger, so the tracker
-- always shows all 5 stages.

create type public.milestone_stage as enum
  ('problem_id', 'research', 'prototype', 'pitch', 'final');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 200),
  school_name text,
  created_at timestamptz not null default now()
);

create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  primary key (project_id, student_id)
);

create index project_members_student_idx
  on public.project_members (student_id);

create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  stage public.milestone_stage not null,
  completed_at timestamptz,
  marked_complete_by uuid references public.profiles (id),
  notes text,
  unique (project_id, stage)
);

create or replace function public.handle_new_project()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.project_milestones (project_id, stage)
  select new.id, s
  from unnest(enum_range(null::public.milestone_stage)) as s;
  return new;
end;
$$;

create trigger on_project_created
  after insert on public.projects
  for each row execute function public.handle_new_project();

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_milestones enable row level security;

create or replace function public.is_project_member(pid uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members
    where project_id = pid and student_id = auth.uid()
  );
$$;

-- Students read their own project; admins everything. Mentor access is
-- added in migration 0008 once bookings (the mentor↔project link) exist.
create policy "members and admins read projects"
  on public.projects for select
  to authenticated
  using (public.is_project_member(id) or public.is_admin());

create policy "admins manage projects"
  on public.projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "members and admins read membership"
  on public.project_members for select
  to authenticated
  using (public.is_project_member(project_id) or public.is_admin());

create policy "admins manage membership"
  on public.project_members for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "members and admins read milestones"
  on public.project_milestones for select
  to authenticated
  using (public.is_project_member(project_id) or public.is_admin());

-- Students are read-only on milestones by design: no student policy here.
create policy "admins update milestones"
  on public.project_milestones for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
