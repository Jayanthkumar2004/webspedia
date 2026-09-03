import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ClayCard, ClayButton, ClayBadge, ClayInput } from '../clay';
import {
  MessageSquareHeart,
  Star,
  Search,
  CheckCircle2,
  Archive,
  Trash2,
  Plus,
  X,
  Mail,
  User,
  Calendar,
  Filter
} from 'lucide-react';

export default function FeedbackManager() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form for manual feedback addition
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('General');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Fetch feedback error:", error.message);
      }
      setFeedbacks(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        alert("Status update error: " + error.message);
        return;
      }

      setFeedbacks(prev =>
        prev.map(item => item.id === id ? { ...item, status: newStatus } : item)
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this feedback entry?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Delete error: " + error.message);
        return;
      }

      setFeedbacks(prev => prev.filter(item => item.id !== id));
      alert("Feedback deleted successfully.");
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please enter feedback message");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('feedback').insert([
        {
          username: name.trim() || 'Anonymous',
          user_email: email.trim() || 'N/A',
          rating: rating,
          category: category,
          message: message.trim(),
          status: 'pending'
        }
      ]);

      if (error) {
        alert("Create feedback error: " + error.message);
      } else {
        alert("Feedback entry added.");
        setShowAddModal(false);
        setName('');
        setEmail('');
        setMessage('');
        fetchFeedbacks();
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
    setSubmitting(false);
  };

  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesSearch =
      item.message?.toLowerCase().includes(search.toLowerCase()) ||
      item.username?.toLowerCase().includes(search.toLowerCase()) ||
      item.user_email?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="feedback-manager-wrapper">
      <ClayCard elevated style={{ padding: "28px", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <MessageSquareHeart size={24} color="var(--accent-primary)" />
              <h2 style={{ fontSize: "24px", fontWeight: "900", margin: 0 }}>User Feedback Management</h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
              Review, filter, update status, or purge user feedback submissions across the platform.
            </p>
          </div>

          <ClayButton variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Add Manual Feedback</span>
          </ClayButton>
        </div>

        {/* CONTROLS ROW */}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <ClayInput
              placeholder="Search feedback, email, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "40px", width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="clay-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: "10px 14px", cursor: "pointer" }}
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Feature Request">Feature Request</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Other">Other</option>
            </select>

            <select
              className="clay-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "10px 14px", cursor: "pointer" }}
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </ClayCard>

      {/* FEEDBACK LIST GRID */}
      {loading ? (
        <ClayCard style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading feedback submissions...</p>
        </ClayCard>
      ) : filteredFeedbacks.length === 0 ? (
        <ClayCard style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          <p>No feedback entries match your filters.</p>
        </ClayCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredFeedbacks.map(item => (
            <ClayCard key={item.id} elevated style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={16}
                        fill={item.rating >= star ? "#facc15" : "none"}
                        color={item.rating >= star ? "#facc15" : "var(--text-muted)"}
                      />
                    ))}
                  </div>

                  <ClayBadge style={{ background: "var(--clay-surface-raised)", color: "var(--accent-primary)", fontWeight: "700" }}>
                    {item.category || "General"}
                  </ClayBadge>

                  <ClayBadge style={{
                    background: item.status === 'reviewed' ? 'rgba(16, 185, 129, 0.15)' : (item.status === 'archived' ? 'rgba(100, 116, 139, 0.15)' : 'rgba(234, 179, 8, 0.15)'),
                    color: item.status === 'reviewed' ? '#10b981' : (item.status === 'archived' ? '#64748b' : '#eab308'),
                    fontWeight: "800",
                    textTransform: "uppercase",
                    fontSize: "11px"
                  }}>
                    {item.status || "Pending"}
                  </ClayBadge>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {item.status !== 'reviewed' && (
                    <ClayButton size="sm" onClick={() => handleStatusUpdate(item.id, 'reviewed')} title="Mark as Reviewed">
                      <CheckCircle2 size={14} color="#10b981" />
                      <span>Review</span>
                    </ClayButton>
                  )}

                  {item.status !== 'archived' && (
                    <ClayButton size="sm" onClick={() => handleStatusUpdate(item.id, 'archived')} title="Archive Feedback">
                      <Archive size={14} color="#64748b" />
                      <span>Archive</span>
                    </ClayButton>
                  )}

                  <ClayButton
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    title="Delete Feedback"
                    style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
                  >
                    <Trash2 size={14} />
                  </ClayButton>
                </div>
              </div>

              {/* MESSAGE CONTENT */}
              <div style={{ padding: "14px", borderRadius: "var(--radius-md)", background: "var(--clay-surface-recessed)", marginBottom: "12px" }}>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "var(--text-primary)", fontWeight: "500", whiteSpace: "pre-wrap" }}>
                  "{item.message}"
                </p>
              </div>

              {/* USER METADATA */}
              <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <User size={13} /> {item.username || "Anonymous"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Mail size={13} /> {item.user_email || "N/A"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={13} /> {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </ClayCard>
          ))}
        </div>
      )}

      {/* MANUAL FEEDBACK CREATION MODAL */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
          zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }} onClick={() => setShowAddModal(false)}>
          <div className="clay-card" style={{ width: "100%", maxWidth: "480px", padding: "28px", background: "var(--clay-surface)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>Log Manual Feedback</h3>
              <ClayButton size="sm" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </ClayButton>
            </div>

            <form onSubmit={handleAddFeedback} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Rating Stars (1 - 5)</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                    >
                      <Star size={24} fill={rating >= star ? "#facc15" : "none"} color={rating >= star ? "#facc15" : "var(--text-muted)"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Category</label>
                <select className="clay-input" value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%" }}>
                  <option value="General">General</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>User Name</label>
                <ClayInput placeholder="User name" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Email</label>
                <ClayInput placeholder="User email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Feedback Message</label>
                <textarea
                  className="clay-input"
                  rows="4"
                  placeholder="Enter feedback details..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={{ width: "100%", resize: "vertical" }}
                  required
                />
              </div>

              <ClayButton variant="primary" type="submit" disabled={submitting} style={{ marginTop: "10px" }}>
                <span>{submitting ? 'Saving...' : 'Save Feedback Entry'}</span>
              </ClayButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
