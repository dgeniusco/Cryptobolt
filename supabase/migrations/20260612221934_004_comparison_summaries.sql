CREATE TABLE comparison_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  bottom_line TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  model TEXT
);

CREATE INDEX idx_comparison_summaries_slug ON comparison_summaries(comparison_slug);

ALTER TABLE comparison_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comparison_summaries_select" ON comparison_summaries FOR SELECT
  TO PUBLIC USING (true);

CREATE POLICY "comparison_summaries_insert" ON comparison_summaries FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "comparison_summaries_update" ON comparison_summaries FOR UPDATE
  TO authenticated USING (true);