import { supabase } from './supabase';

// =========================================================
// WEBSPEDIA WEBSITE SERVICES DATA ACCESS LAYER (API)
// Handles complete CRUD operations with Supabase PostgREST &
// graceful fallback state management.
// =========================================================

// Default Seed Data matching current Webspedia website
export const INITIAL_HERO = {
  id: 'hero-1',
  badge_text: 'Full-Service Web Development',
  badge_icon: 'Sparkles',
  main_heading: 'Need a Professional Website?',
  highlighted_text: 'Professional Website',
  description: "Tell us what you need. We'll design and build a professional website tailored to your business, portfolio, startup, or personal brand.",
  primary_btn_text: 'Request a Website',
  primary_btn_link: '#request-form',
  secondary_btn_text: 'View Our Work',
  secondary_btn_link: '#portfolio',
  card_title: 'Webspedia Digital Studio',
  card_subtitle: 'Custom Web Development',
  card_features: ['⚡ Fast Turnaround', '📱 Mobile First', '🎨 3D Clay UI'],
  card_description: '"We take your project requirements, create bespoke designs, integrate live database features, and launch your website live in days!"',
  hero_image: '',
  is_active: true
};

export const INITIAL_SERVICES = [
  { id: 's1', title: "Business Websites", slug: "business-websites", icon: "Building", description: "Professional corporate websites that establish instant credibility and capture valuable client leads.", starting_price: "₹4,999", cta_text: "Request Quote", category: "Corporate", display_order: 1, is_active: true, is_featured: true },
  { id: 's2', title: "Portfolio Websites", slug: "portfolio-websites", icon: "Briefcase", description: "Showcase your creative work, resume, and personal brand with slick, modern portfolio layouts.", starting_price: "₹1,999", cta_text: "Build Portfolio", category: "Personal", display_order: 2, is_active: true, is_featured: false },
  { id: 's3', title: "Landing Pages", slug: "landing-pages", icon: "Layers", description: "High-converting single-page landing pages optimized for marketing campaigns and product launches.", starting_price: "₹2,499", cta_text: "Create Landing Page", category: "Marketing", display_order: 3, is_active: true, is_featured: false },
  { id: 's4', title: "Restaurant Websites", slug: "restaurant-websites", icon: "Utensils", description: "Digital menus, table reservations, online order inquiries, and location maps for food brands.", starting_price: "₹3,999", cta_text: "Get Digital Menu", category: "Food & Beverage", display_order: 4, is_active: true, is_featured: false },
  { id: 's5', title: "E-commerce Websites", slug: "ecommerce-websites", icon: "ShoppingBag", description: "Custom online storefronts with product catalogs, shopping carts, and payment processing.", starting_price: "₹9,999", cta_text: "Launch Store", category: "Retail", display_order: 5, is_active: true, is_featured: true },
  { id: 's6', title: "Education Websites", slug: "education-websites", icon: "GraduationCap", description: "Institutions, online academies, course catalogs, student portals, and inquiry management.", starting_price: "₹6,999", cta_text: "Setup Portal", category: "Education", display_order: 6, is_active: true, is_featured: false },
  { id: 's7', title: "Real Estate Websites", slug: "real-estate-websites", icon: "Home", description: "Interactive property showcases, high-res galleries, filter search, and direct inquiry forms.", starting_price: "₹7,999", cta_text: "Showcase Properties", category: "Real Estate", display_order: 7, is_active: true, is_featured: false },
  { id: 's8', title: "Startup Websites", slug: "startup-websites", icon: "Rocket", description: "SaaS landing pages, feature showcases, investor pitch sites, and newsletter waitlists.", starting_price: "₹5,999", cta_text: "Launch Startup Site", category: "SaaS", display_order: 8, is_active: true, is_featured: false },
  { id: 's9', title: "Custom Web Applications", slug: "custom-web-applications", icon: "Code2", description: "Tailored full-stack web applications with database, authentication, API integrations, and dashboards.", starting_price: "₹14,999+", cta_text: "Build Custom App", category: "App", display_order: 9, is_active: true, is_featured: true }
];

