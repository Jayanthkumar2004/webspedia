import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Upload, Check, FileText, Sparkles } from 'lucide-react';
import '../../styles/ToolForm.css';

export default function ToolForm({ onToolAdded }) {
  const [tool, setTool] = useState({
    title: '',
    category: '',
    tool_url: '',
    description: '',
    image_url: '',
    pdf_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setTool({
      ...tool,
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
      alert('File upload failed');
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('pdfs').getPublicUrl(fileName);

    setTool(prev => ({
      ...prev,
      pdf_url: data.publicUrl
    }));

    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tool.title || !tool.category || !tool.tool_url) {
      alert('Please fill required fields (Title, Category, Tool URL)');
      return;
    }

    if (uploading) {
      alert('Wait for PDF upload to finish');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('tools')
      .insert([
        {
          title: tool.title,
          category: tool.category,
          tool_url: tool.tool_url,
          description: tool.description,
          image_url: tool.image_url,
          pdf_url: tool.pdf_url,
          likes: 0
        }
      ]);

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    alert('Tool added successfully!');

    setTool({
      title: '',
      category: '',
      tool_url: '',
      description: '',
      image_url: '',
      pdf_url: ''
    });

    onToolAdded && onToolAdded();
    setLoading(false);
  };

  return (
    <div className="tool-form-card clay-surface">
      <div className="tool-form-header">
        <div className="title-group">
          <PlusCircle size={22} className="header-icon" />
          <div>
            <h2>Publish New AI Tool</h2>
            <p>Add a new tool to the public catalog</p>
          </div>
        </div>

        <div className="clay-badge">
          <Sparkles size={12} />
          <span>Admin Catalog</span>
        </div>
      </div>

      <form className="tool-form-grid" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tool Title *</label>
          <input
            type="text"
            name="title"
            className="clay-input"
            placeholder="e.g. ChatGPT, Claude AI"
            value={tool.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <input
            type="text"
            name="category"
            className="clay-input"
            placeholder="e.g. Writing, Coding, Design"
            value={tool.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Tool Website URL *</label>
          <input
            type="text"
            name="tool_url"
            className="clay-input"
            placeholder="https://example.com"
            value={tool.tool_url}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Logo / Image URL</label>
          <input
            type="text"
            name="image_url"
            className="clay-input"
            placeholder="https://image-url.com/logo.png"
            value={tool.image_url}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full-width">
          <label>Documentation PDF (Optional)</label>
          <div className="upload-box-clay clay-inset">
            <input type="file" accept=".pdf" onChange={handleFileUpload} />
            {uploading ? (
              <span>Uploading PDF...</span>
            ) : (
              <span className="upload-status-text">
                {tool.pdf_url ? 'PDF Uploaded Successfully' : 'Choose PDF Documentation File'}
              </span>
            )}
          </div>

          {tool.pdf_url && (
            <a href={tool.pdf_url} target="_blank" rel="noreferrer" className="pdf-preview-link">
              <FileText size={14} />
              <span>View Uploaded PDF</span>
            </a>
          )}
        </div>

        <div className="form-group full-width">
          <label>Description</label>
          <textarea
            rows="4"
            name="description"
            className="clay-input"
            placeholder="Write a clear overview of what this AI tool does..."
            value={tool.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-footer full-width">
          <button
            type="submit"
            className="clay-button clay-button-primary submit-tool-btn"
            disabled={loading || uploading}
          >
            <PlusCircle size={16} />
            <span>{loading ? 'Adding Tool...' : uploading ? 'Uploading...' : 'Publish Tool'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}