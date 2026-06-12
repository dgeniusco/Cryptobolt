CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_slug TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliate_clicks_company ON affiliate_clicks(company_id);
CREATE INDEX idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at);
CREATE INDEX idx_affiliate_clicks_company_slug ON affiliate_clicks(company_slug);

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon/service role (no auth required for click tracking)
CREATE POLICY "affiliate_clicks_insert" ON affiliate_clicks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- No public select — only authenticated users can read analytics
CREATE POLICY "affiliate_clicks_select" ON affiliate_clicks FOR SELECT
  TO authenticated USING (true);