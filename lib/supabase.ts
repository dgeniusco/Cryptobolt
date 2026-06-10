import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  website_url: string | null;
  logo_url: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  tags: string[];
  pricing_type: 'free' | 'freemium' | 'paid' | 'enterprise' | null;
  pricing_details: string | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_verified: boolean;
  affiliate_available: boolean;
  affiliate_url: string | null;
  affiliate_commission: string | null;
  countries_supported: string[];
  pros: string[];
  cons: string[];
  features: Record<string, unknown>;
  founded_year: number | null;
  headquarters: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  discord_url: string | null;
  telegram_url: string | null;
  reddit_url: string | null;
  github_url: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
};

export type Review = {
  id: string;
  company_id: string;
  user_id: string | null;
  author_name: string;
  author_email: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  pros: string[];
  cons: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
};

export type Comparison = {
  id: string;
  company_a_id: string;
  company_b_id: string;
  slug: string;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type BestOfList = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};
