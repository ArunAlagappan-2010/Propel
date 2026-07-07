-- Phase 5b: final competition results + admin chat oversight.
-- (session_scores lands in 0008 with mentor_bookings — its FK target.)

create table public.final_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects (id) on delete cascade,
  placement int check (placement between 1 and 100),
  final_score numeric(5, 2) check (final_score >= 0),
  judge_notes text,
  recorded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.final_results enable row level security;

create policy "members and admins read final results"
  on public.final_results for select
  to authenticated
  using (public.is_project_member(project_id) or public.is_admin());

create policy "admins manage final results"
  on public.final_results for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admin chat oversight — PRIVACY BY DEFAULT (see docs/data-model.md):
-- admins see conversation metadata (who, how many messages, last activity)
-- but NOT message content. These are minors' conversations; full content
-- access is a deliberate founder-level decision, not a default.
-- No admin SELECT policy is added to public.messages.

create policy "admins read conversations metadata"
  on public.conversations for select
  to authenticated
  using (public.is_admin());

create policy "admins read conversation membership"
  on public.conversation_participants for select
  to authenticated
  using (public.is_admin());

-- Aggregate message stats without exposing bodies.
create or replace function public.admin_conversation_stats()
returns table (
  conversation_id uuid,
  message_count bigint,
  last_activity timestamptz
)
language sql stable security definer
set search_path = public
as $$
  select m.conversation_id, count(*), max(m.created_at)
  from public.messages m
  where public.is_admin()
  group by m.conversation_id;
$$;
