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
  DollarSign,
  UserCheck,
  ChevronDown,
  ChevronUp,
  MessageCircle
} from 'lucide-react';
import { sanitizeImageUrl, handleImageError, DEFAULT_PORTFOLIO_IMAGE } from '../utils/placeholder';
import {
  getHeroSettings,
  getServices,
  getTargetAudiences,
  getWhyChooseUs,
  getPortfolio,
  getPackages,
  getProcessSteps,
  getFaqs,
  getFormSettings,
  getContactSettings,
  getFooterSettings,
  getSeoSettings
} from '../lib/websiteServicesApi';
import '../styles/website_services.css';

// Dynamic Icon Resolver Helper
const renderDynamicIcon = (iconName, size = 20) => {
  const map = {
    Building: <Building size={size} />,
    Briefcase: <Briefcase size={size} />,
    Layers: <Layers size={size} />,
    Utensils: <Utensils size={size} />,
    ShoppingBag: <ShoppingBag size={size} />,
    GraduationCap: <GraduationCap size={size} />,
    Home: <HomeIcon size={size} />,
    Rocket: <Rocket size={size} />,
    Code2: <Code2 size={size} />,
    Palette: <Palette size={size} />,
    Smartphone: <Smartphone size={size} />,
    Zap: <Zap size={size} />,
    Search: <Search size={size} />,
    ShieldCheck: <ShieldCheck size={size} />,
    Headphones: <Headphones size={size} />,
    CheckCircle2: <CheckCircle2 size={size} />,
    Sparkles: <Sparkles size={size} />,
    Globe: <Globe size={size} />,
    UserCheck: <UserCheck size={size} />,
    DollarSign: <DollarSign size={size} />,
    MessageSquare: <MessageSquare size={size} />
  };
  return map[iconName] || <Globe size={size} />;
};

