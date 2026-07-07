-- Phase 3: community platform — categories (fixed, seeded), posts, comments.
-- Community is internal: readable by any signed-in user, never public.

create table public.community_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  sort_order int not null default 0
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.community_categories (id),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  body text not null check (char_length(body) between 10 and 20000),
  is_pinned boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_category_created_idx
  on public.posts (category_id, created_at desc);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index comments_post_created_idx
  on public.comments (post_id, created_at asc);

alter table public.community_categories enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- Categories: read-only reference data. No client writes at all.
create policy "authenticated read categories"
  on public.community_categories for select
  to authenticated
  using (true);

-- Posts: any signed-in user reads non-hidden posts (admins see hidden too);
-- authors write their own; authors or admins edit/delete.
create policy "read visible posts"
  on public.posts for select
  to authenticated
  using (not is_hidden or public.is_admin() or author_id = auth.uid());

create policy "create own posts"
  on public.posts for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "edit own posts or admin"
  on public.posts for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin());

create policy "delete own posts or admin"
  on public.posts for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- Clients cannot set moderation flags; only service_role / admin UI may.
revoke insert, update on table public.posts from authenticated;
grant insert (category_id, author_id, title, body)
  on table public.posts to authenticated;
grant update (title, body, updated_at)
  on table public.posts to authenticated;

-- Comments mirror posts.
create policy "read visible comments"
  on public.comments for select
  to authenticated
  using (not is_hidden or public.is_admin() or author_id = auth.uid());

create policy "create own comments"
  on public.comments for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "delete own comments or admin"
  on public.comments for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin());

revoke insert, update on table public.comments from authenticated;
grant insert (post_id, author_id, body)
  on table public.comments to authenticated;

-- The 8 fixed categories. Descriptions are draft copy — flagged for
-- founder review in docs/content-plan.md.
insert into public.community_categories (name, slug, description, sort_order) values
  ('STEM (General)', 'stem',
   'Cross-disciplinary science and technology — for project ideas and questions that span multiple fields.', 1),
  ('Biology & Environment', 'biology-environment',
   'Life sciences, health, agriculture, climate, and protecting the world around us.', 2),
  ('Math & Computer Science', 'math-computer-science',
   'Mathematics, coding, apps, data, and algorithms — the logic behind great solutions.', 3),
  ('Physics & Engineering', 'physics-engineering',
   'Machines, materials, electronics, energy, and how things get built.', 4),
  ('Social Sciences & Humanities', 'social-sciences-humanities',
   'People-centred problems: education, society, history, language, and community impact.', 5),
  ('Arts & Design', 'arts-design',
   'Creativity in action — visual design, storytelling, and making solutions people love to use.', 6),
  ('Business & Entrepreneurship', 'business-entrepreneurship',
   'Business models, financial planning, and pitching — turning a project into a proposal.', 7),
  ('General Discussion', 'general-discussion',
   'Announcements, introductions, and everything that does not fit elsewhere.', 8);
