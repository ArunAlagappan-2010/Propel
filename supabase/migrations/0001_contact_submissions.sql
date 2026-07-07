-- Phase 1: public contact form storage.
-- RLS: anyone may INSERT (public form); no SELECT policy — reads are
-- service_role only until admin roles exist (Phase 2+).

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

create policy "public can submit contact form"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);