export default function WebsiteServices() {
  const formRef = useRef(null);
  const portfolioRef = useRef(null);

  // Dynamic Content States
  const [hero, setHero] = useState({});
  const [servicesList, setServicesList] = useState([]);
  const [audiencesList, setAudiencesList] = useState([]);
  const [whyUsList, setWhyUsList] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [packages, setPackages] = useState([]);
  const [processSteps, setProcessSteps] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [formSettings, setFormSettings] = useState({});
  const [contactSettings, setContactSettings] = useState({});
  const [seoSettings, setSeoSettings] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  // FAQ open/close toggle state
  const [openFaqId, setOpenFaqId] = useState(null);

  // Form states
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    business_name: '',
    company_name: '',
    website_type: 'Business Website',
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
    fetchAllServicesData();
  }, []);

  const fetchAllServicesData = async () => {
    setLoadingData(true);
    try {
      const [
        h, s, a, b, p, pkg, pr, fq, fs, cs, seo
      ] = await Promise.all([
        getHeroSettings(),
        getServices(),
        getTargetAudiences(),
        getWhyChooseUs(),
        getPortfolio(),
        getPackages(),
        getProcessSteps(),
        getFaqs(),
        getFormSettings(),
        getContactSettings(),
        getSeoSettings()
      ]);

      if (h) setHero(h);
      if (s) setServicesList(s.filter(item => item.is_active !== false));
      if (a) setAudiencesList(a.filter(item => item.is_active !== false));
      if (b) setWhyUsList(b.filter(item => item.is_active !== false));
      if (p) setPortfolio(p.filter(item => item.published !== false));
      if (pkg) setPackages(pkg.filter(item => item.active !== false));
      if (pr) setProcessSteps(pr.filter(item => item.is_active !== false));
      if (fq) setFaqs(fq.filter(item => item.is_active !== false));
      if (fs) setFormSettings(fs);
      if (cs) setContactSettings(cs);
      if (seo) {
        setSeoSettings(seo);
        if (seo.page_title) document.title = seo.page_title;
      }
    } catch (err) {
      console.warn('Error fetching website services data:', err);
    }
    setLoadingData(false);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPortfolio = () => {
    portfolioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
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
        console.warn('Supabase insert warning:', insertErr.message);
      }

      setSubmitted(true);
      setForm({
        full_name: '',
        phone: '',
        email: '',
        business_name: '',
        company_name: '',
        website_type: 'Business Website',
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
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    }

    setSubmitting(false);
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="website-services-wrapper">
        {/* ========================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================= */}
        <section className="web-hero-card clay-card">
          <div className="web-hero-left">
            <ClayBadge className="web-hero-badge">
              <Sparkles size={14} color="var(--accent-primary)" />
              <span>{hero.badge_text || 'Full-Service Web Development'}</span>
            </ClayBadge>

            <h1>{hero.main_heading || 'Need a Professional Website?'}</h1>

            <p>
              {hero.description || "Tell us what you need. We'll design and build a professional website tailored to your business, portfolio, startup, or personal brand."}
            </p>

            <div className="web-hero-ctas">
              <ClayButton variant="primary" className="web-hero-btn" onClick={scrollToForm}>
                <span>{hero.primary_btn_text || 'Request a Website'}</span>
                <ArrowRight size={16} />
              </ClayButton>

              <ClayButton className="web-hero-btn" onClick={scrollToPortfolio}>
                <span>{hero.secondary_btn_text || 'View Our Work'}</span>
              </ClayButton>
            </div>
          </div>

          <div className="web-hero-right">
            <div className="hero-preview-box clay-card clay-raised">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Globe size={28} color="var(--accent-primary)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)' }}>
                    {hero.card_title || 'Webspedia Digital Studio'}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {hero.card_subtitle || 'Custom Web Development'}
                  </span>
                </div>
              </div>

              <div className="preview-pill-row">
                {(Array.isArray(hero.card_features) ? hero.card_features : ['⚡ Fast Turnaround', '📱 Mobile First', '🎨 3D Clay UI']).map((ft, idx) => (
                  <ClayBadge key={idx} style={{ background: 'var(--clay-surface-recessed)' }}>{ft}</ClayBadge>
                ))}
              </div>

              <div className="clay-inset" style={{ padding: '16px', borderRadius: '12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {hero.card_description || '"We take your project requirements, create bespoke designs, integrate live database features, and launch your website live in days!"'}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. SERVICES SECTION */}
        {/* ========================================================= */}
        <section className="web-services-section">
          <div className="web-section-header">
            <h2>Our Web Development Services</h2>
            <p>Whether you need a sleek landing page or a complex web app with authentication and database controls, we have you covered.</p>
          </div>

          <div className="services-grid">
            {servicesList.map((srv, idx) => (
              <div key={srv.id || idx} className="service-card clay-card clay-raised">
                <div className="service-icon-box">
                  {renderDynamicIcon(srv.icon || 'Globe', 24)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 6px 0' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{srv.title}</h3>
                  {srv.starting_price && (
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-primary)', background: 'var(--clay-surface-recessed)', padding: '2px 8px', borderRadius: '8px' }}>
                      From {srv.starting_price}
                    </span>
                  )}
                </div>
                <p>{srv.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. TARGET AUDIENCES SECTION */}
        {/* ========================================================= */}
        {audiencesList.length > 0 && (
          <section className="web-audiences-section" style={{ marginTop: '48px' }}>
            <div className="web-section-header">
              <h2>Tailored Solutions for Every Business</h2>
              <p>We build websites customized specifically to your industry and business goals.</p>
            </div>

            <div className="services-grid">
              {audiencesList.map((aud) => (
                <div key={aud.id} className="service-card clay-card">
                  <div className="service-icon-box" style={{ background: 'var(--accent-gradient)', color: '#fff' }}>
                    {renderDynamicIcon(aud.icon || 'UserCheck', 22)}
                  </div>
                  <h3 style={{ marginTop: '12px', fontSize: '17px', fontWeight: '800' }}>{aud.title}</h3>
                  <p>{aud.description}</p>
                  <ClayButton size="sm" onClick={scrollToForm} style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}>
                    <span>{aud.cta || 'Build Website'}</span>
                    <ArrowRight size={14} />
                  </ClayButton>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* 4. WHY CHOOSE US (BENEFITS) */}
        {/* ========================================================= */}
        <section className="why-us-section">
          <div className="web-section-header">
            <h2>Why Build Your Website With Us?</h2>
            <p>We combine modern UI aesthetics, fast performance, and direct personal support to deliver websites that drive real results.</p>
          </div>

          <div className="why-grid">
            {whyUsList.map((item, idx) => (
              <div key={item.id || idx} className="why-card clay-card">
                <div className="why-icon">
                  {renderDynamicIcon(item.icon || 'Zap', 20)}
                </div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. PORTFOLIO SECTION */}
        {/* ========================================================= */}
        <section className="web-portfolio-section" ref={portfolioRef}>
          <div className="web-section-header">
            <h2>Featured Portfolio Builds</h2>
            <p>Explore recent website development projects built for our clients across various industries.</p>
          </div>

          <div className="portfolio-grid">
            {portfolio.map((item) => (
              <div key={item.id} className="portfolio-card clay-card clay-raised">
                <div>
                  <div className="portfolio-img-box">
                    <img
                      src={sanitizeImageUrl(item.thumbnail_url, DEFAULT_PORTFOLIO_IMAGE)}
                      alt={item.project_name}
                      onError={(e) => handleImageError(e, DEFAULT_PORTFOLIO_IMAGE)}
                    />
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <ClayBadge>{item.category || 'Website'}</ClayBadge>
                      {item.featured && <ClayBadge style={{ background: 'var(--accent-gradient)', color: '#fff' }}>FEATURED BUILD</ClayBadge>}
                    </div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{item.project_name}</h3>
                    {item.client_name && <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Client: {item.client_name}</span>}
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>{item.description}</p>
                  </div>
                </div>

                <div>
                  {item.technologies && (
                    <div className="portfolio-tech-tags" style={{ marginTop: '14px' }}>
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

        {/* ========================================================= */}
        {/* 6. PRICING PACKAGES SECTION */}
        {/* ========================================================= */}
        <section className="web-packages-section">
          <div className="web-section-header">
            <h2>Affordable Web Development Packages</h2>
            <p>Transparent pricing tailored to your scale. Need something custom? Submit a request for a quick quotation.</p>
          </div>

          <div className="packages-grid">
            {packages.map((pkg) => (
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
                    {(Array.isArray(pkg.features) ? pkg.features : String(pkg.features || '').split('\n')).map((ft, i) => (
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
                    <span>{pkg.cta_text || `Choose ${pkg.name}`}</span>
                    <ArrowRight size={16} />
                  </ClayButton>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 7. HOW IT WORKS / PROCESS STEPS */}
        {/* ========================================================= */}
        {processSteps.length > 0 && (
          <section className="web-process-section" style={{ marginTop: '48px' }}>
            <div className="web-section-header">
              <h2>How It Works - Simple 5-Step Process</h2>
              <p>From initial concept to final live deployment, we handle every step seamlessly.</p>
            </div>

            <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {processSteps.map((pr) => (
                <div key={pr.id} className="service-card clay-card" style={{ position: 'relative' }}>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--accent-primary)', marginBottom: '8px' }}>
                    {pr.step_number}
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 6px 0' }}>{pr.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{pr.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* 8. FAQS SECTION */}
        {/* ========================================================= */}
        {faqs.length > 0 && (
          <section className="web-faqs-section" style={{ marginTop: '48px' }}>
            <div className="web-section-header">
              <h2>Frequently Asked Questions</h2>
              <p>Got questions about website building, domain, hosting, or support? Find quick answers below.</p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {faqs.map((fq) => (
                <div
                  key={fq.id}
                  className="clay-card"
                  onClick={() => toggleFaq(fq.id)}
                  style={{ padding: '18px 24px', cursor: 'pointer', transition: 'var(--transition-clay)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {fq.question}
                    </h4>
                    {openFaqId === fq.id ? <ChevronUp size={18} color="var(--accent-primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                  {openFaqId === fq.id && (
                    <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', paddingTop: '10px', borderTop: 'var(--clay-border-subtle)' }}>
                      {fq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* 9. WEBSITE REQUIREMENTS FORM & WHATSAPP CTA */}
        {/* ========================================================= */}
        <section className="web-form-section" ref={formRef} id="request-form" style={{ marginTop: '48px' }}>
          <ClayCard elevated className="form-card">
            <div className="web-section-header" style={{ marginBottom: '24px' }}>
              <ClayBadge style={{ marginBottom: '8px' }}>
                <Send size={14} color="var(--accent-primary)" />
                <span>Get Started Today</span>
              </ClayBadge>
              <h2>{formSettings.heading || 'Request Your Custom Website'}</h2>
              <p>{formSettings.description || 'Fill out the form below with your project requirements. We will review your details and contact you with a personalized plan and quotation.'}</p>
            </div>

            {/* DIRECT WHATSAPP ACTION CARD */}
            {contactSettings.whatsapp_number && (
              <div className="clay-card" style={{ padding: '16px 20px', background: 'var(--clay-surface-recessed)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Need an Immediate Response?</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Chat directly with our lead developer on WhatsApp now.</p>
                </div>
                <a
                  href={`https://wa.me/${contactSettings.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(contactSettings.whatsapp_template || 'Hello Webspedia!')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="clay-button-primary"
                  style={{ textDecoration: 'none', background: '#25D366', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: 'var(--radius-pill)', fontWeight: '800', fontSize: '13px' }}
                >
                  <MessageCircle size={16} />
                  <span>{contactSettings.cta_text || 'Chat on WhatsApp'}</span>
                </a>
              </div>
            )}

            {submitted ? (
              <div className="success-banner-clay">
                <CheckCircle2 size={48} color="var(--color-success)" />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Request Submitted Successfully!</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {formSettings.success_message || 'Thank you! Your website request has been received.'}
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
                      {servicesList.map(s => (
                        <option key={s.id} value={s.title}>{s.title}</option>
                      ))}
                      <option value="Other">Other Custom Build</option>
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
                  <span>{submitting ? 'Submitting Request...' : (formSettings.submit_btn_text || 'Submit Website Request')}</span>
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