export const INITIAL_AUDIENCES = [
  { id: 'a1', title: "Startups & Founders", description: "SaaS landing pages, investor pitch sites, and user waitlists.", icon: "Rocket", cta: "Launch Startup Site", display_order: 1, is_active: true },
  { id: 'a2', title: "Small & Medium Businesses", description: "Corporate brand websites, service catalogs, and lead capture forms.", icon: "Building", cta: "Grow Business", display_order: 2, is_active: true },
  { id: 'a3', title: "Restaurants & Cafes", description: "Digital menus, booking inquiries, and Google Maps integration.", icon: "Utensils", cta: "Digital Menu", display_order: 3, is_active: true },
  { id: 'a4', title: "Real Estate Agencies", description: "Property listing portals, virtual tours, and client lead capture.", icon: "Home", cta: "Property Portal", display_order: 4, is_active: true },
  { id: 'a5', title: "E-commerce & Retail Brands", description: "Online store, product catalogs, and payment checkout integration.", icon: "ShoppingBag", cta: "Start Selling", display_order: 5, is_active: true },
  { id: 'a6', title: "Professionals & Creators", description: "Personal portfolios, blogs, resumes, and service booking pages.", icon: "Briefcase", cta: "Build Portfolio", display_order: 6, is_active: true }
];

export const INITIAL_BENEFITS = [
  { id: 'b1', title: "Custom Design", description: "No cookie-cutter templates. Unique 3D designs tailored to your brand identity.", icon: "Palette", display_order: 1, is_active: true },
  { id: 'b2', title: "Mobile Responsive", description: "Flawless rendering on iPhones, Android phones, tablets, laptops, and 4K displays.", icon: "Smartphone", display_order: 2, is_active: true },
  { id: 'b3', title: "Fast Performance", description: "Blazing fast load times with Vite, React, and optimized assets.", icon: "Zap", display_order: 3, is_active: true },
  { id: 'b4', title: "SEO Friendly", description: "Clean semantic markup, meta tags, and structured data for search engines.", icon: "Search", display_order: 4, is_active: true },
  { id: 'b5', title: "Secure Development", description: "SSL encryption, HTTPS setup, and safe database security policies.", icon: "ShieldCheck", display_order: 5, is_active: true },
  { id: 'b6', title: "Deployment Support", description: "Free hosting setup on Vercel or Netlify with custom domain configuration.", icon: "Rocket", display_order: 6, is_active: true },
  { id: 'b7', title: "Direct Developer Support", description: "Speak directly with your developer on WhatsApp or Phone anytime.", icon: "Headphones", display_order: 7, is_active: true },
  { id: 'b8', title: "Dedicated Revisions", description: "We revise and refine your site design until it matches your exact expectations.", icon: "CheckCircle2", display_order: 8, is_active: true }
];

export const INITIAL_PORTFOLIO = [
  {
    id: 'p0',
    project_name: 'SHYADHA TECHNOLOGIES',
    client_name: 'SHYADHA group',
    category: 'Startup',
    description: 'Official web portal for SHYADHA group providing technological solutions, client inquiry workflows, and service information.',
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    live_url: 'https://shyadhatechnologies.com',
    technologies: ['React', 'Supabase', 'Tailwind', 'Vite'],
    client_industry: 'Technology',
    project_status: 'Completed',
    featured: true,
    published: true,
    display_order: 1
  },
  {
    id: 'p1',
    project_name: 'Apex Real Estate Hub',
    client_name: 'Apex Realty Group',
    category: 'Real Estate',
    description: 'Modern luxury real estate listing portal with interactive property search, virtual tours, and WhatsApp lead capture.',
    thumbnail_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80',
    live_url: 'https://example.com',
    technologies: ['React', 'Supabase', 'Tailwind', 'Vite'],
    client_industry: 'Real Estate',
    project_status: 'Completed',
    featured: true,
    published: true,
    display_order: 2
  },
  {
    id: 'p2',
    project_name: 'Gourmet Bistro Dining',
    client_name: 'Bistro 24',
    category: 'Restaurant',
    description: 'Elegant restaurant web application featuring interactive digital menus, table reservation booking, and location integration.',
    thumbnail_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    live_url: 'https://example.com',
    technologies: ['React', '3D Clay', 'CSS3', 'Vercel'],
    client_industry: 'Hospitality',
    project_status: 'Completed',
    featured: false,
    published: true,
    display_order: 3
  },
  {
    id: 'p3',
    project_name: 'Pulse Fitness Studio',
    client_name: 'Pulse Gym & Fitness',
    category: 'Business',
    description: 'High-converting landing page & membership portal with trainer profiles, class schedules, and automated lead capture.',
    thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    live_url: 'https://example.com',
    technologies: ['React', 'Supabase', 'Responsive UI'],
    client_industry: 'Health & Fitness',
    project_status: 'Completed',
    featured: false,
    published: true,
    display_order: 4
  }
];

