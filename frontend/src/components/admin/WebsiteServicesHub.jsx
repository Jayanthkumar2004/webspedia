import { useEffect, useState } from 'react';
import { ClayCard, ClayButton, ClayBadge, ClayInput } from '../clay';
import {
  LayoutDashboard,
  FileCode,
  Sparkles,
  Wrench,
  Users,
  Award,
  FolderKanban,
  Package,
  RefreshCw,
  HelpCircle,
  Settings,
  PhoneCall,
  Globe,
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  MessageCircle,
  Mail,
  Phone,
  Save,
  Check
} from 'lucide-react';
import {
  getHeroSettings, updateHeroSettings,
  getServices, createService, updateService, deleteService,
  getTargetAudiences, createTargetAudience, updateTargetAudience, deleteTargetAudience,
  getWhyChooseUs, createWhyChooseUs, updateWhyChooseUs, deleteWhyChooseUs,
  getPortfolio, createPortfolioItem, updatePortfolioItem, deletePortfolioItem,
  getPackages, createPackage, updatePackage, deletePackage,
  getProcessSteps, createProcessStep, updateProcessStep, deleteProcessStep,
  getFaqs, createFaq, updateFaq, deleteFaq,
  getWebsiteRequests, updateWebsiteRequest, deleteWebsiteRequest,
  getFormSettings, updateFormSettings,
  getContactSettings, updateContactSettings,
  getFooterSettings, updateFooterSettings,
  getSeoSettings, updateSeoSettings
} from '../../lib/websiteServicesApi';

