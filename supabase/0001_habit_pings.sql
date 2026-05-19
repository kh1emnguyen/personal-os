-- ============================================================
-- Pulse — habit capture ping log
-- Run in Supabase SQL Editor · project agwujdejggupteumannq
-- ============================================================
-- One row per fired ping. Answered pings carry a `responses`
-- object ({meal:true, teeth:false, ...}); skipped/missed pings
-- have responses = null and answered_at = null. The pulse-updater
-- agent reads this table to refresh MEMORY.md habit baselines.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.habit_pings (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pinged_at    timestamptz NOT NULL,
  answered_at  timestamptz,
  responses    jsonb,
  window_date  date        NOT NULL DEFAULT current_date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_habit_pings_window_date
  ON public.habit_pings (window_date);

CREATE INDEX IF NOT EXISTS idx_habit_pings_pinged_at
  ON public.habit_pings (pinged_at);

-- The Pulse app writes from the browser with the anon key.
-- Mirror the access model already used by weekly_checkins.
ALTER TABLE public.habit_pings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon insert habit_pings" ON public.habit_pings;
CREATE POLICY "anon insert habit_pings"
  ON public.habit_pings FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon read habit_pings" ON public.habit_pings;
CREATE POLICY "anon read habit_pings"
  ON public.habit_pings FOR SELECT TO anon
  USING (true);

-- Verification
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'habit_pings'
ORDER BY ordinal_position;
