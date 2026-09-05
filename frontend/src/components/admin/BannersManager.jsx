import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ClayCard, ClayButton, ClayInput, ClayTextarea, ClayBadge, ClayModal } from '../clay';
import { Megaphone, Plus, Edit, Trash2, CheckCircle2, XCircle, ExternalLink, Image as ImageIcon, MoveUp, MoveDown } from 'lucide-react';

export default function BannersManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    target_url: '',
    button_text: 'Learn More',
    category_badge: 'Featured',
    position: 1,
    is_active: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('position', { ascending: true });

    if (!error && data) {
      const unique = [];
      const seenKeys = new Set();
      const duplicateIds = [];

      data.forEach(b => {
        const titleKey = (b.title || '').trim().toLowerCase();
        const urlKey = (b.target_url || '').trim().toLowerCase();
        const imageKey = (b.image_url || '').trim().toLowerCase();

        const isDup = (titleKey && seenKeys.has(`t:${titleKey}`)) ||
                      (urlKey && seenKeys.has(`u:${urlKey}`)) ||
                      (imageKey && seenKeys.has(`i:${imageKey}`));

        if (isDup) {
          if (b.id) duplicateIds.push(b.id);
        } else {
          if (titleKey) seenKeys.add(`t:${titleKey}`);
          if (urlKey) seenKeys.add(`u:${urlKey}`);
          if (imageKey) seenKeys.add(`i:${imageKey}`);
          unique.push(b);
        }
      });

      if (duplicateIds.length > 0) {
        await supabase.from('banners').delete().in('id', duplicateIds);
      }

      setBanners(unique);
    }
    setLoading(false);
  };

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setForm({
      title: '',
      subtitle: '',
      image_url: '',
      target_url: '',
      button_text: 'Learn More',
      category_badge: 'Featured',
      position: banners.length + 1,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',
      target_url: banner.target_url || '',
      button_text: banner.button_text || 'Learn More',
      category_badge: banner.category_badge || 'Featured',
      position: banner.position || 1,
      is_active: banner.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.target_url.trim()) {
      alert('Title and Target URL are required');
      return;
    }

    if (editingBanner) {
      // UPDATE
      const { error } = await supabase
        .from('banners')
        .update({
          title: form.title,
          subtitle: form.subtitle,
          image_url: form.image_url,
          target_url: form.target_url,
          button_text: form.button_text,
          category_badge: form.category_badge,
          position: Number(form.position),
          is_active: form.is_active
        })
        .eq('id', editingBanner.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      // INSERT
      const { error } = await supabase
        .from('banners')
        .insert([
          {
            title: form.title,
            subtitle: form.subtitle,
            image_url: form.image_url,
            target_url: form.target_url,
            button_text: form.button_text,
            category_badge: form.category_badge,
            position: Number(form.position),
            is_active: form.is_active
          }
        ]);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setIsModalOpen(false);
    fetchBanners();
  };

  const toggleActiveStatus = async (banner) => {
    const { error } = await supabase
      .from('banners')
      .update({ is_active: !banner.is_active })
      .eq('id', banner.id);

    if (!error) {
      fetchBanners();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad banner?')) return;

    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchBanners();
    }
  };

  return (
    <div className="banners-manager-wrapper">
      {/* HEADER CARD */}
      <ClayCard elevated style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <ClayBadge style={{ marginBottom: '8px' }}>
              <Megaphone size={14} />
              <span>Promotional Banners</span>
            </ClayBadge>
            <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '4px 0' }}>Ad Banner Carousel Manager</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
              Create, edit, re-order, and manage active promotional slides rendered on the main homepage.
            </p>
          </div>

          <ClayButton variant="primary" onClick={handleOpenAddModal}>
            <Plus size={16} />
            <span>Create New Banner</span>
          </ClayButton>
        </div>
      </ClayCard>

      {/* BANNERS LIST TABLE / CARDS */}
      <ClayCard elevated style={{ padding: '24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading promotional banners...</p>
        ) : banners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No promotional ad banners created yet in database.</p>
            <ClayButton variant="primary" onClick={handleOpenAddModal}>
              <Plus size={16} />
              <span>Add First Banner</span>
            </ClayButton>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {banners.map((banner) => (
              <ClayCard recessed key={banner.id} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <img
                    src={banner.image_url || 'https://via.placeholder.com/120x80'}
                    alt=""
                    style={{ width: '80px', height: '54px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{banner.title}</h4>
                      <ClayBadge>{banner.category_badge || 'Banner'}</ClayBadge>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pos #{banner.position}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{banner.subtitle || 'No subtitle provided'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => toggleActiveStatus(banner)}
                    className="clay-pill"
                    style={{
                      background: banner.is_active ? 'var(--color-success-bg)' : 'var(--clay-surface)',
                      color: banner.is_active ? 'var(--color-success)' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    type="button"
                  >
                    {banner.is_active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>{banner.is_active ? 'Active' : 'Disabled'}</span>
                  </button>

                  <ClayButton size="sm" onClick={() => handleOpenEditModal(banner)}>
                    <Edit size={14} />
                    <span>Edit</span>
                  </ClayButton>

                  <ClayButton variant="danger" size="sm" onClick={() => handleDelete(banner.id)}>
                    <Trash2 size={14} />
                  </ClayButton>
                </div>
              </ClayCard>
            ))}
          </div>
        )}
      </ClayCard>

      {/* CREATE / EDIT MODAL */}
      <ClayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Edit Promotional Ad Banner' : 'Create Promotional Ad Banner'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>Banner Title *</label>
            <ClayInput
              placeholder="e.g. Supercharge Workflow with ChatGPT Plus"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>Subtitle / Description</label>
            <ClayTextarea
              rows={2}
              placeholder="e.g. Experience GPT-4o speed and custom GPTs..."
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>Image URL</label>
            <ClayInput
              placeholder="https://images.unsplash.com/..."
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>Target Website URL *</label>
            <ClayInput
              placeholder="https://example.com"
              value={form.target_url}
              onChange={(e) => setForm({ ...form, target_url: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>Button Text</label>
              <ClayInput
                placeholder="e.g. Learn More, Try Free"
                value={form.button_text}
                onChange={(e) => setForm({ ...form, button_text: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>Category Badge</label>
              <ClayInput
                placeholder="e.g. Featured, Sponsored"
                value={form.category_badge}
                onChange={(e) => setForm({ ...form, category_badge: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <span>Banner Active</span>
            </label>

            <div style={{ display: 'flex', gap: '10px' }}>
              <ClayButton onClick={() => setIsModalOpen(false)}>Cancel</ClayButton>
              <ClayButton variant="primary" type="submit">
                {editingBanner ? 'Save Changes' : 'Create Banner'}
              </ClayButton>
            </div>
          </div>
        </form>
      </ClayModal>
    </div>
  );
}
