-- Phase 2: profiles (1:1 with auth.users), signup trigger, role model.
-- Security notes:
--  * Self-registration can only ever produce student/mentor — the trigger
--    coerces anything else to student. Admins are promoted manually in
--    Supabase Studio (update profiles set role='admin' where id=...).
--  * Clients cannot UPDATE role/parental_consent columns — column-level
--    grants below; role changes go through service_role only.

create type public.user_role as enum ('student', 'mentor', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'student',
  school_name text,
  grade smallint check (grade in (8, 9)),
  phone text,
  bio text,
  avatar_url text,
  parental_consent_confirmed boolean not null default false,
  parent_guardian_name text,
  parent_guardian_contact text,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Role helpers. SECURITY DEFINER so RLS policies can call them without
-- recursing into profiles' own policies.
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_role()
returns public.user_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Auto-create the profile row on signup from user metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  requested_role text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
begin
  -- Privilege-escalation guard: admin can never be self-registered.
  if requested_role not in ('student', 'mentor') then
    requested_role := 'student';
  end if;

  insert into public.profiles (
    id, full_name, role, school_name, grade,
    parental_consent_confirmed, parent_guardian_name, parent_guardian_contact
  )
  values (
    new.id,
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: own row, admins see all, mentor profiles are visible to all
-- signed-in users (the Find Mentors directory).
create policy "read own profile, admins all, mentors public-internal"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin() or role = 'mentor');

create policy "update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Column-level lockdown: clients may only update harmless profile fields.
-- role / parental consent / guardian fields require service_role.
revoke update on table public.profiles from authenticated;
grant update (full_name, phone, bio, avatar_url, timezone, school_name, grade)
  on table public.profiles to authenticated;

-- Admins may read contact form submissions (Phase 1 table).
create policy "admins read contact submissions"
  on public.contact_submissions for select
  to authenticated
  using (public.is_admin());
