import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ClayCard, ClayButton, ClayBadge, ClayInput } from '../clay';
import {
  Globe,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  X,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

export default function WebsitesManager() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Partner');
  const [isFeatured, setIsFeatured] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promoted_websites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Fetch promoted websites error:', error.message);
      }
      setWebsites(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setUrl('');
    setImageUrl('');
    setCategory('Partner');
    setIsFeatured(true);
    setShowModal(true);
  };

  const openEditModal = (site) => {
    setEditId(site.id);
    setTitle(site.title || '');
    setDescription(site.description || '');
    setUrl(site.url || '');
    setImageUrl(site.image_url || '');
    setCategory(site.category || 'Partner');
    setIsFeatured(site.is_featured !== false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert("Please enter website Title and URL");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      image_url: imageUrl.trim(),
      category: category.trim(),
      is_featured: isFeatured
    };

    try {
      if (editId) {
        // UPDATE
        const { error } = await supabase
          .from('promoted_websites')
          .update(payload)
          .eq('id', editId);

        if (error) {
          alert("Update failed: " + error.message);
        } else {
          alert("Promoted website updated successfully!");
          setShowModal(false);
          fetchWebsites();
        }
      } else {
        // CREATE / INSERT
        const { error } = await supabase
          .from('promoted_websites')
          .insert([payload]);

        if (error) {
          alert("Add website failed: " + error.message);
        } else {
          alert("Promoted website added successfully!");
          setShowModal(false);
          fetchWebsites();
        }
      }
    } catch (err) {
      alert("Error: " + err.message);
    }

    setSubmitting(false);
  };

  const handleDelete = async (id, siteTitle) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${siteTitle}" from promoted websites?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('promoted_websites')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Delete failed: " + error.message);
      } else {
        setWebsites(prev => prev.filter(w => w.id !== id));
        alert("Website deleted successfully.");
      }
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  };

  const filteredWebsites = websites.filter(site =>
    site.title?.toLowerCase().includes(search.toLowerCase()) ||
    site.description?.toLowerCase().includes(search.toLowerCase()) ||
    site.category?.toLowerCase().includes(search.toLowerCase()) ||
    site.url?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="websites-manager-wrapper">
      <ClayCard elevated style={{ padding: "28px", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <Globe size={24} color="var(--accent-primary)" />
              <h2 style={{ fontSize: "24px", fontWeight: "900", margin: 0 }}>Our Websites Management</h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
              Create, inspect, update, or remove website links displayed in the Our Websites section on the Home page.
            </p>
          </div>

          <ClayButton variant="primary" onClick={openAddModal}>
            <Plus size={16} />
            <span>Add New Website</span>
          </ClayButton>
        </div>

        {/* SEARCH BAR */}
        <div style={{ position: "relative", marginTop: "20px", maxWidth: "480px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <ClayInput
            placeholder="Search websites by name, category, or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "40px", width: "100%" }}
          />
        </div>
      </ClayCard>

      {/* WEBSITES GRID */}
      {loading ? (
        <ClayCard style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading promoted websites...</p>
        </ClayCard>
      ) : filteredWebsites.length === 0 ? (
        <ClayCard style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          <p>No promoted websites found. Click "Add New Website" to register one.</p>
        </ClayCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredWebsites.map(site => (
            <ClayCard key={site.id} elevated style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--clay-surface-recessed)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {site.image_url ? (
                      <img src={site.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Globe size={22} color="var(--accent-primary)" />
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <ClayButton size="sm" onClick={() => openEditModal(site)} title="Edit Website">
                      <Pencil size={14} />
                    </ClayButton>
                    <ClayButton
                      size="sm"
                      onClick={() => handleDelete(site.id, site.title)}
                      title="Delete Website"
                      style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
                    >
                      <Trash2 size={14} />
                    </ClayButton>
                  </div>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <ClayBadge style={{ background: "var(--clay-surface-raised)", color: "var(--accent-primary)", fontWeight: "700", marginBottom: "6px" }}>
                    {site.category || 'Partner'}
                  </ClayBadge>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "800", color: "var(--text-primary)" }}>{site.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.5" }}>{site.description}</p>
                </div>
              </div>

              <div style={{ paddingTop: "12px", borderTop: "var(--clay-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <a
                  href={site.url?.startsWith('http') ? site.url : `https://${site.url}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700", color: "var(--accent-primary)", textDecoration: "none" }}
                >
                  <span>{site.url}</span>
                  <ExternalLink size={13} />
                </a>

                {site.is_featured && (
                  <ClayBadge style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "11px", fontWeight: "800" }}>
                    <Sparkles size={11} /> Featured
                  </ClayBadge>
                )}
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
          <div className="clay-card" style={{ width: "100%", maxWidth: "500px", padding: "28px", background: "var(--clay-surface)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>
                {editId ? "Edit Promoted Website" : "Add Promoted Website"}
              </h3>
              <ClayButton size="sm" onClick={() => setShowModal(false)}>
                <X size={16} />
              </ClayButton>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Website Title *</label>
                <ClayInput placeholder="e.g. Vercel Hosting" value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%" }} required />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Website URL *</label>
                <ClayInput placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} style={{ width: "100%" }} required />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Image / Icon URL</label>
                <ClayInput placeholder="https://example.com/logo.png" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ width: "100%" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Category</label>
                <ClayInput placeholder="e.g. SaaS, Partner, Cloud" value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Description</label>
                <textarea
                  className="clay-input"
                  rows="3"
                  placeholder="Short description of the website..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="featuredToggle" style={{ fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Mark as Featured</label>
              </div>

              <ClayButton variant="primary" type="submit" disabled={submitting} style={{ marginTop: "10px" }}>
                <span>{submitting ? 'Saving...' : (editId ? 'Update Website' : 'Add Website')}</span>
              </ClayButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
