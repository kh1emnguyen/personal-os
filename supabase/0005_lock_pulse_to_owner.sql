-- ============================================================
-- Lock Pulse data to the owner (run AFTER 0004, once the Pulse page asks you to sign in)
-- Run in Supabase SQL Editor · project agwujdejggupteumannq
-- ============================================================
-- Why: habit_pings, meals and reflections currently have `anon` read policies with USING (true). The anon key is
-- embedded in this public site's JS bundle, so anyone can read your habits, meals and feelings notes today.
-- This replaces the open policies with owner-only ones. In the same release set LOCK_PULSE = true in src/App.jsx,
-- so the Pulse route asks you to sign in. Run this file only after that build is live, or Pulse stops saving.
-- Effect: Pulse works only on a browser that has signed in once (the session persists). Anonymous reads stop.
-- ============================================================

do $$
declare t text;
begin
  foreach t in array array['habit_pings', 'meals', 'reflections'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists "anon insert %1$s" on public.%1$I', t);
      execute format('drop policy if exists "anon read %1$s" on public.%1$I', t);
      execute format('drop policy if exists "auth insert %1$s" on public.%1$I', t);
      execute format('drop policy if exists "auth read %1$s" on public.%1$I', t);
      execute format('drop policy if exists "owner all %1$s" on public.%1$I', t);
      execute format('create policy "owner all %1$s" on public.%1$I for all to authenticated using (public.is_owner()) with check (public.is_owner())', t);
      execute format('revoke all on public.%I from anon', t);
    end if;
  end loop;
end $$;

-- Verification: no policy on these tables should still name the anon role.
select tablename, policyname, roles
from pg_policies
where schemaname = 'public' and tablename in ('habit_pings', 'meals', 'reflections')
order by 1, 2;
