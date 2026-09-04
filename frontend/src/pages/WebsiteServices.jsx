import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { ClayCard, ClayButton, ClayBadge, ClayInput } from '../components/clay';
import {
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  Building,
  Briefcase,
  Layers,
  Utensils,
  ShoppingBag,
  GraduationCap,
  Home as HomeIcon,
  Rocket,
  Code2,
  ShieldCheck,
  Zap,
  Smartphone,
  Palette,
  Search,
  Headphones,
  ExternalLink,
  Send,
  Calendar,
  DollarSign
} from 'lucide-react';
import '../styles/website_services.css';

export default function WebsiteServices() {
  const formRef = useRef(null);
  const portfolioRef = useRef(null);

  // Data states
  const [portfolio, setPortfolio] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form states
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    business_name: '',
    company_name: '',
    website_type: 'Business',
    project_description: '',
    preferred_contact_method: 'WhatsApp',
    budget: '₹5,000 – ₹10,000',
    deadline: '',
    current_website: '',
    reference_website: '',
    existing_domain: 'No',
    existing_logo: 'No',
    additional_requirements: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchServicesData();
  }, []);

  const fetchServicesData = async () => {
    setLoadingData(true);
    try {
      // Fetch Published Portfolio
      const { data: portData } = await supabase
        .from('website_portfolio')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true });

      if (portData) setPortfolio(portData);

      // Fetch Active Packages
      const { data: pkgData } = await supabase
        .from('website_packages')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (pkgData) setPackages(pkgData);
    } catch (err) {
      console.warn('Supabase fetch error, using fallbacks:', err.message);
    }
    setLoadingData(false);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPortfolio = () => {
    portfolioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!form.full_name.trim() || !form.phone.trim() || !form.email.trim() || !form.business_name.trim() || !form.project_description.trim()) {
      setFormError('Please fill in all required fields marked with *');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        business_name: form.business_name.trim(),
        company_name: form.company_name.trim() || null,
        website_type: form.website_type,
        project_description: form.project_description.trim(),
        preferred_contact_method: form.preferred_contact_method,
        budget: form.budget,
        deadline: form.deadline.trim() || null,
        current_website: form.current_website.trim() || null,
        reference_website: form.reference_website.trim() || null,
        existing_domain: form.existing_domain,
        existing_logo: form.existing_logo,
        additional_requirements: form.additional_requirements.trim() || null,
        status: 'NEW',
        priority: 'MEDIUM',
        quoted_price: 0
      };

      const { error: insertErr } = await supabase
        .from('website_requests')
        .insert([payload]);

      if (insertErr) {
        setFormError('Failed to submit request: ' + insertErr.message);
      } else {
        setSubmitted(true);
        setForm({
          full_name: '',
          phone: '',
          email: '',
          business_name: '',
          company_name: '',
          website_type: 'Business',
          project_description: '',
          preferred_contact_method: 'WhatsApp',
          budget: '₹5,000 – ₹10,000',
          deadline: '',
          current_website: '',
          reference_website: '',
          existing_domain: 'No',
          existing_logo: 'No',
          additional_requirements: ''
        });
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    }

    setSubmitting(false);
  };

  // Fallback Portfolio Items if DB empty
  const defaultPortfolio = [
    {
      id: 'p1',
      project_name: 'Apex Real Estate Hub',
      category: 'Real Estate',
      client_name: 'Apex Realty Group',
      description: 'Modern luxury real estate listing portal with interactive property search, virtual tours, and WhatsApp lead capture.',
      thumbnail_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80',
      live_url: 'https://example.com',
      technologies: ['React', 'Supabase', 'Tailwind', 'Vite']
    },
    {
      id: 'p2',
      project_name: 'Gourmet Bistro Dining',
      category: 'Restaurant',
      client_name: 'Bistro 24',
      description: 'Elegant restaurant web application featuring interactive digital menus, table reservation booking, and location integration.',
      thumbnail_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      live_url: 'https://example.com',
      technologies: ['React', '3D Clay', 'CSS3', 'Vercel']
    },
    {
      id: 'p3',
      project_name: 'Pulse Fitness Studio',
      category: 'Business',
      client_name: 'Pulse Gym & Fitness',
      description: 'High-converting landing page & membership portal with trainer profiles, class schedules, and automated lead capture.',
      thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
      live_url: 'https://example.com',
      technologies: ['React', 'Supabase', 'Responsive UI']
    }
  ];

  // Fallback Packages if DB empty
  const defaultPackages = [
    {
      id: 'pkg-1',
      name: 'STARTER',
      price: '₹1,999',
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
      featured: false
    },
    {
      id: 'pkg-2',
      name: 'PROFESSIONAL',
      price: '₹4,999',
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
      featured: true
    },
    {
      id: 'pkg-3',
      name: 'BUSINESS',
      price: '₹9,999+',
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
      featured: false
    }
  ];

  const displayPortfolio = portfolio.length > 0 ? portfolio : defaultPortfolio;
  const displayPackages = packages.length > 0 ? packages : defaultPackages;

  const servicesList = [
    { icon: <Building size={24} />, title: "Business Websites", desc: "Professional corporate websites that establish instant credibility and capture valuable client leads." },
    { icon: <Briefcase size={24} />, title: "Portfolio Websites", desc: "Showcase your creative work, resume, and personal brand with slick, modern portfolio layouts." },
    { icon: <Layers size={24} />, title: "Landing Pages", desc: "High-converting single-page landing pages optimized for marketing campaigns and product launches." },
    { icon: <Utensils size={24} />, title: "Restaurant Websites", desc: "Digital menus, table reservations, online order inquiries, and location maps for food brands." },
    { icon: <ShoppingBag size={24} />, title: "E-commerce Websites", desc: "Custom online storefronts with product catalogs, shopping carts, and payment processing." },
    { icon: <GraduationCap size={24} />, title: "Education Websites", desc: "Institutions, online academies, course catalogs, student portals, and inquiry management." },
    { icon: <HomeIcon size={24} />, title: "Real Estate Websites", desc: "Interactive property showcases, high-res galleries, filter search, and direct inquiry forms." },
    { icon: <Rocket size={24} />, title: "Startup Websites", desc: "SaaS landing pages, feature showcases, investor pitch sites, and newsletter waitlists." },
    { icon: <Code2 size={24} />, title: "Custom Web Applications", desc: "Tailored full-stack web applications with database, authentication, API integrations, and dashboards." }
  ];

  const whyUsList = [
    { icon: <Palette size={20} />, title: "Custom Design", desc: "No cookie-cutter templates. Unique 3D designs tailored to your brand identity." },
    { icon: <Smartphone size={20} />, title: "Mobile Responsive", desc: "Flawless rendering on iPhones, Android phones, tablets, laptops, and 4K displays." },
    { icon: <Zap size={20} />, title: "Fast Performance", desc: "Blazing fast load times with Vite, React, and optimized assets." },
    { icon: <Search size={20} />, title: "SEO Friendly", desc: "Clean semantic markup, meta tags, and structured data for search engines." },
    { icon: <ShieldCheck size={20} />, title: "Secure Development", desc: "SSL encryption, HTTPS setup, and safe database security policies." },
    { icon: <Rocket size={20} />, title: "Deployment Support", desc: "Free hosting setup on Vercel or Netlify with custom domain configuration." },
    { icon: <Headphones size={20} />, title: "Direct Support", desc: "Speak directly with your developer on WhatsApp or Phone anytime." },
    { icon: <CheckCircle2 size={20} />, title: "100% Satisfaction", desc: "We revise and refine until your website matches your exact vision." }
  ];

  return (
    <div className="page-container">
      <Navbar />

      <main className="website-services-wrapper">
        {/* 1. HERO SECTION */}
        <section className="web-hero-card clay-card">
          <div className="web-hero-left">
            <ClayBadge className="web-hero-badge">
              <Sparkles size={14} color="var(--accent-primary)" />
              <span>Full-Service Web Development</span>
            </ClayBadge>

            <h1>Need a Professional Website?</h1>

            <p>
              Tell us what you need. We'll design and build a professional website tailored to your business, portfolio, startup, or personal brand.
            </p>

            <div className="web-hero-ctas">
              <ClayButton variant="primary" className="web-hero-btn" onClick={scrollToForm}>
                <span>Request a Website</span>
                <ArrowRight size={16} />
              </ClayButton>

              <ClayButton className="web-hero-btn" onClick={scrollToPortfolio}>
                <span>View Our Work</span>
              </ClayButton>
            </div>
          </div>

          <div className="web-hero-right">
            <div className="hero-preview-box clay-card clay-raised">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Globe size={28} color="var(--accent-primary)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)' }}>Webspedia Digital Studio</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Custom Web Development</span>
                </div>
              </div>

              <div className="preview-pill-row">
                <ClayBadge style={{ background: 'var(--clay-surface-recessed)' }}>⚡ Fast Turnaround</ClayBadge>
                <ClayBadge style={{ background: 'var(--clay-surface-recessed)' }}>📱 Mobile First</ClayBadge>
                <ClayBadge style={{ background: 'var(--clay-surface-recessed)' }}>🎨 3D Clay UI</ClayBadge>
              </div>

              <div className="clay-inset" style={{ padding: '16px', borderRadius: '12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                "We take your project requirements, create bespoke designs, integrate live database features, and launch your website live in days!"
              </div>
            </div>
          </div>
        </section>

        {/* 2. SERVICES SECTION */}
        <section className="web-services-section">
          <div className="web-section-header">
            <h2>Our Web Development Services</h2>
            <p>Whether you need a sleek landing page or a complex web app with authentication and database controls, we have you covered.</p>
          </div>

          <div className="services-grid">
            {servicesList.map((srv, idx) => (
              <div key={idx} className="service-card clay-card clay-raised">
                <div className="service-icon-box">
                  {srv.icon}
                </div>
                <h3>{srv.title}</h3>
                <p>{srv.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. WHY CHOOSE US */}
        <section className="why-us-section">
          <div className="web-section-header">
            <h2>Why Build Your Website With Us?</h2>
            <p>We combine modern UI aesthetics, fast performance, and direct personal support to deliver websites that drive real results.</p>
          </div>

          <div className="why-grid">
            {whyUsList.map((item, idx) => (
              <div key={idx} className="why-card clay-card">
                <div className="why-icon">
                  {item.icon}
                </div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. PORTFOLIO SECTION */}
        <section className="web-portfolio-section" ref={portfolioRef}>
          <div className="web-section-header">
            <h2>Featured Portfolio Builds</h2>
            <p>Explore recent website development projects built for our clients across various industries.</p>
          </div>

          <div className="portfolio-grid">
            {displayPortfolio.map((item) => (
              <div key={item.id} className="portfolio-card clay-card clay-raised">
                <div>
                  <div className="portfolio-img-box">
                    <img src={item.thumbnail_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"} alt={item.project_name} />
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <ClayBadge style={{ marginBottom: '8px' }}>{item.category || 'Website'}</ClayBadge>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{item.project_name}</h3>
                    {item.client_name && <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Client: {item.client_name}</span>}
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>{item.description}</p>
                  </div>
                </div>

                <div>
                  {item.technologies && (
                    <div className="portfolio-tech-tags">
                      {(Array.isArray(item.technologies) ? item.technologies : String(item.technologies).split(',')).map((tech, i) => (
                        <span key={i} className="clay-pill" style={{ fontSize: '11px', padding: '4px 10px', background: 'var(--clay-surface-recessed)' }}>
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.live_url && (
                    <a
                      href={item.live_url.startsWith('http') ? item.live_url : `https://${item.live_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="clay-button-primary"
                      style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', textDecoration: 'none', padding: '10px', borderRadius: 'var(--radius-pill)', fontSize: '13px', fontWeight: '800' }}
                    >
                      <span>Visit Live Website</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. PRICING PACKAGES */}
        <section className="web-packages-section">
          <div className="web-section-header">
            <h2>Affordable Web Development Packages</h2>
            <p>Transparent pricing tailored to your scale. Need something custom? Submit a request for a quick quotation.</p>
          </div>

          <div className="packages-grid">
            {displayPackages.map((pkg) => (
              <div key={pkg.id} className={`package-card clay-card clay-raised ${pkg.featured ? 'featured-pkg' : ''}`}>
                <div>
                  {pkg.featured && (
                    <ClayBadge style={{ background: 'var(--accent-gradient)', color: '#ffffff', position: 'absolute', top: '16px', right: '16px' }}>
                      MOST POPULAR
                    </ClayBadge>
                  )}

                  <div className="pkg-header">
                    <h3>{pkg.name}</h3>
                    <div className="pkg-price">{pkg.price}</div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{pkg.description}</p>
                  </div>

                  <ul className="pkg-features">
                    {(Array.isArray(pkg.features) ? pkg.features : String(pkg.features).split('\n')).map((ft, i) => (
                      <li key={i}>
                        <CheckCircle2 size={16} className="check-icon" />
                        <span>{ft.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {pkg.delivery_time && (
                    <span style={{ display: 'block', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '14px' }}>
                      ⏱ Delivery: {pkg.delivery_time}
                    </span>
                  )}

                  <ClayButton
                    variant={pkg.featured ? 'primary' : 'secondary'}
                    onClick={scrollToForm}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Choose {pkg.name}</span>
                    <ArrowRight size={16} />
                  </ClayButton>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. WEBSITE REQUIREMENTS FORM */}
        <section className="web-form-section" ref={formRef} id="request-form">
          <ClayCard elevated className="form-card">
            <div className="web-section-header" style={{ marginBottom: '24px' }}>
              <ClayBadge style={{ marginBottom: '8px' }}>
                <Send size={14} color="var(--accent-primary)" />
                <span>Get Started Today</span>
              </ClayBadge>
              <h2>Request Your Custom Website</h2>
              <p>Fill out the form below with your project requirements. We will review your details and contact you with a personalized plan and quotation.</p>
            </div>

            {submitted ? (
              <div className="success-banner-clay">
                <CheckCircle2 size={48} color="var(--color-success)" />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Request Submitted Successfully!</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Thank you, <strong>{form.full_name}</strong>! Your website development request has been received. We will contact you via {form.preferred_contact_method} shortly.
                </p>
                <ClayButton size="sm" onClick={() => setSubmitted(false)} style={{ marginTop: '12px' }}>
                  Submit Another Request
                </ClayButton>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {formError && <div className="auth-error-badge">{formError}</div>}

                {/* REQUIRED FIELDSET */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <ClayInput
                      placeholder="e.g. Rahul Sharma"
                      value={form.full_name}
                      onChange={e => setForm({ ...form, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone / WhatsApp Number *</label>
                    <ClayInput
                      placeholder="e.g. +91 9876543210"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <ClayInput
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Business / Brand Name *</label>
                    <ClayInput
                      placeholder="e.g. Sharma Tech Solutions"
                      value={form.business_name}
                      onChange={e => setForm({ ...form, business_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Website Type *</label>
                    <select
                      className="clay-input"
                      value={form.website_type}
                      onChange={e => setForm({ ...form, website_type: e.target.value })}
                    >
                      <option value="Business">Business Website</option>
                      <option value="Portfolio">Portfolio Website</option>
                      <option value="Landing Page">Landing Page</option>
                      <option value="E-commerce">E-commerce Website</option>
                      <option value="Restaurant">Restaurant Website</option>
                      <option value="Education">Education Website</option>
                      <option value="Real Estate">Real Estate Website</option>
                      <option value="Blog">Blog Website</option>
                      <option value="Startup">Startup Website</option>
                      <option value="Custom Web Application">Custom Web Application</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Preferred Contact Method *</label>
                    <select
                      className="clay-input"
                      value={form.preferred_contact_method}
                      onChange={e => setForm({ ...form, preferred_contact_method: e.target.value })}
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone">Phone Call</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Project Description & Requirements *</label>
                  <textarea
                    className="clay-input"
                    rows="4"
                    placeholder="Describe your business, main goal for the website, desired features (e.g. contact form, gallery, blog, booking system)..."
                    value={form.project_description}
                    onChange={e => setForm({ ...form, project_description: e.target.value })}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* OPTIONAL FIELDSET */}
                <div style={{ paddingTop: '12px', borderTop: 'var(--clay-border-subtle)' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                    Optional Details (Helps Us Provide an Accurate Quote)
                  </h4>

                  <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                    <div className="form-group">
                      <label>Estimated Budget</label>
                      <select
                        className="clay-input"
                        value={form.budget}
                        onChange={e => setForm({ ...form, budget: e.target.value })}
                      >
                        <option value="Under ₹2,000">Under ₹2,000</option>
                        <option value="₹2,000 – ₹5,000">₹2,000 – ₹5,000</option>
                        <option value="₹5,000 – ₹10,000">₹5,000 – ₹10,000</option>
                        <option value="₹10,000 – ₹25,000">₹10,000 – ₹25,000</option>
                        <option value="₹25,000+">₹25,000+</option>
                        <option value="Not Sure">Not Sure</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Desired Deadline</label>
                      <ClayInput
                        placeholder="e.g. Within 1 week, Urgent, No rush"
                        value={form.deadline}
                        onChange={e => setForm({ ...form, deadline: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                    <div className="form-group">
                      <label>Current Website (If upgrading)</label>
                      <ClayInput
                        placeholder="https://myoldwebsite.com"
                        value={form.current_website}
                        onChange={e => setForm({ ...form, current_website: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Reference Website (Design inspiration)</label>
                      <ClayInput
                        placeholder="https://example.com"
                        value={form.reference_website}
                        onChange={e => setForm({ ...form, reference_website: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                    <div className="form-group">
                      <label>Do you already have a Domain Name?</label>
                      <select
                        className="clay-input"
                        value={form.existing_domain}
                        onChange={e => setForm({ ...form, existing_domain: e.target.value })}
                      >
                        <option value="Yes">Yes, I already bought a domain</option>
                        <option value="No">No, I need help purchasing one</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Do you have a Company Logo & Content?</label>
                      <select
                        className="clay-input"
                        value={form.existing_logo}
                        onChange={e => setForm({ ...form, existing_logo: e.target.value })}
                      >
                        <option value="Yes">Yes, I have logo and text ready</option>
                        <option value="No">No, I need logo/content creation</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Additional Notes / Special Requests</label>
                    <textarea
                      className="clay-input"
                      rows="2"
                      placeholder="Any specific features, integrations, or preferences..."
                      value={form.additional_requirements}
                      onChange={e => setForm({ ...form, additional_requirements: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                <ClayButton variant="primary" type="submit" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '14px' }}>
                  <span>{submitting ? 'Submitting Request...' : 'Submit Website Request'}</span>
                  <Send size={16} />
                </ClayButton>
              </form>
            )}
          </ClayCard>
        </section>
      </main>

      <Footer />
    </div>
  );
}
