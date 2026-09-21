import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Wrench, Edit3, Trash2, FileText, X, Check, Upload, ExternalLink, Search, Eye, Share2, Copy, MessageCircle, Sparkles } from 'lucide-react';
import { DEFAULT_TOOL_ICON, handleImageError } from '../../utils/placeholder';
import { ClayInput } from '../clay';
import '../../styles/ToolsTable.css';

export default function ToolsTable() {
  const [tools, setTools] = useState([]);
  const [editingTool, setEditingTool] = useState(null);
  const [sharingTool, setSharingTool] = useState(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setTools(data || []);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const deleteTool = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this tool?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('tools').delete().eq('id', id);
    if (error) {
      console.error(error);
      return;
    }
    fetchTools();
  };

  const handleEdit = (tool) => {
    setEditingTool(tool);
  };

  const handleShareTool = (tool) => {
    setSharingTool(tool);
    setCopied(false);
  };

  const copyToolLink = (tool) => {
    const link = `${window.location.origin}/tool/${tool.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleChange = (e) => {
    setEditingTool({
      ...editingTool,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;

    const { error } = await supabase.storage.from('pdfs').upload(fileName, file);

    if (error) {
      console.error(error);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('pdfs').getPublicUrl(fileName);

    setEditingTool(prev => ({
      ...prev,
      pdf_url: data.publicUrl
    }));
    setUploading(false);
  };

  const handleUpdate = async () => {
    if (uploading) {
      alert('Wait for upload to finish');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('tools')
      .update({
        title: editingTool.title,
        category: editingTool.category,
        tool_url: editingTool.tool_url,
        image_url: editingTool.image_url,
        pdf_url: editingTool.pdf_url,
        description: editingTool.description,
        views: Number(editingTool.views || 0)
      })
      .eq('id', editingTool.id);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setEditingTool(null);
    fetchTools();
    setLoading(false);
  };

  const [search, setSearch] = useState('');

  const filteredTools = tools.filter(tool => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      (tool.title || '').toLowerCase().includes(q) ||
      (tool.category || '').toLowerCase().includes(q) ||
      (tool.description || '').toLowerCase().includes(q) ||
      (tool.tool_url || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="tools-table-card clay-card">
      {/* HEADER */}
      <div className="tools-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="header-title-group">
          <Wrench size={22} className="header-icon" />
          <div>
            <h2>Manage AI Tools</h2>
            <p>Update, edit, share, or remove published tools ({tools.length} total tools in catalog)</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: "relative", minWidth: "240px", maxWidth: "340px" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", zIndex: 2 }} />
            <ClayInput
              placeholder="Search tools by title, category, URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "40px", paddingRight: search ? "36px" : "14px", width: "100%" }}
            />
            {search && (
              <X size={15} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", cursor: "pointer", zIndex: 2 }} onClick={() => setSearch('')} title="Clear search" />
            )}
          </div>

          <div className="tools-count-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--accent-primary)" />
            <span>{tools.length} Tools</span>
            {search && <span style={{ opacity: 0.75, fontSize: '11px' }}>({filteredTools.length} found)</span>}
          </div>
        </div>
      </div>

      {/* SHARE MODAL */}
      {sharingTool && (
        <div className="edit-modal-overlay">
          <div className="edit-modal clay-surface" style={{ maxWidth: "480px" }}>
            <div className="edit-modal-header">
              <div className="modal-title-group">
                <div className="modal-header-icon-box clay-inset">
                  <Share2 size={18} className="header-icon" />
                </div>
                <div>
                  <h3>Share AI Tool</h3>
                  <p className="modal-subtitle">Promote & share {sharingTool.title}</p>
                </div>
              </div>
              <button className="close-btn clay-pill" onClick={() => setSharingTool(null)} type="button">
                <X size={16} />
              </button>
            </div>

            <div className="edit-form-scrollable" style={{ padding: "20px 24px" }}>
              <div className="tool-edit-preview-banner clay-inset" style={{ margin: 0 }}>
                <img 
                  src={sharingTool.image_url || DEFAULT_TOOL_ICON} 
                  alt={sharingTool.title}
                  onError={(e) => handleImageError(e, DEFAULT_TOOL_ICON)}
                  className="edit-preview-img"
                />
                <div className="edit-preview-info">
                  <h4>{sharingTool.title}</h4>
                  <span className="table-category-pill">{sharingTool.category || "AI Tool"}</span>
                </div>
              </div>

              <div className="form-section-title" style={{ marginTop: "16px" }}>Direct Share Link</div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input 
                  type="text" 
                  readOnly 
                  className="clay-input" 
                  value={`${window.location.origin}/tool/${sharingTool.id}`} 
                  style={{ fontSize: "12px", width: "100%" }}
                />
                <button 
                  className={`clay-button ${copied ? 'active' : 'clay-button-primary'}`} 
                  onClick={() => copyToolLink(sharingTool)}
                  type="button"
                  style={{ padding: "10px 16px", flexShrink: 0 }}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="form-section-title" style={{ marginTop: "16px" }}>Share via Social & Messaging</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${sharingTool.title} on Webspedia!\n${window.location.origin}/tool/${sharingTool.id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="clay-button"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", color: "#22c55e", background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "10px" }}
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp</span>
                </a>

                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${sharingTool.title} on Webspedia!`)}&url=${encodeURIComponent(`${window.location.origin}/tool/${sharingTool.id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="clay-button"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", color: "#38bdf8", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", padding: "10px" }}
                >
                  <Share2 size={15} />
                  <span>Twitter / X</span>
                </a>
              </div>
            </div>

            <div className="modal-footer">
              <button className="clay-button save-action-btn" onClick={() => setSharingTool(null)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingTool && (
        <div className="edit-modal-overlay">
          <div className="edit-modal clay-surface">
            {/* STICKY HEADER */}
            <div className="edit-modal-header">
              <div className="modal-title-group">
                <div className="modal-header-icon-box clay-inset">
                  <Edit3 size={18} className="header-icon" />
                </div>
                <div>
                  <h3>Edit AI Tool</h3>
                  <p className="modal-subtitle">Update tool metadata, links, and assets</p>
                </div>
              </div>
              <button className="close-btn clay-pill" onClick={() => setEditingTool(null)} type="button" title="Close Modal">
                <X size={16} />
              </button>
            </div>

            {/* LIVE PREVIEW BANNER */}
            <div className="tool-edit-preview-banner clay-inset">
              <img 
                src={editingTool.image_url || DEFAULT_TOOL_ICON} 
                alt={editingTool.title}
                onError={(e) => handleImageError(e, DEFAULT_TOOL_ICON)}
                className="edit-preview-img"
              />
              <div className="edit-preview-info">
                <h4>{editingTool.title || "Untitled Tool"}</h4>
                <div className="edit-preview-pills">
                  <span className="table-category-pill">{editingTool.category || "Uncategorized"}</span>
                  <span className="views-badge">
                    <Eye size={12} /> {editingTool.views || 0} Clicks
                  </span>
                </div>
              </div>
            </div>

            {/* SCROLLABLE FORM GRID */}
            <div className="edit-form-scrollable">
              {/* SECTION: BASIC INFO */}
              <div className="form-section-title">Basic Information</div>
              <div className="edit-form-grid-2col">
                <div className="input-group">
                  <label><Wrench size={13} /> Tool Title</label>
                  <input
                    type="text"
                    name="title"
                    className="clay-input"
                    placeholder="Enter tool title..."
                    value={editingTool.title || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label><FileText size={13} /> Category</label>
                  <input
                    type="text"
                    name="category"
                    className="clay-input"
                    placeholder="e.g. Writing, Coding, Design..."
                    value={editingTool.category || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* SECTION: LINKS & ANALYTICS */}
              <div className="form-section-title" style={{ marginTop: '16px' }}>Links & Analytics</div>
              <div className="edit-form-grid-2col">
                <div className="input-group">
                  <label><ExternalLink size={13} /> Website URL</label>
                  <input
                    type="text"
                    name="tool_url"
                    className="clay-input"
                    placeholder="https://..."
                    value={editingTool.tool_url || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label><Eye size={13} /> Clicks / Views Count</label>
                  <input
                    type="number"
                    name="views"
                    className="clay-input"
                    value={editingTool.views || 0}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* SECTION: ASSETS & MEDIA */}
              <div className="form-section-title" style={{ marginTop: '16px' }}>Logo & Documentation</div>
              <div className="edit-form-grid-2col">
                <div className="input-group">
                  <label><Upload size={13} /> Image / Logo URL</label>
                  <input
                    type="text"
                    name="image_url"
                    className="clay-input"
                    placeholder="https://..."
                    value={editingTool.image_url || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label><FileText size={13} /> PDF Attachment</label>
                  <div className="upload-box-clay clay-inset">
                    <input type="file" accept=".pdf" onChange={handleFileUpload} id="edit-pdf-upload" style={{ display: 'none' }} />
                    <label htmlFor="edit-pdf-upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', margin: 0 }}>
                      <Upload size={14} color="var(--accent-primary)" />
                      {uploading ? (
                        <span>Uploading PDF...</span>
                      ) : (
                        <span>{editingTool.pdf_url ? 'Change PDF File' : 'Choose PDF File'}</span>
                      )}
                    </label>
                  </div>
                  {editingTool.pdf_url && (
                    <a href={editingTool.pdf_url} target="_blank" rel="noreferrer" className="table-pdf-link" style={{ marginTop: '4px' }}>
                      <FileText size={12} />
                      <span>View Current PDF</span>
                    </a>
                  )}
                </div>
              </div>

              {/* SECTION: DESCRIPTION */}
              <div className="form-section-title" style={{ marginTop: '16px' }}>Description</div>
              <div className="input-group full-width">
                <textarea
                  rows="4"
                  name="description"
                  className="clay-input"
                  placeholder="Comprehensive description of the tool..."
                  value={editingTool.description || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* STICKY FOOTER ACTIONS */}
            <div className="modal-footer">
              <button className="clay-button save-action-btn" onClick={() => setEditingTool(null)} type="button">
                Cancel
              </button>

              <button
                className="clay-button clay-button-primary"
                onClick={handleUpdate}
                disabled={loading || uploading}
                type="button"
                style={{ padding: '10px 24px' }}
              >
                {loading ? (
                  <span>Saving Changes...</span>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="tools-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Clicks / Views</th>
              <th>PDF</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTools.length > 0 ? (
              filteredTools.map(tool => (
                <tr key={tool.id}>
                  <td>
                    <img
                      src={tool.image_url || DEFAULT_TOOL_ICON}
                      alt={tool.title}
                      onError={(e) => handleImageError(e, DEFAULT_TOOL_ICON)}
                      className="table-tool-img"
                    />
                  </td>

                  <td>
                    <div className="table-tool-title">{tool.title}</div>
                  </td>

                  <td>
                    <span className="table-category-pill">{tool.category || "AI Tool"}</span>
                  </td>

                  <td>
                    <span className="table-category-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--clay-surface-recessed)', fontWeight: '800' }}>
                      <Eye size={12} color="var(--accent-primary)" />
                      <span>{tool.views || 0} Clicks</span>
                    </span>
                  </td>

                  <td>
                    {tool.pdf_url ? (
                      <a href={tool.pdf_url} target="_blank" rel="noreferrer" className="table-pdf-link">
                        <FileText size={14} />
                        <span>View</span>
                      </a>
                    ) : (
                      <span className="no-pdf">—</span>
                    )}
                  </td>

                  <td>
                    <div className="table-action-buttons">
                      <button className="clay-btn edit-action-btn" onClick={() => handleEdit(tool)} type="button" title="Edit Tool">
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <button className="clay-btn edit-action-btn" onClick={() => handleShareTool(tool)} type="button" title="Share Tool" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
                        <Share2 size={13} />
                        <span>Share</span>
                      </button>

                      <button className="clay-btn delete-action-btn" onClick={() => deleteTool(tool.id)} type="button" title="Delete Tool">
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="table-empty-state">
                    <p>{search ? `No AI tools found matching "${search}"` : 'No tools available. Add a tool to manage it here.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}