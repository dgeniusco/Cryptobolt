-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subcategories (child categories)
CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  website_url TEXT,
  logo_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  pricing_type TEXT CHECK (pricing_type IN ('free', 'freemium', 'paid', 'enterprise')),
  pricing_details TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  affiliate_available BOOLEAN DEFAULT false,
  affiliate_url TEXT,
  affiliate_commission TEXT,
  countries_supported TEXT[] DEFAULT '{}',
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '{}',
  founded_year INTEGER,
  headquarters TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  discord_url TEXT,
  telegram_url TEXT,
  reddit_url TEXT,
  github_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID,
  author_name TEXT NOT NULL,
  author_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comparisons table (stores comparison metadata)
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_a_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_b_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_a_id, company_b_id)
);

-- Best Of lists (for SEO pages)
CREATE TABLE best_of_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Best Of list items (companies in each list)
CREATE TABLE best_of_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES best_of_lists(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  blurb TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, company_id)
);

-- Featured listings (monetization)
CREATE TABLE featured_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  placement TEXT NOT NULL CHECK (placement IN ('homepage_hero', 'category_top', 'search_result', 'comparison_sidebar')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE best_of_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE best_of_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "categories_select" ON categories FOR SELECT
  TO PUBLIC USING (is_active = true);
CREATE POLICY "categories_insert" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "categories_update" ON categories FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "categories_delete" ON categories FOR DELETE
  TO authenticated USING (true);

-- RLS Policies for subcategories (public read)
CREATE POLICY "subcategories_select" ON subcategories FOR SELECT
  TO PUBLIC USING (is_active = true);
CREATE POLICY "subcategories_insert" ON subcategories FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "subcategories_update" ON subcategories FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "subcategories_delete" ON subcategories FOR DELETE
  TO authenticated USING (true);

-- RLS Policies for companies (public read)
CREATE POLICY "companies_select" ON companies FOR SELECT
  TO PUBLIC USING (true);
CREATE POLICY "companies_insert" ON companies FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "companies_update" ON companies FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "companies_delete" ON companies FOR DELETE
  TO authenticated USING (true);

-- RLS Policies for reviews (public read, authenticated write)
CREATE POLICY "reviews_select" ON reviews FOR SELECT
  TO PUBLIC USING (is_approved = true OR auth.uid() IS NOT NULL);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "reviews_update" ON reviews FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "reviews_delete" ON reviews FOR DELETE
  TO authenticated USING (true);

-- RLS Policies for comparisons (public read)
CREATE POLICY "comparisons_select" ON comparisons FOR SELECT
  TO PUBLIC USING (true);
CREATE POLICY "comparisons_insert" ON comparisons FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "comparisons_update" ON comparisons FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "comparisons_delete" ON comparisons FOR DELETE
  TO authenticated USING (true);

-- RLS Policies for best_of_lists (public read if published)
CREATE POLICY "best_of_lists_select" ON best_of_lists FOR SELECT
  TO PUBLIC USING (is_published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "best_of_lists_insert" ON best_of_lists FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "best_of_lists_update" ON best_of_lists FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "best_of_lists_delete" ON best_of_lists FOR DELETE
  TO authenticated USING (true);

-- RLS Policies for best_of_items (public read if list is published)
CREATE POLICY "best_of_items_select" ON best_of_items FOR SELECT
  TO PUBLIC USING (EXISTS (
    SELECT 1 FROM best_of_lists WHERE best_of_lists.id = best_of_items.list_id AND is_published = true
  ) OR auth.uid() IS NOT NULL);
CREATE POLICY "best_of_items_insert" ON best_of_items FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "best_of_items_update" ON best_of_items FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "best_of_items_delete" ON best_of_items FOR DELETE
  TO authenticated USING (true);

-- RLS Policies for featured_listings (public read if active)
CREATE POLICY "featured_listings_select" ON featured_listings FOR SELECT
  TO PUBLIC USING (is_active = true);
CREATE POLICY "featured_listings_insert" ON featured_listings FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "featured_listings_update" ON featured_listings FOR UPDATE
  TO authenticated USING (true);
CREATE POLICY "featured_listings_delete" ON featured_listings FOR DELETE
  TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_category ON companies(category_id);
CREATE INDEX idx_companies_subcategory ON companies(subcategory_id);
CREATE INDEX idx_companies_featured ON companies(is_featured);
CREATE INDEX idx_companies_rating ON companies(rating DESC);
CREATE INDEX idx_companies_created ON companies(created_at DESC);
CREATE INDEX idx_reviews_company ON reviews(company_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_companies_affiliate ON companies(affiliate_available);
CREATE INDEX idx_featured_active ON featured_listings(is_active) WHERE is_active = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER categories_updated BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subcategories_updated BEFORE UPDATE ON subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER companies_updated BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER reviews_updated BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER comparisons_updated BEFORE UPDATE ON comparisons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER best_of_lists_updated BEFORE UPDATE ON best_of_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();