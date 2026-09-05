import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClayCard, ClayButton, ClayBadge } from './clay';
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone } from 'lucide-react';
import '../styles/home.css';

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Default fallback banners if none are in Supabase yet
  const defaultBanners = [
    {
      id: 'default-1',
      title: 'Supercharge Workflow with ChatGPT Plus',
      subtitle: 'Experience GPT-4o speed, custom GPTs, and advanced data analysis.',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      target_url: 'https://chatgpt.com',
      button_text: 'Explore ChatGPT',
      category_badge: 'Featured AI'
    },
    {
      id: 'default-2',
      title: 'Accelerate Coding with GitHub Copilot',
      subtitle: 'Your AI pair programmer — write cleaner code up to 55% faster.',
      image_url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1200&q=80',
      target_url: 'https://github.com/features/copilot',
      button_text: 'Try Copilot Free',
      category_badge: 'Developer Tools'
    },
    {
      id: 'default-3',
      title: 'Generate Professional Visuals with Midjourney',
      subtitle: 'Transform text prompts into breathtaking photorealistic art and design assets.',
      image_url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
      target_url: 'https://midjourney.com',
      button_text: 'Create Visuals',
      category_badge: 'Generative Design'
    }
  ];

  const deduplicateBanners = (list) => {
    const unique = [];
    const seen = new Set();
    (list || []).forEach(item => {
      const titleKey = (item.title || '').trim().toLowerCase();
      const urlKey = (item.target_url || item.url || '').trim().toLowerCase();
      const imageKey = (item.image_url || '').trim().toLowerCase();

      const isDup = (titleKey && seen.has(`t:${titleKey}`)) ||
                    (urlKey && seen.has(`u:${urlKey}`)) ||
                    (imageKey && seen.has(`i:${imageKey}`));

      if (!isDup) {
        if (titleKey) seen.add(`t:${titleKey}`);
        if (urlKey) seen.add(`u:${urlKey}`);
        if (imageKey) seen.add(`i:${imageKey}`);
        unique.push(item);
      }
    });
    return unique;
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (!error && data && data.length > 0) {
        const uniqueBanners = deduplicateBanners(data);
        setBanners(uniqueBanners.length > 0 ? uniqueBanners : deduplicateBanners(defaultBanners));
      } else {
        setBanners(deduplicateBanners(defaultBanners));
      }
    } catch {
      setBanners(deduplicateBanners(defaultBanners));
    }
    setLoading(false);
  };

  // Auto-slide effect every 6 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <ClayCard elevated className="banner-slider-card" style={{ padding: '0', overflow: 'hidden', position: 'relative', marginBottom: '36px' }}>
      <div
        className="banner-slide-content"
        style={{
          minHeight: '260px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          position: 'relative'
        }}
      >
        {/* LEFT TEXT & CTA AREA */}
        <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
          <ClayBadge style={{ marginBottom: '14px', width: 'max-content' }}>
            <Megaphone size={12} />
            <span>{currentBanner.category_badge || 'Featured Announcement'}</span>
          </ClayBadge>

          <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.25' }}>
            {currentBanner.title}
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6', maxWidth: '520px' }}>
            {currentBanner.subtitle || currentBanner.description}
          </p>

          <div>
            <a
              href={currentBanner.target_url || '#'}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <ClayButton variant="primary" size="md">
                <span>{currentBanner.button_text || 'Learn More'}</span>
                <ExternalLink size={15} />
              </ClayButton>
            </a>
          </div>
        </div>

        {/* RIGHT IMAGE SHOWCASE */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: '260px' }}>
          <img
            src={currentBanner.image_url || 'https://via.placeholder.com/800x400'}
            alt={currentBanner.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              maskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)'
            }}
          />
        </div>

        {/* CAROUSEL ARROWS */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="clay-button"
              type="button"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderRadius: '50%',
                padding: '8px',
                zIndex: 10
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleNext}
              className="clay-button"
              type="button"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderRadius: '50%',
                padding: '8px',
                zIndex: 10
              }}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* DOT INDICATORS */}
      {banners.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 0 16px', background: 'var(--clay-surface)' }}>
          {banners.map((b, idx) => (
            <button
              key={b.id || idx}
              onClick={() => setCurrentIndex(idx)}
              type="button"
              style={{
                width: idx === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: 'var(--radius-pill)',
                background: idx === currentIndex ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </ClayCard>
  );
}
