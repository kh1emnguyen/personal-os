-- ============================================================
-- Private hub on a public site: owner-only tables behind Supabase login
-- Run in Supabase SQL Editor · project agwujdejggupteumannq
-- ============================================================
-- The site is static and public, and the anon key ships in its JS bundle, so nothing private may be
-- readable by `anon`. Every table here is readable and writable only by the owner's signed-in session.
--
-- BEFORE running this:
--   1. Authentication -> Users -> Add user: your email + a strong password (tick "Auto confirm").
--   2. Authentication -> Sign In / Providers -> turn OFF "Allow new users to sign up".
-- AFTER running this, run once (replace the email; do not commit it):
--   insert into public.app_owner (uid) select id from auth.users where email = 'YOU@EXAMPLE.COM';
-- ============================================================

-- One-row table naming the owner. RLS on, no policies: not reachable through the API at all.
create table if not exists public.app_owner (
  id  boolean primary key default true check (id),
  uid uuid not null
);
alter table public.app_owner enable row level security;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.app_owner where uid = auth.uid())
$$;
revoke all on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated;

-- The archive: one row per date, so a late edition replaces the morning one and every older day stays.
create table if not exists public.briefings (
  date         date primary key,
  edition      text not null default 'normal',
  subject      text,
  mantra       text,
  brief        jsonb not null,
  html_bytes   integer,
  published_at timestamptz not null default now()
);
create index if not exists idx_briefings_published on public.briefings (published_at desc);

-- Return signal: which sections you opened and which links you followed. Fire-and-forget from the page.
create table if not exists public.briefing_events (
  id       bigint generated always as identity primary key,
  date     date not null,
  block_id text,
  kind     text not null check (kind in ('open', 'toggle', 'link')),
  url      text,
  at       timestamptz not null default now()
);
create index if not exists idx_briefing_events_date on public.briefing_events (date);

-- Panes that redirect to claude.ai artifacts and other private tools. Titles and URLs live here, not in the repo.
create table if not exists public.hub_links (
  id         bigint generated always as identity primary key,
  kind       text not null check (kind in ('artifact', 'blog', 'tool')),
  scope      text not null default 'personal',
  slug       text unique,
  title      text not null,
  url        text not null,
  note       text,
  sort       integer not null default 100,
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['briefings', 'briefing_events', 'hub_links'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "owner all %1$s" on public.%1$I', t);
    execute format('create policy "owner all %1$s" on public.%1$I for all to authenticated using (public.is_owner()) with check (public.is_owner())', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;
grant usage, select on all sequences in schema public to authenticated;

-- Pulse keeps working once the page holds a session. A signed-in browser runs as `authenticated`, so the existing
-- `anon` policies stop applying to it. These mirror them, no wider than before. (Lock-down comes in 0005.)
do $$
declare t text;
begin
  foreach t in array array['habit_pings', 'meals', 'reflections'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists "auth insert %1$s" on public.%1$I', t);
      execute format('create policy "auth insert %1$s" on public.%1$I for insert to authenticated with check (true)', t);
      execute format('drop policy if exists "auth read %1$s" on public.%1$I', t);
      execute format('create policy "auth read %1$s" on public.%1$I for select to authenticated using (true)', t);
    end if;
  end loop;
end $$;

-- Verification
select c.relname as table_name, c.relrowsecurity as rls_on
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('app_owner', 'briefings', 'briefing_events', 'hub_links', 'habit_pings', 'meals', 'reflections')
order by 1;
