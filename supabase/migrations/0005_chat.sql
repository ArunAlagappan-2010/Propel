-- Phase 4b: 1:1 chat — conversations, participants, messages.
-- IDOR guard: every read/write checks membership via a SECURITY DEFINER
-- helper (avoids RLS self-recursion on the participants table).
-- Conversation creation goes through find_or_create_conversation() only —
-- clients never insert conversations/participants directly.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (conversation_id, profile_id)
);

create index conversation_participants_profile_idx
  on public.conversation_participants (profile_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create or replace function public.is_conversation_participant(conv uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = conv and profile_id = auth.uid()
  );
$$;

create policy "participants read conversations"
  on public.conversations for select
  to authenticated
  using (public.is_conversation_participant(id));

create policy "participants read membership"
  on public.conversation_participants for select
  to authenticated
  using (public.is_conversation_participant(conversation_id));

create policy "participants read messages"
  on public.messages for select
  to authenticated
  using (public.is_conversation_participant(conversation_id));

create policy "participants send messages as themselves"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_conversation_participant(conversation_id)
  );

-- Find the existing 1:1 conversation with `other_user`, or create it.
-- SECURITY DEFINER so it can insert both participant rows atomically.
create or replace function public.find_or_create_conversation(other_user uuid)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  conv uuid;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if other_user = me then
    raise exception 'cannot start a conversation with yourself';
  end if;
  if not exists (select 1 from public.profiles where id = other_user) then
    raise exception 'user does not exist';
  end if;

  select cp1.conversation_id into conv
  from public.conversation_participants cp1
  join public.conversation_participants cp2
    on cp1.conversation_id = cp2.conversation_id
  where cp1.profile_id = me and cp2.profile_id = other_user
  limit 1;

  if conv is not null then
    return conv;
  end if;

  insert into public.conversations default values returning id into conv;
  insert into public.conversation_participants (conversation_id, profile_id)
  values (conv, me), (conv, other_user);
  return conv;
end;
$$;

-- Realtime: broadcast message inserts (RLS still applies to subscribers).
alter publication supabase_realtime add table public.messages;
