-- Add a generated tsvector column combining title, company, and
-- description, per ADR-004 (Postgres full-text search).
-- GENERATED ALWAYS ... STORED means Postgres recomputes this
-- automatically on every insert/update — no application code needs
-- to maintain it manually, and it can never drift out of sync with
-- the source columns.
ALTER TABLE "jobs" ADD COLUMN "search_vector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("company", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("description", '')), 'C')
  ) STORED;

-- GIN index is what makes full-text search on this column fast —
-- ADR-004's explicit action item.
CREATE INDEX "jobs_search_vector_idx" ON "jobs" USING GIN ("search_vector");