-- =========================================================
-- WEBSPEDIA WEBSITE SERVICES & ANALYTICS DATABASE SCHEMA
-- Execute this SQL in Supabase SQL Editor to create tables,
-- seed initial data, and configure Row Level Security (RLS).
-- =========================================================

-- 1. HERO SECTION TABLE
CREATE TABLE IF NOT EXISTS public.website_hero (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text TEXT DEFAULT 'Full-Service Web Development',
    badge_icon TEXT DEFAULT 'Sparkles',
    main_heading TEXT DEFAULT 'Need a Professional Website?',
    highlighted_text TEXT DEFAULT 'Professional Website',
    description TEXT DEFAULT 'Tell us what you need. We''ll design and build a professional website tailored to your business, portfolio, startup, or personal brand.',
    primary_btn_text TEXT DEFAULT 'Request a Website',
    primary_btn_link TEXT DEFAULT '#request-form',
    secondary_btn_text TEXT DEFAULT 'View Our Work',
    secondary_btn_link TEXT DEFAULT '#portfolio',
    card_title TEXT DEFAULT 'Webspedia Digital Studio',
    card_subtitle TEXT DEFAULT 'Custom Web Development',
    card_features JSONB DEFAULT '["⚡ Fast Turnaround", "📱 Mobile First", "🎨 3D Clay UI"]'::jsonb,
    card_description TEXT DEFAULT '"We take your project requirements, create bespoke designs, integrate live database features, and launch your website live in days!"',
    hero_image TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SERVICES CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.website_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    icon TEXT DEFAULT 'Globe',
    description TEXT,
    image_url TEXT DEFAULT '',
    starting_price TEXT DEFAULT '',
    cta_text TEXT DEFAULT 'Request Quote',
    cta_link TEXT DEFAULT '#request-form',
    category TEXT DEFAULT 'Development',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TARGET AUDIENCES TABLE
CREATE TABLE IF NOT EXISTS public.website_audiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'UserCheck',
    image_url TEXT DEFAULT '',
    cta TEXT DEFAULT 'Build Website',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. WHY CHOOSE US (BENEFITS) TABLE
CREATE TABLE IF NOT EXISTS public.website_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'Zap',
    icon_type TEXT DEFAULT 'lucide',
    image_url TEXT DEFAULT '',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PORTFOLIO PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.website_portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    client_name TEXT,
    category TEXT DEFAULT 'General',
    description TEXT,
    thumbnail_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    technologies TEXT[],
    live_url TEXT,
    github_url TEXT,
    case_study_url TEXT,
    client_industry TEXT,
    project_status TEXT DEFAULT 'Completed',
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PRICING PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.website_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT,
    price TEXT NOT NULL,
    currency TEXT DEFAULT '₹',
    price_suffix TEXT DEFAULT '',
    description TEXT,
    category TEXT DEFAULT 'Package',
    features TEXT[],
    delivery_time TEXT DEFAULT '',
    support_duration TEXT DEFAULT '',
    cta_text TEXT DEFAULT 'Choose Package',
    cta_action TEXT DEFAULT '#request-form',
    featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. PROCESS STEPS TABLE
CREATE TABLE IF NOT EXISTS public.website_process (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'CheckCircle2',
    image_url TEXT DEFAULT '',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.website_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. WEBSITE REQUESTS (LEADS) TABLE
CREATE TABLE IF NOT EXISTS public.website_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    business_name TEXT NOT NULL,
    company_name TEXT,
    website_type TEXT DEFAULT 'Business',
    preferred_contact_method TEXT DEFAULT 'WhatsApp',
    budget TEXT DEFAULT '₹5,000 – ₹10,000',
    deadline TEXT,
    current_website TEXT,
    reference_website TEXT,
    existing_domain TEXT DEFAULT 'No',
    existing_logo TEXT DEFAULT 'No',
    project_description TEXT NOT NULL,
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

-- 10. REQUEST FORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.website_form_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    heading TEXT DEFAULT 'Request Your Custom Website',
    description TEXT DEFAULT 'Fill out the form below with your project requirements. We will review your details and contact you with a personalized plan and quotation.',
    success_message TEXT DEFAULT 'Thank you! Your website development request has been received. We will contact you shortly.',
    submit_btn_text TEXT DEFAULT 'Submit Website Request',
    field_visibility JSONB DEFAULT '{"company_name": true, "deadline": true, "budget": true, "current_website": true, "reference_website": true, "existing_domain": true, "existing_logo": true, "additional_requirements": true}'::jsonb,
    required_fields JSONB DEFAULT '{"full_name": true, "phone": true, "email": true, "business_name": true, "project_description": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. CONTACT & WHATSAPP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.website_contact_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_number TEXT DEFAULT '+919876543210',
    phone_number TEXT DEFAULT '+919876543210',
    email TEXT DEFAULT 'contact@webspedia.app',
    whatsapp_template TEXT DEFAULT 'Hello Webspedia! I am interested in getting a custom website built for my business.',
    cta_text TEXT DEFAULT 'Chat on WhatsApp',
    floating_whatsapp_enabled BOOLEAN DEFAULT true,
    phone_button_enabled BOOLEAN DEFAULT true,
    email_button_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. FOOTER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.website_footer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT DEFAULT 'Discover and share the best AI tools and custom web development services.',
    email TEXT DEFAULT 'contact@webspedia.app',
    phone TEXT DEFAULT '+919876543210',
    whatsapp TEXT DEFAULT '+919876543210',
    copyright_text TEXT DEFAULT '© 2026 Webspedia AI Directory & Digital Studio. All rights reserved.',
    quick_links JSONB DEFAULT '[{"label": "Home", "url": "/"}, {"label": "Saved Tools", "url": "/saved-tools"}, {"label": "Profile", "url": "/profile"}]'::jsonb,
    social_links JSONB DEFAULT '[{"platform": "Twitter", "url": "https://twitter.com"}, {"platform": "LinkedIn", "url": "https://linkedin.com"}, {"platform": "GitHub", "url": "https://github.com"}]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. SEO SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.website_seo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_title TEXT DEFAULT 'Webspedia - Custom Web Development & Website Services',
    meta_description TEXT DEFAULT 'Professional custom website development for businesses, startups, portfolios, restaurants, and e-commerce.',
    keywords TEXT DEFAULT 'web development, website design, custom web app, React, Supabase, 3D claymorphism',
    og_title TEXT DEFAULT 'Webspedia - Custom Web Development & Website Services',
    og_description TEXT DEFAULT 'Get a professional website tailored to your brand, business, or startup.',
    og_image TEXT DEFAULT '/logo.png',
    canonical_url TEXT DEFAULT 'https://webspedia.vercel.app/website-services',
    robots_setting TEXT DEFAULT 'index, follow',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. PLATFORM VISITS TABLE
CREATE TABLE IF NOT EXISTS public.platform_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT DEFAULT '/',
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. SOCIAL MEDIA LINKS TABLE
CREATE TABLE IF NOT EXISTS public.social_media_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT 'Share2',
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security & Allow All CRUD Operations
ALTER TABLE public.website_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_process ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_form_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    EXECUTE 'CREATE POLICY "Allow All Hero" ON public.website_hero FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Services" ON public.website_services FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Audiences" ON public.website_audiences FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Benefits" ON public.website_benefits FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Portfolio" ON public.website_portfolio FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Packages" ON public.website_packages FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Process" ON public.website_process FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All FAQs" ON public.website_faqs FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Requests" ON public.website_requests FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Form Settings" ON public.website_form_settings FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Contact Settings" ON public.website_contact_settings FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Footer" ON public.website_footer FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All SEO" ON public.website_seo FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Platform Visits" ON public.platform_visits FOR ALL USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Allow All Social Media Links" ON public.social_media_links FOR ALL USING (true) WITH CHECK (true)';
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

