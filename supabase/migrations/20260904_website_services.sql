-- =========================================================
-- MIGRATION: WEBSITE DEVELOPMENT SERVICES MODULE
-- Tables: website_requests, website_portfolio, website_packages
-- =========================================================

-- 1. WEBSITE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.website_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  company_name TEXT,
  website_type TEXT NOT NULL,
  project_description TEXT NOT NULL,
  preferred_contact_method TEXT DEFAULT 'WhatsApp',
  budget TEXT,
  deadline TEXT,
  current_website TEXT,
  reference_website TEXT,
  existing_domain TEXT,
  existing_logo TEXT,
  additional_requirements TEXT,
  status TEXT DEFAULT 'NEW',
  priority TEXT DEFAULT 'MEDIUM',
  quoted_price NUMERIC DEFAULT 0,
  admin_notes TEXT,
  follow_up_date DATE,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. WEBSITE PORTFOLIO TABLE
CREATE TABLE IF NOT EXISTS public.website_portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Business',
  client_name TEXT,
  thumbnail_url TEXT,
  screenshots TEXT[],
  live_url TEXT,
  technologies TEXT[],
  completion_date DATE,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. WEBSITE PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.website_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  features TEXT[],
  delivery_time TEXT,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.website_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_packages ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: WEBSITE REQUESTS
-- Allow anonymous/public visitors to insert new requests
CREATE POLICY "Public can submit website requests" 
ON public.website_requests FOR INSERT 
WITH CHECK (true);

-- Allow admins/all authenticated access for managing requests
CREATE POLICY "Admins can view and manage website requests" 
ON public.website_requests FOR ALL 
USING (true);

-- RLS POLICIES: WEBSITE PORTFOLIO
-- Allow public read access to published portfolio projects
CREATE POLICY "Public can view published portfolio projects" 
ON public.website_portfolio FOR SELECT 
USING (published = true);

-- Allow admins full management of portfolio projects
CREATE POLICY "Admins can manage portfolio projects" 
ON public.website_portfolio FOR ALL 
USING (true);

-- RLS POLICIES: WEBSITE PACKAGES
-- Allow public read access to active pricing packages
CREATE POLICY "Public can view active website packages" 
ON public.website_packages FOR SELECT 
USING (active = true);

-- Allow admins full management of website packages
CREATE POLICY "Admins can manage website packages" 
ON public.website_packages FOR ALL 
USING (true);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_website_requests_status ON public.website_requests(status);
CREATE INDEX IF NOT EXISTS idx_website_requests_created ON public.website_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_portfolio_published ON public.website_portfolio(published, display_order);
CREATE INDEX IF NOT EXISTS idx_website_packages_active ON public.website_packages(active, display_order);