export const INITIAL_PACKAGES = [
  {
    id: 'pkg-1',
    name: 'STARTER',
    price: '₹1,999',
    currency: '₹',
    price_suffix: 'one-time',
    description: 'Perfect for personal portfolios, simple landing pages, and small local business sites.',
    features: [
      '1–3 Custom Responsive Pages',
      'Mobile & Tablet Optimized',
      'Contact & Lead Capture Form',
      'Basic SEO & Meta Configuration',
      'Fast Vercel/Netlify Deployment',
      '1 Month Free Support'
    ],
    delivery_time: '2–3 Days',
    support_duration: '1 Month',
    cta_text: 'Choose STARTER',
    cta_action: '#request-form',
    featured: false,
    display_order: 1,
    active: true
  },
  {
    id: 'pkg-2',
    name: 'PROFESSIONAL',
    price: '₹4,999',
    currency: '₹',
    price_suffix: 'one-time',
    description: 'Ideal for growing businesses, startups, restaurants, and active service providers.',
    features: [
      'Up to 7 Custom Designed Pages',
      '3D Claymorphism & Micro-animations',
      'WhatsApp Direct Chat Button',
      'Advanced SEO & Analytics Integration',
      'Custom Domain Setup & HTTPS',
      'Database & Inquiry Management',
      '3 Months Free Support'
    ],
    delivery_time: '4–6 Days',
    support_duration: '3 Months',
    cta_text: 'Choose PROFESSIONAL',
    cta_action: '#request-form',
    featured: true,
    display_order: 2,
    active: true
  },
  {
    id: 'pkg-3',
    name: 'BUSINESS',
    price: '₹9,999+',
    currency: '₹',
    price_suffix: 'starting',
    description: 'Comprehensive web application with database, authentication, and custom workflow.',
    features: [
      'Unlimited Custom Pages & Layouts',
      'Supabase / PostgreSQL Database Integration',
      'User Login & Role Authentication',
      'Admin Dashboard & CRUD Controls',
      'E-commerce / Payment Gateway Ready',
      'High Speed CDN & Security Hardening',
      '6 Months Priority Technical Support'
    ],
    delivery_time: '7–12 Days',
    support_duration: '6 Months',
    cta_text: 'Choose BUSINESS',
    cta_action: '#request-form',
    featured: false,
    display_order: 3,
    active: true
  }
];

export const INITIAL_PROCESS = [
  { id: 'pr1', step_number: '01', title: 'Tell Us Your Idea', description: 'Submit your requirements via our request form or chat directly on WhatsApp to share your vision.', icon: 'MessageSquare', display_order: 1, is_active: true },
  { id: 'pr2', step_number: '02', title: 'Get Your Quote', description: 'We analyze your requirements and provide an estimated timeline and transparent price quotation.', icon: 'DollarSign', display_order: 2, is_active: true },
  { id: 'pr3', step_number: '03', title: 'Design & Development', description: 'Our developers craft bespoke 3D UI layouts, implement responsive code, and connect database features.', icon: 'Code2', display_order: 3, is_active: true },
  { id: 'pr4', step_number: '04', title: 'Review & Revisions', description: 'Preview your live preview link, test features on mobile/desktop, and request any design refinements.', icon: 'CheckCircle2', display_order: 4, is_active: true },
  { id: 'pr5', step_number: '05', title: 'Launch & Support', description: 'We deploy your website live to Vercel/Netlify, connect your domain, and provide ongoing support.', icon: 'Rocket', display_order: 5, is_active: true }
];

