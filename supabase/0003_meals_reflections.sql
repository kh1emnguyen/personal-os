-- ============================================================
-- Pulse — meal logs + daily reflections
-- Run in Supabase SQL Editor · project agwujdejggupteumannq
-- ============================================================
-- Phase 2 of Pulse. Two new tables fed by the in-flow ping modal:
--
--   meals       — one row per logged meal. meal_type is a coarse
--                 bucket (Breakfast/Lunch/Snack/Dinner); description
--                 is plain English ("two eggs on toast + coffee").
--                 NO macros are stored — Health OS forms a qualitative
--                 adequacy read from the descriptions, by design.
--
--   reflections — one row per answered reflection prompt (media,
--                 exercise, self-care, feelings, activities, to-dos).
--                 Replaces the standalone Weekly Check-In as the place
--                 those questions get asked; the co-work agent reads
--                 them into vault notes.
--
-- Both mirror the anon insert/read RLS model of habit_pings (0001).
-- Health OS reads the latest `meals` row for its diet panels and the
-- latest-wins snapshot.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.meals (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  logged_at    timestamptz NOT NULL DEFAULT now(),
  meal_type    text        NOT NULL,            -- Breakfast | Lunch | Snack | Dinner
  description  text,                            -- plain-English food + portion
  window_date  date        NOT NULL DEFAULT current_date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meals_logged_at   ON public.meals (logged_at);
CREATE INDEX IF NOT EXISTS idx_meals_window_date ON public.meals (window_date);

CREATE TABLE IF NOT EXISTS public.reflections (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  logged_at    timestamptz NOT NULL DEFAULT now(),
  prompt_id    text        NOT NULL,            -- media | exercise | selfcare | feelings | activities | todos
  prompt_label text,
  response     text        NOT NULL,
  window_date  date        NOT NULL DEFAULT current_date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reflections_logged_at   ON public.reflections (logged_at);
CREATE INDEX IF NOT EXISTS idx_reflections_window_date ON public.reflections (window_date);

-- RLS — browser writes with the anon key, same as habit_pings.
ALTER TABLE public.meals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon insert meals" ON public.meals;
CREATE POLICY "anon insert meals" ON public.meals FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "anon read meals" ON public.meals;
CREATE POLICY "anon read meals" ON public.meals FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon insert reflections" ON public.reflections;
CREATE POLICY "anon insert reflections" ON public.reflections FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "anon read reflections" ON public.reflections;
CREATE POLICY "anon read reflections" ON public.reflections FOR SELECT TO anon USING (true);

-- Verification
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('meals', 'reflections')
ORDER BY table_name, ordinal_position;