export default function WebsiteServicesHub() {
  const [subTab, setSubTab] = useState('Dashboard');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Module States
  const [hero, setHero] = useState({});
  const [services, setServices] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [packages, setPackages] = useState([]);
  const [processSteps, setProcessSteps] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [formSettings, setFormSettings] = useState({});
  const [contactSettings, setContactSettings] = useState({});
  const [footerSettings, setFooterSettings] = useState({});
  const [seoSettings, setSeoSettings] = useState({});

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'service', 'audience', 'benefit', 'portfolio', 'package', 'process', 'faq', 'request_detail'
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [
      h, s, a, b, p, pkg, pr, fq, req, fs, cs, ft, seo
    ] = await Promise.all([
      getHeroSettings(),
      getServices(),
      getTargetAudiences(),
      getWhyChooseUs(),
      getPortfolio(),
      getPackages(),
      getProcessSteps(),
      getFaqs(),
      getWebsiteRequests(),
      getFormSettings(),
      getContactSettings(),
      getFooterSettings(),
      getSeoSettings()
    ]);

    if (h) setHero(h);
    if (s) setServices(s);
    if (a) setAudiences(a);
    if (b) setBenefits(b);
    if (p) setPortfolio(p);
    if (pkg) setPackages(pkg);
    if (pr) setProcessSteps(pr);
    if (fq) setFaqs(fq);
    if (req) setRequests(req);
    if (fs) setFormSettings(fs);
    if (cs) setContactSettings(cs);
    if (ft) setFooterSettings(ft);
    if (seo) setSeoSettings(seo);
    setLoading(false);
  };

  const showNotification = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Helper Tabs Config
  const tabs = [
    { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'Website Requests', label: `Requests (${requests.length})`, icon: <FileCode size={16} /> },
    { id: 'Hero', label: 'Hero Section', icon: <Sparkles size={16} /> },
    { id: 'Services', label: 'Services', icon: <Wrench size={16} /> },
    { id: 'Target Audiences', label: 'Target Audiences', icon: <Users size={16} /> },
    { id: 'Why Choose Us', label: 'Why Choose Us', icon: <Award size={16} /> },
    { id: 'Portfolio', label: 'Portfolio', icon: <FolderKanban size={16} /> },
    { id: 'Pricing', label: 'Pricing', icon: <Package size={16} /> },
    { id: 'Process', label: 'Process Steps', icon: <RefreshCw size={16} /> },
    { id: 'FAQs', label: 'FAQs', icon: <HelpCircle size={16} /> },
    { id: 'Form Settings', label: 'Form Settings', icon: <Settings size={16} /> },
    { id: 'Contact Settings', label: 'Contact Settings', icon: <PhoneCall size={16} /> },
    { id: 'Footer', label: 'Footer Settings', icon: <Globe size={16} /> },
    { id: 'SEO', label: 'SEO Settings', icon: <Search size={16} /> }
  ];

  // ---------------------------------------------------------
  // SAVE HANDLERS FOR SINGLETON SETTINGS
  // ---------------------------------------------------------
  const handleSaveHero = async (e) => {
    e.preventDefault();
    await updateHeroSettings(hero);
    showNotification('Hero section updated successfully!');
  };

  const handleSaveFormSettings = async (e) => {
    e.preventDefault();
    await updateFormSettings(formSettings);
    showNotification('Form settings updated successfully!');
  };

  const handleSaveContactSettings = async (e) => {
    e.preventDefault();
    await updateContactSettings(contactSettings);
    showNotification('Contact settings updated successfully!');
  };

  const handleSaveFooterSettings = async (e) => {
    e.preventDefault();
    await updateFooterSettings(footerSettings);
    showNotification('Footer settings updated successfully!');
  };

  const handleSaveSeoSettings = async (e) => {
    e.preventDefault();
    await updateSeoSettings(seoSettings);
    showNotification('SEO settings updated successfully!');
  };

  // ---------------------------------------------------------
  // GENERIC ITEM CRUD HANDLERS
  // ---------------------------------------------------------
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setActiveItem(item || {});
    setModalOpen(true);
  };

  const handleSaveItemModal = async (e) => {
    e.preventDefault();
    if (!modalType) return;

    if (modalType === 'service') {
      if (activeItem.id) {
        await updateService(activeItem.id, activeItem);
      } else {
        await createService(activeItem);
      }
      setServices(await getServices());
    } else if (modalType === 'audience') {
      if (activeItem.id) {
        await updateTargetAudience(activeItem.id, activeItem);
      } else {
        await createTargetAudience(activeItem);
      }
      setAudiences(await getTargetAudiences());
    } else if (modalType === 'benefit') {
      if (activeItem.id) {
        await updateWhyChooseUs(activeItem.id, activeItem);
      } else {
        await createWhyChooseUs(activeItem);
      }
      setBenefits(await getWhyChooseUs());
    } else if (modalType === 'portfolio') {
      const techArray = typeof activeItem.technologies === 'string'
        ? activeItem.technologies.split(',').map(t => t.trim())
        : activeItem.technologies;

      const payload = { ...activeItem, technologies: techArray };

      if (activeItem.id) {
        await updatePortfolioItem(activeItem.id, payload);
      } else {
        await createPortfolioItem(payload);
      }
      setPortfolio(await getPortfolio());
    } else if (modalType === 'package') {
      const ftArray = typeof activeItem.features === 'string'
        ? activeItem.features.split('\n').map(t => t.trim()).filter(Boolean)
        : activeItem.features;

      const payload = { ...activeItem, features: ftArray };

      if (activeItem.id) {
        await updatePackage(activeItem.id, payload);
      } else {
        await createPackage(payload);
      }
      setPackages(await getPackages());
    } else if (modalType === 'process') {
      if (activeItem.id) {
        await updateProcessStep(activeItem.id, activeItem);
      } else {
        await createProcessStep(activeItem);
      }
      setProcessSteps(await getProcessSteps());
    } else if (modalType === 'faq') {
      if (activeItem.id) {
        await updateFaq(activeItem.id, activeItem);
      } else {
        await createFaq(activeItem);
      }
      setFaqs(await getFaqs());
    } else if (modalType === 'request_detail') {
      await updateWebsiteRequest(activeItem.id, activeItem);
      setRequests(await getWebsiteRequests());
    }

    setModalOpen(false);
    showNotification('Item saved successfully!');
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    if (type === 'service') {
      await deleteService(id);
      setServices(await getServices());
    } else if (type === 'audience') {
      await deleteTargetAudience(id);
      setAudiences(await getTargetAudiences());
    } else if (type === 'benefit') {
      await deleteWhyChooseUs(id);
      setBenefits(await getWhyChooseUs());
    } else if (type === 'portfolio') {
      await deletePortfolioItem(id);
      setPortfolio(await getPortfolio());
    } else if (type === 'package') {
      await deletePackage(id);
      setPackages(await getPackages());
    } else if (type === 'process') {
      await deleteProcessStep(id);
      setProcessSteps(await getProcessSteps());
    } else if (type === 'faq') {
      await deleteFaq(id);
      setFaqs(await getFaqs());
    } else if (type === 'request') {
      await deleteWebsiteRequest(id);
      setRequests(await getWebsiteRequests());
    }
    showNotification('Item deleted successfully!');
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch =
      !searchQuery ||
      (r.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.business_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.website_type || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="website-services-hub" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* HEADER & NOTIFICATION */}
      <div className="hub-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <ClayBadge style={{ marginBottom: '8px' }}>
            <Sparkles size={14} color="var(--accent-primary)" />
            <span>Website Services SaaS Control Center</span>
          </ClayBadge>
          <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: 'var(--text-primary)' }}>
            Website Services Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Full CRUD control over hero, catalog services, portfolio builds, pricing packages, FAQs, leads & settings.
          </p>
        </div>

        {statusMsg && (
          <div className="clay-badge" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '10px 16px', borderRadius: '12px', fontWeight: '700' }}>
            <Check size={16} />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* HORIZONTAL TABS BAR */}
      <div className="hub-tabs-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`clay-pill ${subTab === t.id ? 'active' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: subTab === t.id ? 'var(--accent-gradient)' : 'var(--clay-surface)',
              color: subTab === t.id ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'var(--shadow-clay-sm)'
            }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 1. DASHBOARD TAB */}
      {/* ========================================================= */}
      {subTab === 'Dashboard' && (
        <div className="hub-dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="stats-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <ClayCard elevated style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Total Requests</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '6px 0 0 0' }}>{requests.length}</h2>
            </ClayCard>

            <ClayCard elevated style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>New Leads</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '6px 0 0 0', color: 'var(--accent-primary)' }}>
                {requests.filter(r => r.status === 'NEW' || !r.status).length}
              </h2>
            </ClayCard>

            <ClayCard elevated style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Active Services</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '6px 0 0 0' }}>{services.length}</h2>
            </ClayCard>

            <ClayCard elevated style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Portfolio Builds</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '6px 0 0 0' }}>{portfolio.length}</h2>
            </ClayCard>

            <ClayCard elevated style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Pricing Packages</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '6px 0 0 0' }}>{packages.length}</h2>
            </ClayCard>
          </div>

          <ClayCard elevated style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Recent Website Requests</h3>
              <ClayButton size="sm" onClick={() => setSubTab('Website Requests')}>View All Leads</ClayButton>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.slice(0, 5).map(req => (
                <ClayCard recessed key={req.id} style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>{req.full_name} ({req.business_name})</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Type: {req.website_type} • Contact: {req.phone} ({req.preferred_contact_method})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ClayBadge>{req.status || 'NEW'}</ClayBadge>
                    <ClayButton size="sm" onClick={() => handleOpenModal('request_detail', req)}>Inspect</ClayButton>
                  </div>
                </ClayCard>
              ))}
            </div>
          </ClayCard>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. WEBSITE REQUESTS (LEADS MANAGEMENT) */}
      {/* ========================================================= */}
      {subTab === 'Website Requests' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Inbound Website Requests ({filteredRequests.length})</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Inspect client requirements, update status, add notes, and trigger contact actions.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <ClayInput
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '36px', width: '220px' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <select
                className="clay-input"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="DISCUSSION">DISCUSSION</option>
                <option value="QUOTED">QUOTED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="clay-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: 'var(--clay-border-subtle)', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Business</th>
                  <th style={{ padding: '12px' }}>Website Type</th>
                  <th style={{ padding: '12px' }}>Contact Details</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(r => (
                  <tr key={r.id} style={{ borderBottom: 'var(--clay-border-subtle)', fontSize: '13px' }}>
                    <td style={{ padding: '12px', fontWeight: '800' }}>{r.full_name}</td>
                    <td style={{ padding: '12px' }}>{r.business_name}</td>
                    <td style={{ padding: '12px' }}><ClayBadge>{r.website_type}</ClayBadge></td>
                    <td style={{ padding: '12px' }}>
                      <div>{r.phone}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.email}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        className="clay-input"
                        value={r.status || 'NEW'}
                        onChange={async (e) => {
                          await updateWebsiteRequest(r.id, { status: e.target.value });
                          setRequests(await getWebsiteRequests());
                        }}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="DISCUSSION">DISCUSSION</option>
                        <option value="QUOTED">QUOTED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <ClayButton size="sm" onClick={() => handleOpenModal('request_detail', r)}>
                          <Eye size={14} />
                        </ClayButton>
                        <ClayButton size="sm" variant="danger" onClick={() => handleDeleteItem('request', r.id)}>
                          <Trash2 size={14} />
                        </ClayButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 3. HERO SECTION CRUD */}
      {/* ========================================================= */}
      {subTab === 'Hero' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <form onSubmit={handleSaveHero} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Hero Section Configuration</h3>

            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>Badge Text</label>
                <ClayInput value={hero.badge_text || ''} onChange={e => setHero({ ...hero, badge_text: e.target.value })} />
              </div>
              <div>
                <label>Main Heading</label>
                <ClayInput value={hero.main_heading || ''} onChange={e => setHero({ ...hero, main_heading: e.target.value })} />
              </div>
            </div>

            <div>
              <label>Hero Description</label>
              <textarea className="clay-input" rows="3" value={hero.description || ''} onChange={e => setHero({ ...hero, description: e.target.value })} />
            </div>

            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>Primary Button Text</label>
                <ClayInput value={hero.primary_btn_text || ''} onChange={e => setHero({ ...hero, primary_btn_text: e.target.value })} />
              </div>
              <div>
                <label>Secondary Button Text</label>
                <ClayInput value={hero.secondary_btn_text || ''} onChange={e => setHero({ ...hero, secondary_btn_text: e.target.value })} />
              </div>
            </div>

            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>Hero Card Title</label>
                <ClayInput value={hero.card_title || ''} onChange={e => setHero({ ...hero, card_title: e.target.value })} />
              </div>
              <div>
                <label>Hero Card Subtitle</label>
                <ClayInput value={hero.card_subtitle || ''} onChange={e => setHero({ ...hero, card_subtitle: e.target.value })} />
              </div>
            </div>

            <div>
              <label>Hero Card Quote/Description</label>
              <textarea className="clay-input" rows="2" value={hero.card_description || ''} onChange={e => setHero({ ...hero, card_description: e.target.value })} />
            </div>

            <ClayButton variant="primary" type="submit" style={{ width: 'fit-content' }}>
              <Save size={16} />
              <span>Save Hero Settings</span>
            </ClayButton>
          </form>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 4. SERVICES CATALOG CRUD */}
      {/* ========================================================= */}
      {subTab === 'Services' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Website Services Catalog ({services.length})</h3>
            <ClayButton variant="primary" onClick={() => handleOpenModal('service')}>
              <Plus size={16} />
              <span>Add New Service</span>
            </ClayButton>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {services.map(s => (
              <ClayCard recessed key={s.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <ClayBadge>{s.category || 'Service'}</ClayBadge>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-primary)' }}>{s.starting_price}</span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800' }}>{s.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{s.description}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: 'var(--clay-border-subtle)' }}>
                  <ClayButton size="sm" onClick={() => handleOpenModal('service', s)}>
                    <Pencil size={14} />
                  </ClayButton>
                  <ClayButton size="sm" variant="danger" onClick={() => handleDeleteItem('service', s.id)}>
                    <Trash2 size={14} />
                  </ClayButton>
                </div>
              </ClayCard>
            ))}
          </div>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 5. TARGET AUDIENCES CRUD */}
      {/* ========================================================= */}
      {subTab === 'Target Audiences' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Target Audiences ({audiences.length})</h3>
            <ClayButton variant="primary" onClick={() => handleOpenModal('audience')}>
              <Plus size={16} />
              <span>Add Target Audience</span>
            </ClayButton>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {audiences.map(a => (
              <ClayCard recessed key={a.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800' }}>{a.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{a.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <ClayButton size="sm" onClick={() => handleOpenModal('audience', a)}><Pencil size={14} /></ClayButton>
                  <ClayButton size="sm" variant="danger" onClick={() => handleDeleteItem('audience', a.id)}><Trash2 size={14} /></ClayButton>
                </div>
              </ClayCard>
            ))}
          </div>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 6. WHY CHOOSE US CRUD */}
      {/* ========================================================= */}
      {subTab === 'Why Choose Us' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Why Choose Us Benefits ({benefits.length})</h3>
            <ClayButton variant="primary" onClick={() => handleOpenModal('benefit')}>
              <Plus size={16} />
              <span>Add Benefit</span>
            </ClayButton>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {benefits.map(b => (
              <ClayCard recessed key={b.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800' }}>{b.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{b.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <ClayButton size="sm" onClick={() => handleOpenModal('benefit', b)}><Pencil size={14} /></ClayButton>
                  <ClayButton size="sm" variant="danger" onClick={() => handleDeleteItem('benefit', b.id)}><Trash2 size={14} /></ClayButton>
                </div>
              </ClayCard>
            ))}
          </div>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 7. PORTFOLIO CRUD */}
      {/* ========================================================= */}
      {subTab === 'Portfolio' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Portfolio Builds ({portfolio.length})</h3>
            <ClayButton variant="primary" onClick={() => handleOpenModal('portfolio')}>
              <Plus size={16} />
              <span>Add Portfolio Build</span>
            </ClayButton>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {portfolio.map(p => (
              <ClayCard recessed key={p.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <ClayBadge>{p.category || 'Portfolio'}</ClayBadge>
                    {p.featured && <ClayBadge style={{ background: 'var(--accent-gradient)', color: '#fff' }}>FEATURED</ClayBadge>}
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800' }}>{p.project_name}</h4>
                  {p.client_name && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Client: {p.client_name}</span>}
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>{p.description}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <ClayButton size="sm" onClick={() => handleOpenModal('portfolio', p)}><Pencil size={14} /></ClayButton>
                  <ClayButton size="sm" variant="danger" onClick={() => handleDeleteItem('portfolio', p.id)}><Trash2 size={14} /></ClayButton>
                </div>
              </ClayCard>
            ))}
          </div>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 8. PRICING PACKAGES CRUD */}
      {/* ========================================================= */}
      {subTab === 'Pricing' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Pricing Packages ({packages.length})</h3>
            <ClayButton variant="primary" onClick={() => handleOpenModal('package')}>
              <Plus size={16} />
              <span>Add Package</span>
            </ClayButton>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {packages.map(pkg => (
              <ClayCard recessed key={pkg.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{pkg.name}</h4>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-primary)' }}>{pkg.price}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{pkg.description}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <ClayButton size="sm" onClick={() => handleOpenModal('package', pkg)}><Pencil size={14} /></ClayButton>
                  <ClayButton size="sm" variant="danger" onClick={() => handleDeleteItem('package', pkg.id)}><Trash2 size={14} /></ClayButton>
                </div>
              </ClayCard>
            ))}
          </div>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 9. PROCESS STEPS CRUD */}
      {/* ========================================================= */}
      {subTab === 'Process' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Process Steps ({processSteps.length})</h3>
            <ClayButton variant="primary" onClick={() => handleOpenModal('process')}>
              <Plus size={16} />
              <span>Add Process Step</span>
            </ClayButton>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {processSteps.map(pr => (
              <ClayCard recessed key={pr.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <ClayBadge style={{ marginBottom: '6px' }}>Step {pr.step_number}</ClayBadge>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800' }}>{pr.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{pr.description}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <ClayButton size="sm" onClick={() => handleOpenModal('process', pr)}><Pencil size={14} /></ClayButton>
                  <ClayButton size="sm" variant="danger" onClick={() => handleDeleteItem('process', pr.id)}><Trash2 size={14} /></ClayButton>
                </div>
              </ClayCard>
            ))}
          </div>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 10. FAQS CRUD */}
      {/* ========================================================= */}
      {subTab === 'FAQs' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Frequently Asked Questions ({faqs.length})</h3>
            <ClayButton variant="primary" onClick={() => handleOpenModal('faq')}>
              <Plus size={16} />
              <span>Add FAQ</span>
            </ClayButton>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map(fq => (
              <ClayCard recessed key={fq.id} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ maxWidth: '80%' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800' }}>Q: {fq.question}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>A: {fq.answer}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <ClayButton size="sm" onClick={() => handleOpenModal('faq', fq)}><Pencil size={14} /></ClayButton>
                  <ClayButton size="sm" variant="danger" onClick={() => handleDeleteItem('faq', fq.id)}><Trash2 size={14} /></ClayButton>
                </div>
              </ClayCard>
            ))}
          </div>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 11. FORM SETTINGS */}
      {/* ========================================================= */}
      {subTab === 'Form Settings' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <form onSubmit={handleSaveFormSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Website Request Form Settings</h3>
            <div>
              <label>Form Section Heading</label>
              <ClayInput value={formSettings.heading || ''} onChange={e => setFormSettings({ ...formSettings, heading: e.target.value })} />
            </div>
            <div>
              <label>Form Description</label>
              <textarea className="clay-input" rows="3" value={formSettings.description || ''} onChange={e => setFormSettings({ ...formSettings, description: e.target.value })} />
            </div>
            <div>
              <label>Success Confirmation Message</label>
              <textarea className="clay-input" rows="2" value={formSettings.success_message || ''} onChange={e => setFormSettings({ ...formSettings, success_message: e.target.value })} />
            </div>
            <div>
              <label>Submit Button Label</label>
              <ClayInput value={formSettings.submit_btn_text || ''} onChange={e => setFormSettings({ ...formSettings, submit_btn_text: e.target.value })} />
            </div>

            <ClayButton variant="primary" type="submit" style={{ width: 'fit-content' }}>
              <Save size={16} />
              <span>Save Form Settings</span>
            </ClayButton>
          </form>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 12. CONTACT & WHATSAPP SETTINGS */}
      {/* ========================================================= */}
      {subTab === 'Contact Settings' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <form onSubmit={handleSaveContactSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Contact & WhatsApp Settings</h3>
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>WhatsApp Number</label>
                <ClayInput value={contactSettings.whatsapp_number || ''} onChange={e => setContactSettings({ ...contactSettings, whatsapp_number: e.target.value })} />
              </div>
              <div>
                <label>Phone Number</label>
                <ClayInput value={contactSettings.phone_number || ''} onChange={e => setContactSettings({ ...contactSettings, phone_number: e.target.value })} />
              </div>
            </div>

            <div>
              <label>Contact Email</label>
              <ClayInput value={contactSettings.email || ''} onChange={e => setContactSettings({ ...contactSettings, email: e.target.value })} />
            </div>

            <div>
              <label>WhatsApp Default Message Template</label>
              <textarea className="clay-input" rows="2" value={contactSettings.whatsapp_template || ''} onChange={e => setContactSettings({ ...contactSettings, whatsapp_template: e.target.value })} />
            </div>

            <ClayButton variant="primary" type="submit" style={{ width: 'fit-content' }}>
              <Save size={16} />
              <span>Save Contact Settings</span>
            </ClayButton>
          </form>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 13. FOOTER SETTINGS */}
      {/* ========================================================= */}
      {subTab === 'Footer' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <form onSubmit={handleSaveFooterSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Footer Settings</h3>
            <div>
              <label>Footer Description</label>
              <textarea className="clay-input" rows="2" value={footerSettings.description || ''} onChange={e => setFooterSettings({ ...footerSettings, description: e.target.value })} />
            </div>
            <div>
              <label>Copyright Text</label>
              <ClayInput value={footerSettings.copyright_text || ''} onChange={e => setFooterSettings({ ...footerSettings, copyright_text: e.target.value })} />
            </div>

            <ClayButton variant="primary" type="submit" style={{ width: 'fit-content' }}>
              <Save size={16} />
              <span>Save Footer Settings</span>
            </ClayButton>
          </form>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* 14. SEO SETTINGS */}
      {/* ========================================================= */}
      {subTab === 'SEO' && (
        <ClayCard elevated style={{ padding: '24px' }}>
          <form onSubmit={handleSaveSeoSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>SEO Page Metadata Settings</h3>
            <div>
              <label>Page Title</label>
              <ClayInput value={seoSettings.page_title || ''} onChange={e => setSeoSettings({ ...seoSettings, page_title: e.target.value })} />
            </div>
            <div>
              <label>Meta Description</label>
              <textarea className="clay-input" rows="3" value={seoSettings.meta_description || ''} onChange={e => setSeoSettings({ ...seoSettings, meta_description: e.target.value })} />
            </div>
            <div>
              <label>Meta Keywords</label>
              <ClayInput value={seoSettings.keywords || ''} onChange={e => setSeoSettings({ ...seoSettings, keywords: e.target.value })} />
            </div>

            <ClayButton variant="primary" type="submit" style={{ width: 'fit-content' }}>
              <Save size={16} />
              <span>Save SEO Settings</span>
            </ClayButton>
          </form>
        </ClayCard>
      )}

      {/* ========================================================= */}
      {/* MODAL FOR ADD / EDIT ITEM */}
      {/* ========================================================= */}
      {modalOpen && (
        <div className="modal-backdrop-clay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <ClayCard elevated style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>
                {activeItem.id ? 'Edit Item' : 'Add New Item'} ({modalType})
              </h3>
              <button className="clay-pill" onClick={() => setModalOpen(false)} style={{ border: 'none', padding: '6px 12px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveItemModal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* SERVICE FIELDS */}
              {modalType === 'service' && (
                <>
                  <div><label>Service Title *</label><ClayInput required value={activeItem.title || ''} onChange={e => setActiveItem({ ...activeItem, title: e.target.value })} /></div>
                  <div><label>Category</label><ClayInput value={activeItem.category || ''} onChange={e => setActiveItem({ ...activeItem, category: e.target.value })} /></div>
                  <div><label>Starting Price</label><ClayInput value={activeItem.starting_price || ''} onChange={e => setActiveItem({ ...activeItem, starting_price: e.target.value })} /></div>
                  <div><label>Description</label><textarea className="clay-input" rows="3" value={activeItem.description || ''} onChange={e => setActiveItem({ ...activeItem, description: e.target.value })} /></div>
                </>
              )}

              {/* AUDIENCE FIELDS */}
              {modalType === 'audience' && (
                <>
                  <div><label>Audience Title *</label><ClayInput required value={activeItem.title || ''} onChange={e => setActiveItem({ ...activeItem, title: e.target.value })} /></div>
                  <div><label>Description</label><textarea className="clay-input" rows="3" value={activeItem.description || ''} onChange={e => setActiveItem({ ...activeItem, description: e.target.value })} /></div>
                  <div><label>CTA Button Label</label><ClayInput value={activeItem.cta || ''} onChange={e => setActiveItem({ ...activeItem, cta: e.target.value })} /></div>
                </>
              )}

              {/* BENEFIT FIELDS */}
              {modalType === 'benefit' && (
                <>
                  <div><label>Benefit Title *</label><ClayInput required value={activeItem.title || ''} onChange={e => setActiveItem({ ...activeItem, title: e.target.value })} /></div>
                  <div><label>Description</label><textarea className="clay-input" rows="3" value={activeItem.description || ''} onChange={e => setActiveItem({ ...activeItem, description: e.target.value })} /></div>
                </>
              )}

              {/* PORTFOLIO FIELDS */}
              {modalType === 'portfolio' && (
                <>
                  <div><label>Project Name *</label><ClayInput required value={activeItem.project_name || ''} onChange={e => setActiveItem({ ...activeItem, project_name: e.target.value })} /></div>
                  <div><label>Client Name</label><ClayInput value={activeItem.client_name || ''} onChange={e => setActiveItem({ ...activeItem, client_name: e.target.value })} /></div>
                  <div><label>Category</label><ClayInput value={activeItem.category || ''} onChange={e => setActiveItem({ ...activeItem, category: e.target.value })} /></div>
                  <div><label>Live Website URL</label><ClayInput value={activeItem.live_url || ''} onChange={e => setActiveItem({ ...activeItem, live_url: e.target.value })} /></div>
                  <div><label>Technologies (Comma separated)</label><ClayInput value={Array.isArray(activeItem.technologies) ? activeItem.technologies.join(', ') : (activeItem.technologies || '')} onChange={e => setActiveItem({ ...activeItem, technologies: e.target.value })} /></div>
                  <div><label>Description</label><textarea className="clay-input" rows="3" value={activeItem.description || ''} onChange={e => setActiveItem({ ...activeItem, description: e.target.value })} /></div>
                </>
              )}

              {/* PACKAGE FIELDS */}
              {modalType === 'package' && (
                <>
                  <div><label>Package Name *</label><ClayInput required value={activeItem.name || ''} onChange={e => setActiveItem({ ...activeItem, name: e.target.value })} /></div>
                  <div><label>Price *</label><ClayInput required value={activeItem.price || ''} onChange={e => setActiveItem({ ...activeItem, price: e.target.value })} /></div>
                  <div><label>Delivery Time</label><ClayInput value={activeItem.delivery_time || ''} onChange={e => setActiveItem({ ...activeItem, delivery_time: e.target.value })} /></div>
                  <div><label>Description</label><textarea className="clay-input" rows="2" value={activeItem.description || ''} onChange={e => setActiveItem({ ...activeItem, description: e.target.value })} /></div>
                  <div><label>Features (1 per line)</label><textarea className="clay-input" rows="5" value={Array.isArray(activeItem.features) ? activeItem.features.join('\n') : (activeItem.features || '')} onChange={e => setActiveItem({ ...activeItem, features: e.target.value })} /></div>
                </>
              )}

              {/* PROCESS FIELDS */}
              {modalType === 'process' && (
                <>
                  <div><label>Step Number *</label><ClayInput required value={activeItem.step_number || ''} onChange={e => setActiveItem({ ...activeItem, step_number: e.target.value })} /></div>
                  <div><label>Title *</label><ClayInput required value={activeItem.title || ''} onChange={e => setActiveItem({ ...activeItem, title: e.target.value })} /></div>
                  <div><label>Description</label><textarea className="clay-input" rows="3" value={activeItem.description || ''} onChange={e => setActiveItem({ ...activeItem, description: e.target.value })} /></div>
                </>
              )}

              {/* FAQ FIELDS */}
              {modalType === 'faq' && (
                <>
                  <div><label>Question *</label><ClayInput required value={activeItem.question || ''} onChange={e => setActiveItem({ ...activeItem, question: e.target.value })} /></div>
                  <div><label>Answer *</label><textarea required className="clay-input" rows="4" value={activeItem.answer || ''} onChange={e => setActiveItem({ ...activeItem, answer: e.target.value })} /></div>
                  <div><label>Category</label><ClayInput value={activeItem.category || ''} onChange={e => setActiveItem({ ...activeItem, category: e.target.value })} /></div>
                </>
              )}

              {/* REQUEST DETAIL MODAL */}
              {modalType === 'request_detail' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '14px', background: 'var(--clay-surface-recessed)', borderRadius: '12px' }}>
                    <h4 style={{ margin: 0 }}>{activeItem.full_name} ({activeItem.business_name})</h4>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-muted)' }}>Email: {activeItem.email} | Phone: {activeItem.phone}</p>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-muted)' }}>Preferred Contact: <strong>{activeItem.preferred_contact_method}</strong> | Budget: {activeItem.budget}</p>
                  </div>

                  {/* QUICK CONTACT ACTION BUTTONS */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a href={`https://wa.me/${(activeItem.phone || '').replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="clay-pill" style={{ textDecoration: 'none', background: '#25D366', color: '#fff', padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                    <a href={`tel:${activeItem.phone}`} className="clay-pill" style={{ textDecoration: 'none', background: '#3B82F6', color: '#fff', padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} /> Call Phone
                    </a>
                    <a href={`mailto:${activeItem.email}`} className="clay-pill" style={{ textDecoration: 'none', background: '#8B5CF6', color: '#fff', padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} /> Send Email
                    </a>
                  </div>

                  <div>
                    <label>Project Description</label>
                    <div style={{ padding: '12px', background: 'var(--clay-surface-recessed)', borderRadius: '8px', fontSize: '13px' }}>
                      {activeItem.project_description}
                    </div>
                  </div>

                  <div>
                    <label>Lead Status</label>
                    <select className="clay-input" value={activeItem.status || 'NEW'} onChange={e => setActiveItem({ ...activeItem, status: e.target.value })}>
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="DISCUSSION">DISCUSSION</option>
                      <option value="QUOTED">QUOTED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label>Internal Admin Notes</label>
                    <textarea className="clay-input" rows="3" placeholder="Add private notes about this client inquiry..." value={activeItem.admin_notes || ''} onChange={e => setActiveItem({ ...activeItem, admin_notes: e.target.value })} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <ClayButton type="button" onClick={() => setModalOpen(false)}>Cancel</ClayButton>
                <ClayButton variant="primary" type="submit">Save Changes</ClayButton>
              </div>
            </form>
          </ClayCard>
        </div>
      )}
    </div>
  );
}