export const INITIAL_FAQS = [
  { id: 'fq1', question: "How long does a website take to build?", answer: "Starter websites take 2–3 days, Professional websites take 4–6 days, and Custom Web Applications take 7–12 days depending on requirements.", category: "Timeline", display_order: 1, is_active: true },
  { id: 'fq2', question: "Do you provide domain and hosting support?", answer: "Yes! We set up free high-speed hosting on Vercel or Netlify and assist you in connecting your custom domain name with HTTPS security.", category: "Hosting", display_order: 2, is_active: true },
  { id: 'fq3', question: "Can I request custom features and database controls?", answer: "Absolutely. We build custom full-stack solutions using React, Supabase, PostgreSQL, user authentication, and custom admin dashboards.", category: "Features", display_order: 3, is_active: true },
  { id: 'fq4', question: "Can you redesign my existing website?", answer: "Yes! We can modernize your current website into a 3D claymorphic UI with improved speed, mobile responsiveness, and higher conversion rates.", category: "Redesign", display_order: 4, is_active: true },
  { id: 'fq5', question: "Do you build e-commerce websites?", answer: "Yes, we create custom storefronts with product catalogs, shopping carts, inquiry management, and payment gateway readiness.", category: "E-commerce", display_order: 5, is_active: true },
  { id: 'fq6', question: "Can I update my website content later?", answer: "Yes, we can provide you with an Admin Hub interface to update products, text, prices, and images without touching source code.", category: "Content", display_order: 6, is_active: true },
  { id: 'fq7', question: "Do you provide ongoing technical support?", answer: "All packages include free support (1 to 6 months depending on tier) for bug fixes, minor tweaks, and technical assistance.", category: "Support", display_order: 7, is_active: true }
];

export const INITIAL_FORM_SETTINGS = {
  id: 'fs1',
  heading: 'Request Your Custom Website',
  description: 'Fill out the form below with your project requirements. We will review your details and contact you with a personalized plan and quotation.',
  success_message: 'Thank you! Your website development request has been received. We will contact you shortly.',
  submit_btn_text: 'Submit Website Request',
  field_visibility: {
    company_name: true,
    deadline: true,
    budget: true,
    current_website: true,
    reference_website: true,
    existing_domain: true,
    existing_logo: true,
    additional_requirements: true
  },
  required_fields: {
    full_name: true,
    phone: true,
    email: true,
    business_name: true,
    project_description: true
  }
};

export const INITIAL_CONTACT_SETTINGS = {
  id: 'cs1',
  whatsapp_number: '+919876543210',
  phone_number: '+919876543210',
  email: 'contact@webspedia.app',
  whatsapp_template: "Hello Webspedia! I am interested in building a custom website for my business.",
  cta_text: 'Chat on WhatsApp',
  floating_whatsapp_enabled: true,
  phone_button_enabled: true,
  email_button_enabled: true
};

export const INITIAL_FOOTER_SETTINGS = {
  id: 'ft1',
  description: 'Discover and share the best AI tools and custom web development services.',
  email: 'contact@webspedia.app',
  phone: '+919876543210',
  whatsapp: '+919876543210',
  copyright_text: '© 2026 Webspedia Digital Studio. All rights reserved.',
  quick_links: [
    { label: 'Home', url: '/' },
    { label: 'Saved Tools', url: '/saved-tools' },
    { label: 'Profile', url: '/profile' }
  ],
  social_links: [
    { platform: 'Twitter', url: 'https://twitter.com' },
    { platform: 'LinkedIn', url: 'https://linkedin.com' },
    { platform: 'GitHub', url: 'https://github.com' }
  ]
};

