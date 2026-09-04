import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ClayCard, ClayButton, ClayBadge, ClayInput } from '../clay';
import {
  FileCode,
  Search,
  Phone,
  MessageCircle,
  Mail,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  DollarSign,
  Calendar,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Clock,
  Filter
} from 'lucide-react';

export default function WebsiteRequestsManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected request modal states
  const [selectedReq, setSelectedReq] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit fields
  const [status, setStatus] = useState('NEW');
  const [priority, setPriority] = useState('MEDIUM');
  const [quotedPrice, setQuotedPrice] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Fetch website_requests error:', error.message);
      }
      setRequests(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openDetailsModal = (req) => {
    setSelectedReq(req);
    setStatus(req.status || 'NEW');
    setPriority(req.priority || 'MEDIUM');
    setQuotedPrice(req.quoted_price || 0);
    setAdminNotes(req.admin_notes || '');
    setFollowUpDate(req.follow_up_date || '');
    setAssignedTo(req.assigned_to || '');
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setSubmitting(true);

    const payload = {
      status,
      priority,
      quoted_price: Number(quotedPrice) || 0,
      admin_notes: adminNotes.trim(),
      follow_up_date: followUpDate || null,
      assigned_to: assignedTo.trim() || null,
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('website_requests')
        .update(payload)
        .eq('id', selectedReq.id);

      if (error) {
        alert("Failed to update request: " + error.message);
      } else {
        alert("Website request updated successfully!");
        setShowModal(false);
        fetchRequests();
      }
    } catch (err) {
      alert("Error: " + err.message);
    }

    setSubmitting(false);
  };

  const handleDelete = async (id, customerName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the website request from ${customerName}?`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('website_requests')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Delete failed: " + error.message);
      } else {
        setRequests(prev => prev.filter(r => r.id !== id));
        if (selectedReq?.id === id) setShowModal(false);
        alert("Request deleted.");
      }
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  };

  // Metrics calculations
  const totalCount = requests.length;
  const newCount = requests.filter(r => r.status === 'NEW').length;
  const contactedCount = requests.filter(r => r.status === 'CONTACTED').length;
  const discussionCount = requests.filter(r => r.status === 'DISCUSSION').length;
  const quotedCount = requests.filter(r => r.status === 'QUOTED').length;
  const inProgressCount = requests.filter(r => r.status === 'IN_PROGRESS').length;
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length;
  const cancelledCount = requests.filter(r => r.status === 'CANCELLED').length;
  const totalQuotedRevenue = requests.reduce((acc, r) => acc + (Number(r.quoted_price) || 0), 0);

  // Filtered requests
  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q ||
      req.full_name?.toLowerCase().includes(q) ||
      req.email?.toLowerCase().includes(q) ||
      req.phone?.toLowerCase().includes(q) ||
      req.business_name?.toLowerCase().includes(q) ||
      req.website_type?.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (st) => {
    switch (st) {
      case 'NEW': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' };
      case 'CONTACTED': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' };
      case 'DISCUSSION': return { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' };
      case 'QUOTED': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
      case 'PAYMENT_PENDING': return { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' };
      case 'IN_PROGRESS': return { bg: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6' };
      case 'COMPLETED': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
      case 'CANCELLED': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
      default: return { bg: 'var(--clay-surface-raised)', color: 'var(--text-secondary)' };
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'URGENT': return <ClayBadge style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>URGENT</ClayBadge>;
      case 'HIGH': return <ClayBadge style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>HIGH</ClayBadge>;
      case 'LOW': return <ClayBadge style={{ background: 'var(--clay-surface-recessed)', color: 'var(--text-muted)' }}>LOW</ClayBadge>;
      default: return <ClayBadge style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)' }}>MEDIUM</ClayBadge>;
    }
  };

  const formatCleanPhone = (phoneStr) => {
    if (!phoneStr) return '';
    return phoneStr.replace(/\D/g, '');
  };

  return (
    <div className="website-requests-manager">
      {/* HEADER & METRICS BAR */}
      <ClayCard elevated style={{ padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <FileCode size={24} color="var(--accent-primary)" />
              <h2 style={{ fontSize: "24px", fontWeight: "900", margin: 0 }}>Website Development Requests</h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
              Track incoming customer website build inquiries, update lead status, set quotations, and contact clients via Phone/WhatsApp.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ClayBadge style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "8px 14px", fontSize: "13px", fontWeight: "800" }}>
              Quoted Pipeline: ₹{totalQuotedRevenue.toLocaleString()}
            </ClayBadge>
          </div>
        </div>

        {/* METRICS SUMMARY GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
          <ClayCard recessed style={{ padding: "12px", textAlign: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", display: "block" }}>TOTAL</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "var(--text-primary)" }}>{totalCount}</span>
          </ClayCard>

          <ClayCard recessed style={{ padding: "12px", textAlign: "center", background: "rgba(59, 130, 246, 0.08)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#3b82f6", display: "block" }}>NEW</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#3b82f6" }}>{newCount}</span>
          </ClayCard>

          <ClayCard recessed style={{ padding: "12px", textAlign: "center", background: "rgba(168, 85, 247, 0.08)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#a855f7", display: "block" }}>CONTACTED</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#a855f7" }}>{contactedCount}</span>
          </ClayCard>

          <ClayCard recessed style={{ padding: "12px", textAlign: "center", background: "rgba(99, 102, 241, 0.08)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1", display: "block" }}>DISCUSSION</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#6366f1" }}>{discussionCount}</span>
          </ClayCard>

          <ClayCard recessed style={{ padding: "12px", textAlign: "center", background: "rgba(245, 158, 11, 0.08)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#f59e0b", display: "block" }}>QUOTED</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#f59e0b" }}>{quotedCount}</span>
          </ClayCard>

          <ClayCard recessed style={{ padding: "12px", textAlign: "center", background: "rgba(20, 184, 166, 0.08)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#14b8a6", display: "block" }}>IN PROGRESS</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#14b8a6" }}>{inProgressCount}</span>
          </ClayCard>

          <ClayCard recessed style={{ padding: "12px", textAlign: "center", background: "rgba(16, 185, 129, 0.08)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#10b981", display: "block" }}>COMPLETED</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#10b981" }}>{completedCount}</span>
          </ClayCard>

          <ClayCard recessed style={{ padding: "12px", textAlign: "center", background: "rgba(239, 68, 68, 0.08)" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#ef4444", display: "block" }}>CANCELLED</span>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#ef4444" }}>{cancelledCount}</span>
          </ClayCard>
        </div>
      </ClayCard>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <ClayInput
            placeholder="Search by customer name, email, phone, or business..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: "40px", width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: "13px", fontWeight: "700" }}>Status:</span>
          <select
            className="clay-input"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: "8px 12px", fontSize: "13px" }}
          >
            <option value="ALL">All Statuses ({totalCount})</option>
            <option value="NEW">NEW ({newCount})</option>
            <option value="CONTACTED">CONTACTED ({contactedCount})</option>
            <option value="DISCUSSION">DISCUSSION ({discussionCount})</option>
            <option value="QUOTED">QUOTED ({quotedCount})</option>
            <option value="IN_PROGRESS">IN PROGRESS ({inProgressCount})</option>
            <option value="COMPLETED">COMPLETED ({completedCount})</option>
            <option value="CANCELLED">CANCELLED ({cancelledCount})</option>
          </select>
        </div>
      </div>

      {/* REQUESTS TABLE */}
      {loading ? (
        <ClayCard style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading website requests...</p>
        </ClayCard>
      ) : filteredRequests.length === 0 ? (
        <ClayCard style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          <p>No website development requests found matching your filter.</p>
        </ClayCard>
      ) : (
        <div className="table-wrapper clay-card" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--clay-surface-raised)", borderBottom: "var(--clay-border-subtle)" }}>
                <th style={{ padding: "14px 16px", fontWeight: "800" }}>Customer / Business</th>
                <th style={{ padding: "14px 16px", fontWeight: "800" }}>Website Type</th>
                <th style={{ padding: "14px 16px", fontWeight: "800" }}>Budget</th>
                <th style={{ padding: "14px 16px", fontWeight: "800" }}>Status</th>
                <th style={{ padding: "14px 16px", fontWeight: "800" }}>Priority</th>
                <th style={{ padding: "14px 16px", fontWeight: "800" }}>Quoted Price</th>
                <th style={{ padding: "14px 16px", fontWeight: "800" }}>Date</th>
                <th style={{ padding: "14px 16px", fontWeight: "800", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => {
                const st = getStatusColor(req.status);
                const cleanPhone = formatCleanPhone(req.phone);

                return (
                  <tr key={req.id} style={{ borderBottom: "var(--clay-border-subtle)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: "800", color: "var(--text-primary)" }}>{req.full_name}</div>
                      <div style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: "700" }}>{req.business_name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{req.email} • {req.phone}</div>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <ClayBadge style={{ background: "var(--clay-surface-recessed)", fontWeight: "700" }}>
                        {req.website_type}
                      </ClayBadge>
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: "700", color: "var(--text-secondary)" }}>
                      {req.budget || 'Not specified'}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <ClayBadge style={{ background: st.bg, color: st.color, fontWeight: "800" }}>
                        {req.status}
                      </ClayBadge>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      {getPriorityBadge(req.priority)}
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: "800", color: req.quoted_price ? "var(--color-success)" : "var(--text-muted)" }}>
                      {req.quoted_price ? `₹${Number(req.quoted_price).toLocaleString()}` : 'Not set'}
                    </td>

                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "var(--text-muted)" }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>

                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                        {/* QUICK PHONE CALL */}
                        <a
                          href={`tel:${req.phone}`}
                          title="Call Customer"
                          style={{ padding: "6px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6", display: "inline-flex", textDecoration: "none" }}
                        >
                          <Phone size={14} />
                        </a>

                        {/* QUICK WHATSAPP */}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(`Hello ${req.full_name}, regarding your website request for ${req.business_name} on Webspedia...`)}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Chat on WhatsApp"
                            style={{ padding: "6px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", display: "inline-flex", textDecoration: "none" }}
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}

                        {/* QUICK EMAIL */}
                        <a
                          href={`mailto:${req.email}?subject=${encodeURIComponent(`Webspedia Website Request - ${req.business_name}`)}`}
                          title="Send Email"
                          style={{ padding: "6px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.12)", color: "#a855f7", display: "inline-flex", textDecoration: "none" }}
                        >
                          <Mail size={14} />
                        </a>

                        {/* EDIT / DETAILS */}
                        <ClayButton size="sm" onClick={() => openDetailsModal(req)} title="View / Edit Details">
                          <Pencil size={13} />
                        </ClayButton>

                        {/* DELETE */}
                        <ClayButton
                          size="sm"
                          onClick={() => handleDelete(req.id, req.full_name)}
                          title="Delete Request"
                          style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
                        >
                          <Trash2 size={13} />
                        </ClayButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* REQUEST DETAILS & EDIT MODAL */}
      {showModal && selectedReq && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
          zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }} onClick={() => setShowModal(false)}>
          <div className="clay-card" style={{ width: "100%", maxWidth: "680px", maxHeight: "90vh", overflowY: "auto", padding: "28px", background: "var(--clay-surface)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "12px", borderBottom: "var(--clay-border-subtle)" }}>
              <div>
                <ClayBadge style={{ marginBottom: "4px" }}>Request #{selectedReq.id.slice(0, 8)}</ClayBadge>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "var(--text-primary)" }}>
                  {selectedReq.full_name} — {selectedReq.business_name}
                </h3>
              </div>
              <ClayButton size="sm" onClick={() => setShowModal(false)}>
                <X size={16} />
              </ClayButton>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px", background: "var(--clay-surface-raised)", padding: "16px", borderRadius: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>CONTACT INFO</span>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>{selectedReq.full_name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>📞 {selectedReq.phone}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>✉️ {selectedReq.email}</div>
                <div style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: "700", marginTop: "4px" }}>
                  Preferred Contact: {selectedReq.preferred_contact_method}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>PROJECT SUMMARY</span>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-primary)", marginTop: "2px" }}>Type: {selectedReq.website_type}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Budget: {selectedReq.budget || 'Not specified'}</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Deadline: {selectedReq.deadline || 'Flexible'}</div>
                {selectedReq.company_name && <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Company: {selectedReq.company_name}</div>}
              </div>
            </div>

            {/* FULL DESCRIPTION & OPTIONS */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Project Requirements & Description:</label>
              <div className="clay-inset" style={{ padding: "14px", fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-wrap", borderRadius: "10px" }}>
                {selectedReq.project_description}
              </div>
            </div>

            {(selectedReq.current_website || selectedReq.reference_website || selectedReq.additional_requirements) && (
              <div style={{ marginBottom: "18px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {selectedReq.current_website && <div><strong>Current Site:</strong> <a href={selectedReq.current_website} target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)" }}>{selectedReq.current_website}</a></div>}
                {selectedReq.reference_website && <div><strong>Reference Site:</strong> <a href={selectedReq.reference_website} target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)" }}>{selectedReq.reference_website}</a></div>}
                {selectedReq.additional_requirements && <div><strong>Additional Notes:</strong> {selectedReq.additional_requirements}</div>}
              </div>
            )}

            {/* ADMIN UPDATE FORM */}
            <form onSubmit={handleUpdate} style={{ paddingTop: "14px", borderTop: "var(--clay-border-subtle)", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "var(--accent-primary)" }}>Admin Management & Status Tracking</h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Request Status</label>
                  <select className="clay-input" value={status} onChange={e => setStatus(e.target.value)} style={{ width: "100%" }}>
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="DISCUSSION">DISCUSSION</option>
                    <option value="QUOTED">QUOTED</option>
                    <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Priority</label>
                  <select className="clay-input" value={priority} onChange={e => setPriority(e.target.value)} style={{ width: "100%" }}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Quoted Price (₹)</label>
                  <ClayInput
                    type="number"
                    placeholder="e.g. 4999"
                    value={quotedPrice}
                    onChange={e => setQuotedPrice(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Follow-up Date</label>
                  <ClayInput
                    type="date"
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Assigned Person</label>
                <ClayInput
                  placeholder="e.g. Admin / Developer Name"
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Admin Internal Notes</label>
                <textarea
                  className="clay-input"
                  rows="3"
                  placeholder="Notes about discussion, requirements agreed, payment status..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <ClayButton
                  type="button"
                  onClick={() => handleDelete(selectedReq.id, selectedReq.full_name)}
                  style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.25)" }}
                >
                  <span>Delete Request</span>
                </ClayButton>

                <div style={{ display: "flex", gap: "10px" }}>
                  <ClayButton type="button" onClick={() => setShowModal(false)}>Cancel</ClayButton>
                  <ClayButton variant="primary" type="submit" disabled={submitting}>
                    <span>{submitting ? 'Saving...' : 'Save Updates'}</span>
                  </ClayButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
