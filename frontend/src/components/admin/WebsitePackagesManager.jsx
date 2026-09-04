import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ClayCard, ClayButton, ClayBadge, ClayInput } from '../clay';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export default function WebsitePackagesManager() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('₹1,999');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('2–3 Days');
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_packages')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Fetch website_packages error:', error.message);
      }
      setPackages(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setPrice('₹1,999');
    setDescription('');
    setFeatures("1–3 Custom Responsive Pages\nMobile & Tablet Optimized\nContact Form\nBasic SEO Setup");
    setDeliveryTime('2–3 Days');
    setFeatured(false);
    setActive(true);
    setDisplayOrder(packages.length + 1);
    setShowModal(true);
  };

  const openEditModal = (pkg) => {
    setEditId(pkg.id);
    setName(pkg.name || '');
    setPrice(pkg.price || '');
    setDescription(pkg.description || '');
    setFeatures(Array.isArray(pkg.features) ? pkg.features.join('\n') : (pkg.features || ''));
    setDeliveryTime(pkg.delivery_time || '');
    setFeatured(!!pkg.featured);
    setActive(pkg.active !== false);
    setDisplayOrder(pkg.display_order || 0);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      alert("Please enter Package Name and Price");
      return;
    }

    setSubmitting(true);

    const featuresArray = features.split('\n').map(f => f.trim()).filter(Boolean);

    const payload = {
      name: name.trim().toUpperCase(),
      price: price.trim(),
      description: description.trim(),
      features: featuresArray,
      delivery_time: deliveryTime.trim() || null,
      featured,
      active,
      display_order: Number(displayOrder) || 0,
      updated_at: new Date().toISOString()
    };

    try {
      if (editId) {
        const { error } = await supabase
          .from('website_packages')
          .update(payload)
          .eq('id', editId);

        if (error) {
          alert("Update failed: " + error.message);
        } else {
          alert("Package updated!");
          setShowModal(false);
          fetchPackages();
        }
      } else {
        const { error } = await supabase
          .from('website_packages')
          .insert([payload]);

        if (error) {
          alert("Add failed: " + error.message);
        } else {
          alert("Package added!");
          setShowModal(false);
          fetchPackages();
        }
      }
    } catch (err) {
      alert("Error: " + err.message);
    }

    setSubmitting(false);
  };

  const handleDelete = async (id, pkgName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete package "${pkgName}"?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('website_packages')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Delete failed: " + error.message);
      } else {
        setPackages(prev => prev.filter(p => p.id !== id));
        alert("Package deleted.");
      }
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  };

  const toggleActive = async (pkg) => {
    try {
      const newActive = !pkg.active;
      const { error } = await supabase
        .from('website_packages')
        .update({ active: newActive })
        .eq('id', pkg.id);

      if (error) {
        alert("Failed to toggle status: " + error.message);
      } else {
        setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, active: newActive } : p));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="website-packages-manager">
      <ClayCard elevated style={{ padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <Package size={24} color="var(--accent-primary)" />
              <h2 style={{ fontSize: "24px", fontWeight: "900", margin: 0 }}>Website Pricing Packages</h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
              Configure packages, prices, features lists, and delivery times displayed on the public services page.
            </p>
          </div>

          <ClayButton variant="primary" onClick={openAddModal}>
            <Plus size={16} />
            <span>Add Package</span>
          </ClayButton>
        </div>
      </ClayCard>

      {/* PACKAGES GRID */}
      {loading ? (
        <ClayCard style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading pricing packages...</p>
        </ClayCard>
      ) : packages.length === 0 ? (
        <ClayCard style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          <p>No pricing packages found. Click "Add Package" to configure one.</p>
        </ClayCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {packages.map(pkg => (
            <ClayCard key={pkg.id} elevated style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px", border: pkg.featured ? "2px solid var(--accent-primary)" : "var(--clay-border)" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    {pkg.featured && (
                      <ClayBadge style={{ background: "var(--accent-gradient)", color: "#ffffff", marginBottom: "6px" }}>
                        <Sparkles size={11} /> Featured
                      </ClayBadge>
                    )}
                    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "var(--text-primary)" }}>{pkg.name}</h3>
                    <div style={{ fontSize: "26px", fontWeight: "900", color: "var(--accent-primary)", marginTop: "4px" }}>{pkg.price}</div>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <ClayButton size="sm" onClick={() => toggleActive(pkg)} title={pkg.active ? "Deactivate" : "Activate"}>
                      {pkg.active ? <Eye size={14} color="#10b981" /> : <EyeOff size={14} color="var(--text-muted)" />}
                    </ClayButton>
                    <ClayButton size="sm" onClick={() => openEditModal(pkg)} title="Edit Package">
                      <Pencil size={14} />
                    </ClayButton>
                    <ClayButton
                      size="sm"
                      onClick={() => handleDelete(pkg.id, pkg.name)}
                      title="Delete Package"
                      style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
                    >
                      <Trash2 size={14} />
                    </ClayButton>
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 14px 0", lineHeight: "1.5" }}>
                  {pkg.description}
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(Array.isArray(pkg.features) ? pkg.features : String(pkg.features || '').split('\n')).map((ft, i) => (
                    <li key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>{ft.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ paddingTop: "12px", borderTop: "var(--clay-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>
                  ⏱ Delivery: {pkg.delivery_time || 'N/A'}
                </span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: pkg.active ? "#10b981" : "var(--text-muted)" }}>
                  {pkg.active ? '● Active' : '○ Inactive'}
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
          <div className="clay-card" style={{ width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "28px", background: "var(--clay-surface)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>
                {editId ? "Edit Pricing Package" : "Add Pricing Package"}
              </h3>
              <ClayButton size="sm" onClick={() => setShowModal(false)}>
                <X size={16} />
              </ClayButton>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Package Name *</label>
                  <ClayInput placeholder="e.g. STARTER" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%" }} required />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Price *</label>
                  <ClayInput placeholder="e.g. ₹1,999" value={price} onChange={e => setPrice(e.target.value)} style={{ width: "100%" }} required />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Delivery Time</label>
                  <ClayInput placeholder="e.g. 2–3 Days" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} style={{ width: "100%" }} />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Display Order</label>
                  <ClayInput type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Description</label>
                <textarea
                  className="clay-input"
                  rows="2"
                  placeholder="Short description of who this package is for..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Features (One feature per line)</label>
                <textarea
                  className="clay-input"
                  rows="5"
                  placeholder="1–3 Custom Responsive Pages&#10;Mobile & Tablet Optimized&#10;Contact Form&#10;Basic SEO"
                  value={features}
                  onChange={e => setFeatures(e.target.value)}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="checkbox" id="featuredPkgCheck" checked={featured} onChange={e => setFeatured(e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                  <label htmlFor="featuredPkgCheck" style={{ fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Featured / Popular Badge</label>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="checkbox" id="activePkgCheck" checked={active} onChange={e => setActive(e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                  <label htmlFor="activePkgCheck" style={{ fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Active (Visible on site)</label>
                </div>
              </div>

              <ClayButton variant="primary" type="submit" disabled={submitting} style={{ marginTop: "10px" }}>
                <span>{submitting ? 'Saving...' : (editId ? 'Update Package' : 'Add Package')}</span>
              </ClayButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