export const INITIAL_SEO_SETTINGS = {
  id: 'seo1',
  page_title: 'Webspedia - Custom Web Development & Website Services',
  meta_description: 'Professional custom website development for businesses, startups, portfolios, restaurants, and e-commerce.',
  keywords: 'web development, website design, custom web app, React, Supabase, 3D claymorphism',
  og_title: 'Webspedia - Custom Web Development & Website Services',
  og_description: 'Get a professional website tailored to your brand, business, or startup.',
  og_image: '/logo.png',
  canonical_url: 'https://webspedia.vercel.app/website-services',
  robots_setting: 'index, follow'
};

// Local storage helper fallback
function getLocal(key, defaultVal) {
  try {
    const raw = localStorage.getItem(`webspedia_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (err) {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(`webspedia_${key}`, JSON.stringify(val));
  } catch (err) {}
}

// Helper to query Supabase or fallback
async function fetchGeneric(table, localKey, defaultVal) {
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (!error && data && data.length > 0) {
      // Sort if display_order exists
      if (data[0].display_order !== undefined) {
        data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      }
      setLocal(localKey, data);
      return data;
    }
  } catch (e) {}
  return getLocal(localKey, defaultVal);
}

// ---------------------------------------------------------
// 1. HERO SECTION API
// ---------------------------------------------------------
export async function getHeroSettings() {
  const data = await fetchGeneric('website_hero', 'hero', [INITIAL_HERO]);
  return Array.isArray(data) ? (data[0] || INITIAL_HERO) : data;
}

export async function updateHeroSettings(payload) {
  try {
    const { data, error } = await supabase.from('website_hero').upsert([payload]).select();
    if (!error && data && data[0]) {
      setLocal('hero', [data[0]]);
      return data[0];
    }
  } catch (e) {}
  setLocal('hero', [payload]);
  return payload;
}

// ---------------------------------------------------------
// 2. SERVICES CATALOG API
// ---------------------------------------------------------
export async function getServices() {
  return await fetchGeneric('website_services', 'services', INITIAL_SERVICES);
}

export async function createService(item) {
  const newItem = { id: `srv_${Date.now()}`, is_active: true, display_order: Date.now(), ...item };
  try {
    const { data, error } = await supabase.from('website_services').insert([newItem]).select();
    if (!error && data && data[0]) {
      const current = getLocal('services', INITIAL_SERVICES);
      setLocal('services', [...current, data[0]]);
      return data[0];
    }
  } catch (e) {}
  const current = getLocal('services', INITIAL_SERVICES);
  const updated = [...current, newItem];
  setLocal('services', updated);
  return newItem;
}

export async function updateService(id, payload) {
  try {
    const { error } = await supabase.from('website_services').update(payload).eq('id', id);
    if (!error) {
      const current = getLocal('services', INITIAL_SERVICES);
      const updated = current.map(item => item.id === id ? { ...item, ...payload } : item);
      setLocal('services', updated);
      return true;
    }
  } catch (e) {}
  const current = getLocal('services', INITIAL_SERVICES);
  const updated = current.map(item => item.id === id ? { ...item, ...payload } : item);
  setLocal('services', updated);
  return true;
}

export async function deleteService(id) {
  try {
    await supabase.from('website_services').delete().eq('id', id);
  } catch (e) {}
  const current = getLocal('services', INITIAL_SERVICES);
  const updated = current.filter(item => item.id !== id);
  setLocal('services', updated);
  return true;
}

// ---------------------------------------------------------
// 3. TARGET AUDIENCES API
// ---------------------------------------------------------
export async function getTargetAudiences() {
  return await fetchGeneric('website_audiences', 'audiences', INITIAL_AUDIENCES);
}

export async function createTargetAudience(item) {
  const newItem = { id: `aud_${Date.now()}`, is_active: true, display_order: Date.now(), ...item };
  try {
    const { data, error } = await supabase.from('website_audiences').insert([newItem]).select();
    if (!error && data && data[0]) {
      const current = getLocal('audiences', INITIAL_AUDIENCES);
      setLocal('audiences', [...current, data[0]]);
      return data[0];
    }
  } catch (e) {}
  const current = getLocal('audiences', INITIAL_AUDIENCES);
  const updated = [...current, newItem];
  setLocal('audiences', updated);
  return newItem;
}

export async function updateTargetAudience(id, payload) {
  try {
    await supabase.from('website_audiences').update(payload).eq('id', id);
  } catch (e) {}
  const current = getLocal('audiences', INITIAL_AUDIENCES);
  const updated = current.map(item => item.id === id ? { ...item, ...payload } : item);
  setLocal('audiences', updated);
  return true;
}

export async function deleteTargetAudience(id) {
  try {
    await supabase.from('website_audiences').delete().eq('id', id);
  } catch (e) {}
  const current = getLocal('audiences', INITIAL_AUDIENCES);
  const updated = current.filter(item => item.id !== id);
  setLocal('audiences', updated);
  return true;
}

// ---------------------------------------------------------
// 4. WHY CHOOSE US (BENEFITS) API
// ---------------------------------------------------------
export async function getWhyChooseUs() {
  return await fetchGeneric('website_benefits', 'benefits', INITIAL_BENEFITS);
}

export async function createWhyChooseUs(item) {
  const newItem = { id: `ben_${Date.now()}`, is_active: true, display_order: Date.now(), ...item };
  try {
    const { data, error } = await supabase.from('website_benefits').insert([newItem]).select();
    if (!error && data && data[0]) {
      const current = getLocal('benefits', INITIAL_BENEFITS);
      setLocal('benefits', [...current, data[0]]);
      return data[0];
    }
  } catch (e) {}
  const current = getLocal('benefits', INITIAL_BENEFITS);
  const updated = [...current, newItem];
  setLocal('benefits', updated);
  return newItem;
}

export async function updateWhyChooseUs(id, payload) {
  try {
    await supabase.from('website_benefits').update(payload).eq('id', id);
  } catch (e) {}
  const current = getLocal('benefits', INITIAL_BENEFITS);
  const updated = current.map(item => item.id === id ? { ...item, ...payload } : item);
  setLocal('benefits', updated);
  return true;
}

export async function deleteWhyChooseUs(id) {
  try {
    await supabase.from('website_benefits').delete().eq('id', id);
  } catch (e) {}
  const current = getLocal('benefits', INITIAL_BENEFITS);
  const updated = current.filter(item => item.id !== id);
  setLocal('benefits', updated);
  return true;
}

// ---------------------------------------------------------
// 5. PORTFOLIO API
// ---------------------------------------------------------
export async function getPortfolio() {
  return await fetchGeneric('website_portfolio', 'portfolio', INITIAL_PORTFOLIO);
}

export async function createPortfolioItem(item) {
  const newItem = { id: `port_${Date.now()}`, published: true, featured: false, display_order: Date.now(), ...item };
  try {
    const { data, error } = await supabase.from('website_portfolio').insert([newItem]).select();
    if (!error && data && data[0]) {
      const current = getLocal('portfolio', INITIAL_PORTFOLIO);
      setLocal('portfolio', [...current, data[0]]);
      return data[0];
    }
  } catch (e) {}
  const current = getLocal('portfolio', INITIAL_PORTFOLIO);
  const updated = [...current, newItem];
  setLocal('portfolio', updated);
  return newItem;
}

export async function updatePortfolioItem(id, payload) {
  try {
    await supabase.from('website_portfolio').update(payload).eq('id', id);
  } catch (e) {}
  const current = getLocal('portfolio', INITIAL_PORTFOLIO);
  const updated = current.map(item => item.id === id ? { ...item, ...payload } : item);
  setLocal('portfolio', updated);
  return true;
}

export async function deletePortfolioItem(id) {
  try {
    await supabase.from('website_portfolio').delete().eq('id', id);
  } catch (e) {}
  const current = getLocal('portfolio', INITIAL_PORTFOLIO);
  const updated = current.filter(item => item.id !== id);
  setLocal('portfolio', updated);
  return true;
}

// ---------------------------------------------------------
// 6. PRICING PACKAGES API
// ---------------------------------------------------------
export async function getPackages() {
  return await fetchGeneric('website_packages', 'packages', INITIAL_PACKAGES);
}

export async function createPackage(item) {
  const newItem = { id: `pkg_${Date.now()}`, active: true, featured: false, display_order: Date.now(), ...item };
  try {
    const { data, error } = await supabase.from('website_packages').insert([newItem]).select();
    if (!error && data && data[0]) {
      const current = getLocal('packages', INITIAL_PACKAGES);
      setLocal('packages', [...current, data[0]]);
      return data[0];
    }
  } catch (e) {}
  const current = getLocal('packages', INITIAL_PACKAGES);
  const updated = [...current, newItem];
  setLocal('packages', updated);
  return newItem;
}

export async function updatePackage(id, payload) {
  try {
    await supabase.from('website_packages').update(payload).eq('id', id);
  } catch (e) {}
  const current = getLocal('packages', INITIAL_PACKAGES);
  const updated = current.map(item => item.id === id ? { ...item, ...payload } : item);
  setLocal('packages', updated);
  return true;
}

export async function deletePackage(id) {
  try {
    await supabase.from('website_packages').delete().eq('id', id);
  } catch (e) {}
  const current = getLocal('packages', INITIAL_PACKAGES);
  const updated = current.filter(item => item.id !== id);
  setLocal('packages', updated);
  return true;
}

// ---------------------------------------------------------
// 7. PROCESS STEPS API
// ---------------------------------------------------------
export async function getProcessSteps() {
  return await fetchGeneric('website_process', 'process', INITIAL_PROCESS);
}

export async function createProcessStep(item) {
  const newItem = { id: `pr_${Date.now()}`, is_active: true, display_order: Date.now(), ...item };
  try {
    const { data, error } = await supabase.from('website_process').insert([newItem]).select();
    if (!error && data && data[0]) {
      const current = getLocal('process', INITIAL_PROCESS);
      setLocal('process', [...current, data[0]]);
      return data[0];
    }
  } catch (e) {}
  const current = getLocal('process', INITIAL_PROCESS);
  const updated = [...current, newItem];
  setLocal('process', updated);
  return newItem;
}

export async function updateProcessStep(id, payload) {
  try {
    await supabase.from('website_process').update(payload).eq('id', id);
  } catch (e) {}
  const current = getLocal('process', INITIAL_PROCESS);
  const updated = current.map(item => item.id === id ? { ...item, ...payload } : item);
  setLocal('process', updated);
  return true;
}

export async function deleteProcessStep(id) {
  try {
    await supabase.from('website_process').delete().eq('id', id);
  } catch (e) {}
  const current = getLocal('process', INITIAL_PROCESS);
  const updated = current.filter(item => item.id !== id);
  setLocal('process', updated);
  return true;
}

// ---------------------------------------------------------
// 8. FAQS API
// ---------------------------------------------------------
export async function getFaqs() {
  return await fetchGeneric('website_faqs', 'faqs', INITIAL_FAQS);
}

export async function createFaq(item) {
  const newItem = { id: `fq_${Date.now()}`, is_active: true, display_order: Date.now(), ...item };
  try {
    const { data, error } = await supabase.from('website_faqs').insert([newItem]).select();
    if (!error && data && data[0]) {
      const current = getLocal('faqs', INITIAL_FAQS);
      setLocal('faqs', [...current, data[0]]);
      return data[0];
    }
  } catch (e) {}
  const current = getLocal('faqs', INITIAL_FAQS);
  const updated = [...current, newItem];
  setLocal('faqs', updated);
  return newItem;
}

export async function updateFaq(id, payload) {
  try {
    await supabase.from('website_faqs').update(payload).eq('id', id);
  } catch (e) {}
  const current = getLocal('faqs', INITIAL_FAQS);
  const updated = current.map(item => item.id === id ? { ...item, ...payload } : item);
  setLocal('faqs', updated);
  return true;
}

export async function deleteFaq(id) {
  try {
    await supabase.from('website_faqs').delete().eq('id', id);
  } catch (e) {}
  const current = getLocal('faqs', INITIAL_FAQS);
  const updated = current.filter(item => item.id !== id);
  setLocal('faqs', updated);
  return true;
}

// ---------------------------------------------------------
// 9. WEBSITE REQUESTS (LEADS) API
// ---------------------------------------------------------
export async function getWebsiteRequests() {
  try {
    const { data, error } = await supabase
      .from('website_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLocal('requests', data);
      return data;
    }
  } catch (e) {}
  return getLocal('requests', []);
}

export async function updateWebsiteRequest(id, payload) {
  try {
    await supabase.from('website_requests').update(payload).eq('id', id);
  } catch (e) {}
  const current = getLocal('requests', []);
  const updated = current.map(item => item.id === id ? { ...item, ...payload } : item);
  setLocal('requests', updated);
  return true;
}

export async function deleteWebsiteRequest(id) {
  try {
    await supabase.from('website_requests').delete().eq('id', id);
  } catch (e) {}
  const current = getLocal('requests', []);
  const updated = current.filter(item => item.id !== id);
  setLocal('requests', updated);
  return true;
}

// ---------------------------------------------------------
// 10. REQUEST FORM SETTINGS API
// ---------------------------------------------------------
export async function getFormSettings() {
  const data = await fetchGeneric('website_form_settings', 'form_settings', [INITIAL_FORM_SETTINGS]);
  return Array.isArray(data) ? (data[0] || INITIAL_FORM_SETTINGS) : data;
}

export async function updateFormSettings(payload) {
  try {
    const { data, error } = await supabase.from('website_form_settings').upsert([payload]).select();
    if (!error && data && data[0]) {
      setLocal('form_settings', [data[0]]);
      return data[0];
    }
  } catch (e) {}
  setLocal('form_settings', [payload]);
  return payload;
}

// ---------------------------------------------------------
// 11. CONTACT & WHATSAPP SETTINGS API
// ---------------------------------------------------------
export async function getContactSettings() {
  const data = await fetchGeneric('website_contact_settings', 'contact_settings', [INITIAL_CONTACT_SETTINGS]);
  return Array.isArray(data) ? (data[0] || INITIAL_CONTACT_SETTINGS) : data;
}

export async function updateContactSettings(payload) {
  try {
    const { data, error } = await supabase.from('website_contact_settings').upsert([payload]).select();
    if (!error && data && data[0]) {
      setLocal('contact_settings', [data[0]]);
      return data[0];
    }
  } catch (e) {}
  setLocal('contact_settings', [payload]);
  return payload;
}

// ---------------------------------------------------------
// 12. FOOTER SETTINGS API
// ---------------------------------------------------------
export async function getFooterSettings() {
  const data = await fetchGeneric('website_footer', 'footer_settings', [INITIAL_FOOTER_SETTINGS]);
  return Array.isArray(data) ? (data[0] || INITIAL_FOOTER_SETTINGS) : data;
}

export async function updateFooterSettings(payload) {
  try {
    const { data, error } = await supabase.from('website_footer').upsert([payload]).select();
    if (!error && data && data[0]) {
      setLocal('footer_settings', [data[0]]);
      return data[0];
    }
  } catch (e) {}
  setLocal('footer_settings', [payload]);
  return payload;
}

// ---------------------------------------------------------
// 13. SEO SETTINGS API
// ---------------------------------------------------------
export async function getSeoSettings() {
  const data = await fetchGeneric('website_seo', 'seo_settings', [INITIAL_SEO_SETTINGS]);
  return Array.isArray(data) ? (data[0] || INITIAL_SEO_SETTINGS) : data;
}

export async function updateSeoSettings(payload) {
  try {
    const { data, error } = await supabase.from('website_seo').upsert([payload]).select();
    if (!error && data && data[0]) {
      setLocal('seo_settings', [data[0]]);
      return data[0];
    }
  } catch (e) {}
  setLocal('seo_settings', [payload]);
  return payload;
}
