-- ============================================================
-- Stochastic diversity for match_diverse_documents
-- Run in Supabase SQL Editor · project agwujdejggupteumannq
-- ============================================================
-- Extends the existing SRS-aware function. Final score is now a
-- melange of four factors, not just keyword cosine similarity:
--
--   raw_similarity     — cosine similarity to the query embedding
--   frequency_penalty  — obscurity boost (penalises dominant sources)
--   srs_boost          — temporal spaced-repetition boost (half-life 14d)
--   random_jitter      — NEW: per-row random multiplier in
--                        [1 - jitter, 1 + jitter]. Re-rolled every
--                        call, so two identical queries return
--                        differently-ordered result sets.
--
-- The match_threshold filter still runs first, so jitter only ever
-- reshuffles genuinely relevant chunks — it never surfaces noise.
-- ============================================================

CREATE OR REPLACE FUNCTION public.match_diverse_documents(
  query_embedding   vector,
  match_threshold   double precision DEFAULT 0.5,
  match_count       integer          DEFAULT 30,
  filter            jsonb            DEFAULT '{}'::jsonb,
  jitter            double precision DEFAULT 0.18
)
RETURNS TABLE(
  id          bigint,
  content     text,
  metadata    jsonb,
  similarity  double precision
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH raw_matches AS (
    SELECT
      d.id,
      d.content,
      d.metadata,
      d.last_retrieved_at,
      1 - (d.embedding <=> query_embedding)                        AS raw_similarity,
      COALESCE(d.metadata->>'name', d.id::text)                    AS doc_id
    FROM documents d
    WHERE (1 - (d.embedding <=> query_embedding) > match_threshold)
      AND (filter = '{}'::jsonb OR d.metadata @> filter)
  ),
  ranked AS (
    SELECT
      rm.id,
      rm.content,
      rm.metadata,
      rm.raw_similarity,
      rm.last_retrieved_at,
      ROW_NUMBER() OVER (
        PARTITION BY rm.doc_id ORDER BY rm.raw_similarity DESC
      )                                                             AS doc_chunk_rank,
      COUNT(*) OVER (PARTITION BY rm.doc_id)                       AS doc_frequency,
      COALESCE(
        EXTRACT(EPOCH FROM (NOW() - rm.last_retrieved_at)) / 86400.0,
        999.0
      )                                                             AS days_since_retrieved
    FROM raw_matches rm
  )
  SELECT
    r.id,
    r.content,
    r.metadata,
    (
      r.raw_similarity
      -- Obscurity boost (penalises high-frequency sources)
      * (1.0 / (1.0 + (LOG(GREATEST(r.doc_frequency, 1)) * 0.15)))
      -- SRS boost (rewards stale / never-retrieved chunks)
      * (1.0 + 0.4 * (1.0 - EXP(-r.days_since_retrieved / 14.0)))
      -- Stochastic jitter (re-rolled per row, per call)
      * (1.0 + (random() - 0.5) * 2.0 * jitter)
    )::float                                                        AS similarity
  FROM ranked r
  WHERE r.doc_chunk_rank <= 2
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$function$;

-- Verification — run twice; the ordering should differ between runs.
-- SELECT id, ROUND(similarity::numeric, 4)
-- FROM match_diverse_documents('[...query embedding...]'::vector, 0.5, 10);
