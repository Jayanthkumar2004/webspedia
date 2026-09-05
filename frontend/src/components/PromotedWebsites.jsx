import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Globe, ExternalLink, Sparkles } from 'lucide-react';
import '../styles/promoted_websites.css';

export default function PromotedWebsites() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotedWebsites();
  }, []);

  const fetchPromotedWebsites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promoted_websites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Promoted websites table check:', error.message);
        setWebsites([]);
      } else {
        const unique = [];
        const seen = new Set();
        (data || []).forEach(item => {
          const key = (item.title || item.url || '').trim().toLowerCase();
          if (key && !seen.has(key)) {
            seen.add(key);
            unique.push(item);
          }
        });
        setWebsites(unique);
      }
    } catch (err) {
      console.error(err);
      setWebsites([]);
    }
    setLoading(false);
  };

  // Default fallback promoted sites if table is empty or being configured
  const displaySites = websites.length > 0 ? websites : [
    {
      id: 'demo-1',
      title: 'Vercel Deployment Platform',
      description: 'Develop, preview, and ship high-performance web applications with zero configuration.',
      url: 'https://vercel.com',
      image_url: 'https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png',
      category: 'Cloud Hosting'
    },
    {
      id: 'demo-2',
      title: 'Supabase Open Source Database',
      description: 'The open source Firebase alternative. Build in a weekend, scale to millions of users.',
      url: 'https://supabase.com',
      image_url: 'https://supabase.com/favicon/favicon-196x196.png',
      category: 'Backend SaaS'
    }
  ];

  return (
    <section className="promoted-websites-section">
      <div className="promoted-websites-container clay-card">
        <div className="promoted-header">
          <div className="promoted-icon-clay">
            <Globe size={24} color="#ffffff" />
          </div>
          <div className="title-group">
            <span className="clay-pill featured-badge">
              <Sparkles size={12} color="var(--accent-primary)" />
              <span>Recommended Ecosystem</span>
            </span>
            <h2>Our Websites</h2>
            <p>Explore curated external platforms, developer tools, and official websites by Webspedia.</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-websites clay-surface">
            <p>Loading websites...</p>
          </div>
        ) : (
          <div className="promoted-grid">
            {displaySites.map((site) => (
              <div key={site.id} className="promoted-site-card clay-card clay-raised">
                <div className="site-card-top">
                  <div className="site-image-wrapper clay-inset">
                    {site.image_url ? (
                      <img src={site.image_url} alt={site.title} />
                    ) : (
                      <Globe size={24} color="var(--accent-primary)" />
                    )}
                  </div>

                  <span className="site-category-badge clay-pill">
                    {site.category || 'Partner'}
                  </span>
                </div>

                <div className="site-card-body">
                  <h3>{site.title}</h3>
                  <p>{site.description || 'Visit website for more details.'}</p>
                </div>

                <div className="site-card-footer">
                  <a
                    href={site.url?.startsWith('http') ? site.url : `https://${site.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="clay-button-primary visit-site-btn"
                  >
                    <span>Visit Website</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
