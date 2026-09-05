import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Wrench, Edit3, Trash2, FileText, X, Check, Upload, ExternalLink } from 'lucide-react';
import { DEFAULT_TOOL_ICON, handleImageError } from '../../utils/placeholder';
import '../../styles/ToolsTable.css';

export default function ToolsTable() {
  const [tools, setTools] = useState([]);
  const [editingTool, setEditingTool] = useState(null);
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
        description: editingTool.description
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

  return (
    <div className="tools-table-card clay-card">
      {/* HEADER */}
      <div className="tools-header">
        <div className="header-title-group">
          <Wrench size={22} className="header-icon" />
          <div>
            <h2>Manage AI Tools</h2>
            <p>Update, edit, or remove published tools</p>
          </div>
        </div>

        <div className="tools-count-pill">
          <span>{tools.length} Tools</span>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingTool && (
        <div className="edit-modal-overlay">
          <div className="edit-modal clay-card">
            <div className="edit-modal-header">
              <div className="modal-title-group">
                <Edit3 size={18} />
                <h3>Edit Tool Details</h3>
              </div>
              <button className="close-btn clay-btn" onClick={() => setEditingTool(null)} type="button">
                <X size={16} />
              </button>
            </div>

            <div className="edit-form-grid">
              <div className="input-group">
                <label>Tool Title</label>
                <input
                  type="text"
                  name="title"
                  className="clay-input"
                  value={editingTool.title}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  className="clay-input"
                  value={editingTool.category}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group full-width">
                <label>Tool URL</label>
                <input
                  type="text"
                  name="tool_url"
                  className="clay-input"
                  value={editingTool.tool_url}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group full-width">
                <label>Image URL</label>
                <input
                  type="text"
                  name="image_url"
                  className="clay-input"
                  value={editingTool.image_url}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group full-width">
                <label>Description</label>
                <textarea
                  rows="4"
                  name="description"
                  className="clay-input"
                  value={editingTool.description || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group full-width">
                <label>PDF Attachment</label>
                <div className="upload-box-clay">
                  <input type="file" accept=".pdf" onChange={handleFileUpload} />
                  {uploading ? (
                    <span>Uploading PDF...</span>
                  ) : (
                    <span>{editingTool.pdf_url ? 'PDF Uploaded' : 'Choose PDF File'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="clay-btn" onClick={() => setEditingTool(null)} type="button">
                Cancel
              </button>

              <button
                className="clay-btn-primary"
                onClick={handleUpdate}
                disabled={loading || uploading}
                type="button"
              >
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
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
              <th>PDF</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tools.length > 0 ? (
              tools.map(tool => (
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
                      <button className="clay-btn edit-action-btn" onClick={() => handleEdit(tool)} type="button">
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <button className="clay-btn delete-action-btn" onClick={() => deleteTool(tool.id)} type="button">
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  <div className="table-empty-state">
                    <p>No tools available. Add a tool to manage it here.</p>
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