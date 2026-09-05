import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ClayCard, ClayButton, ClayBadge, ClayInput } from '../clay';
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  X,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { sanitizeImageUrl, handleImageError, DEFAULT_PORTFOLIO_IMAGE } from '../../utils/placeholder';

export default function WebsitePortfolioManager() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Business');
  const [clientName, setClientName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [technologies, setTechnologies] = useState('React, Supabase, Tailwind');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_portfolio')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Fetch website_portfolio error:', error.message);
      }
      setPortfolio(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditId(null);
    setProjectName('');
    setDescription('');
    setCategory('Business');
    setClientName('');
    setThumbnailUrl('');
    setLiveUrl('');
    setTechnologies('React, Supabase, Tailwind');
    setFeatured(false);
    setPublished(true);
    setDisplayOrder(portfolio.length + 1);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditId(item.id);
    setProjectName(item.project_name || '');
    setDescription(item.description || '');
    setCategory(item.category || 'Business');
    setClientName(item.client_name || '');
    setThumbnailUrl(item.thumbnail_url || '');
    setLiveUrl(item.live_url || '');
    setTechnologies(Array.isArray(item.technologies) ? item.technologies.join(', ') : (item.technologies || ''));
    setFeatured(!!item.featured);
    setPublished(item.published !== false);
    setDisplayOrder(item.display_order || 0);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      alert("Please enter Project Name");
      return;
    }

    setSubmitting(true);

    const techArray = technologies.split(',').map(t => t.trim()).filter(Boolean);

    const cleanThumbnail = sanitizeImageUrl(thumbnailUrl.trim(), null);

    const payload = {
      project_name: projectName.trim(),
      description: description.trim(),
      category,
      client_name: clientName.trim() || null,
      thumbnail_url: cleanThumbnail,
      live_url: liveUrl.trim() || null,
      technologies: techArray,
      featured,
      published,
      display_order: Number(displayOrder) || 0,
      updated_at: new Date().toISOString()
    };

    try {
      if (editId) {
        const { error } = await supabase
          .from('website_portfolio')
          .update(payload)
          .eq('id', editId);

        if (error) {
          alert("Update failed: " + error.message);
        } else {
          alert("Portfolio project updated!");
          setShowModal(false);
          fetchPortfolio();
        }
      } else {
        const { error } = await supabase
          .from('website_portfolio')
          .insert([payload]);

        if (error) {
          alert("Add failed: " + error.message);
        } else {
          alert("Portfolio project added!");
          setShowModal(false);
          fetchPortfolio();
        }
      }
    } catch (err) {
      alert("Error: " + err.message);
    }

    setSubmitting(false);
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${name}" from portfolio?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('website_portfolio')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Delete failed: " + error.message);
      } else {
        setPortfolio(prev => prev.filter(p => p.id !== id));
        alert("Project deleted.");
      }
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  };

  const togglePublished = async (item) => {
    try {
      const newStatus = !item.published;
      const { error } = await supabase
        .from('website_portfolio')
        .update({ published: newStatus })
        .eq('id', item.id);

      if (error) {
        alert("Failed to toggle published status: " + error.message);
      } else {
        setPortfolio(prev => prev.map(p => p.id === item.id ? { ...p, published: newStatus } : p));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const filteredPortfolio = portfolio.filter(item =>
    item.project_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="website-portfolio-manager">
      <ClayCard elevated style={{ padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <FolderKanban size={24} color="var(--accent-primary)" />
              <h2 style={{ fontSize: "24px", fontWeight: "900", margin: 0 }}>Website Portfolio Showcase</h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
              Manage website development portfolio projects displayed on the public services page.
            </p>
          </div>

          <ClayButton variant="primary" onClick={openAddModal}>
            <Plus size={16} />
            <span>Add Portfolio Project</span>
          </ClayButton>
        </div>

        {/* SEARCH BAR */}
        <div style={{ position: "relative", marginTop: "20px", maxWidth: "480px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <ClayInput
            placeholder="Search portfolio by project name, client, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "40px", width: "100%" }}
          />
        </div>
      </ClayCard>

      {/* PORTFOLIO GRID */}
      {loading ? (
        <ClayCard style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading portfolio projects...</p>
        </ClayCard>
      ) : filteredPortfolio.length === 0 ? (
        <ClayCard style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          <p>No portfolio projects found. Click "Add Portfolio Project" to register one.</p>
        </ClayCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredPortfolio.map(item => (
            <ClayCard key={item.id} elevated style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}>
              <div>
                <div style={{ width: "100%", height: "160px", borderRadius: "12px", overflow: "hidden", background: "var(--clay-surface-recessed)", marginBottom: "14px", position: "relative" }}>
                  <img
                    src={sanitizeImageUrl(item.thumbnail_url, DEFAULT_PORTFOLIO_IMAGE)}
                    alt=""
                    onError={(e) => handleImageError(e, DEFAULT_PORTFOLIO_IMAGE)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />

                  <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px" }}>
                    {item.featured && (
                      <ClayBadge style={{ background: "var(--accent-gradient)", color: "#ffffff" }}>
                        <Sparkles size={11} /> Featured
                      </ClayBadge>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <ClayBadge style={{ background: "var(--clay-surface-raised)", color: "var(--accent-primary)", fontWeight: "700", marginBottom: "4px" }}>
                      {item.category || 'Website'}
                    </ClayBadge>
                    <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "var(--text-primary)" }}>{item.project_name}</h3>
                    {item.client_name && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Client: {item.client_name}</span>}
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <ClayButton size="sm" onClick={() => togglePublished(item)} title={item.published ? "Hide from public" : "Publish to website"}>
                      {item.published ? <Eye size={14} color="#10b981" /> : <EyeOff size={14} color="var(--text-muted)" />}
                    </ClayButton>
                    <ClayButton size="sm" onClick={() => openEditModal(item)} title="Edit Project">
                      <Pencil size={14} />
                    </ClayButton>
                    <ClayButton
                      size="sm"
                      onClick={() => handleDelete(item.id, item.project_name)}
                      title="Delete Project"
                      style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
                    >
                      <Trash2 size={14} />
                    </ClayButton>
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 10px 0", lineHeight: "1.5" }}>
                  {item.description}
                </p>
              </div>

              <div style={{ paddingTop: "12px", borderTop: "var(--clay-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {item.live_url ? (
                  <a
                    href={item.live_url.startsWith('http') ? item.live_url : `https://${item.live_url}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "var(--accent-primary)", textDecoration: "none" }}
                  >
                    <span>View Live Site</span>
                    <ExternalLink size={12} />
                  </a>
                ) : <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>No URL set</span>}

                <span style={{ fontSize: "11px", fontWeight: "700", color: item.published ? "#10b981" : "var(--text-muted)" }}>
                  {item.published ? '● Live' : '○ Hidden'}
                </span>
              </div>
            </ClayCard>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
          zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }} onClick={() => setShowModal(false)}>
          <div className="clay-card" style={{ width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", padding: "28px", background: "var(--clay-surface)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>
                {editId ? "Edit Portfolio Project" : "Add Portfolio Project"}
              </h3>
              <ClayButton size="sm" onClick={() => setShowModal(false)}>
                <X size={16} />
              </ClayButton>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Project Name *</label>
                  <ClayInput placeholder="e.g. Apex Real Estate Portal" value={projectName} onChange={e => setProjectName(e.target.value)} style={{ width: "100%" }} required />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Category</label>
                  <select className="clay-input" value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%" }}>
                    <option value="Business">Business</option>
                    <option value="Portfolio">Portfolio</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Education">Education</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Startup">Startup</option>
                    <option value="Custom">Custom App</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Client / Business Name</label>
                  <ClayInput placeholder="e.g. Apex Realty Group" value={clientName} onChange={e => setClientName(e.target.value)} style={{ width: "100%" }} />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Display Order</label>
                  <ClayInput type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Thumbnail Image URL</label>
                <ClayInput placeholder="https://example.com/screenshot.jpg" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} style={{ width: "100%" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Live Website URL</label>
                <ClayInput placeholder="https://liveproject.com" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} style={{ width: "100%" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Technologies (Comma separated)</label>
                <ClayInput placeholder="React, Supabase, Tailwind, Vite" value={technologies} onChange={e => setTechnologies(e.target.value)} style={{ width: "100%" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Project Description</label>
                <textarea
                  className="clay-input"
                  rows="3"
                  placeholder="Short description of the website features..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="checkbox" id="featuredCheck" checked={featured} onChange={e => setFeatured(e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                  <label htmlFor="featuredCheck" style={{ fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Featured Project</label>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="checkbox" id="publishedCheck" checked={published} onChange={e => setPublished(e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                  <label htmlFor="publishedCheck" style={{ fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Published (Visible on site)</label>
                </div>
              </div>

              <ClayButton variant="primary" type="submit" disabled={submitting} style={{ marginTop: "10px" }}>
                <span>{submitting ? 'Saving...' : (editId ? 'Update Project' : 'Add Project')}</span>
              </ClayButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
