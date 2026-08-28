create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint profiles_display_name_length_check
    check (char_length(btrim(display_name)) between 2 and 30),
  constraint profiles_display_name_trimmed_check
    check (display_name = btrim(display_name))
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  constraint messages_body_length_check
    check (char_length(btrim(body)) between 1 and 2000),
  constraint messages_body_trimmed_check
    check (body = btrim(body))
);

create index messages_created_at_id_idx
  on public.messages (created_at desc, id desc);

revoke all on table public.profiles from anon;
revoke all on table public.messages from anon;

revoke all on table public.profiles from authenticated;
revoke all on table public.messages from authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert on table public.messages to authenticated;

alter table public.profiles enable row level security;
alter table public.messages enable row level security;

create policy "Authenticated users can read profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Authenticated users can read messages"
  on public.messages
  for select
  to authenticated
  using (true);

create policy "Users can send messages as themselves"
  on public.messages
  for insert
  to authenticated
  with check ((select auth.uid()) = sender_id);

alter publication supabase_realtime add table public.messages;
