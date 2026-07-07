-- Phase 4a: mentor specialty tags — reuses community_categories as the
-- single taxonomy (no duplicate category list).

create table public.mentor_profile_categories (
  mentor_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid not null references public.community_categories (id) on delete cascade,
  primary key (mentor_id, category_id)
);

alter table public.mentor_profile_categories enable row level security;

-- Directory filtering needs read access for all signed-in users.
create policy "authenticated read mentor tags"
  on public.mentor_profile_categories for select
  to authenticated
  using (true);

-- Mentors manage their own tags; admins manage anyone's (Phase 8 UI).
create policy "mentors manage own tags"
  on public.mentor_profile_categories for insert
  to authenticated
  with check (mentor_id = auth.uid() or public.is_admin());

create policy "mentors remove own tags"
  on public.mentor_profile_categories for delete
  to authenticated
  using (mentor_id = auth.uid() or public.is_admin());
