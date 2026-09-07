import { useEffect, useState } from 'react';
import { getSocialLinks, getFooterSettings } from '../lib/websiteServicesApi';
import { MessageCircle, Globe, Share2, Send, Mail, Phone, ExternalLink, Link, AtSign } from 'lucide-react';
import '../styles/footer.css';

const ICON_MAP = {
  MessageCircle: MessageCircle,
  Globe: Globe,
  Share2: Share2,
  Send: Send,
  Mail: Mail,
  Phone: Phone,
  ExternalLink: ExternalLink,
  Link: Link,
  AtSign: AtSign
};

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState([]);
  const [footerSettings, setFooterSettings] = useState(null);

  useEffect(() => {
    const loadFooterData = async () => {
      try {
        const [links, settings] = await Promise.all([
          getSocialLinks(),
          getFooterSettings()
        ]);
        if (links) setSocialLinks(links.filter(l => l.is_active !== false));
        if (settings) setFooterSettings(settings);
      } catch (err) {
        console.error('Error fetching footer dynamic settings:', err);
      }
    };
    loadFooterData();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* BRAND */}
        <div className="footer-brand">
          <div className="footer-logo-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div className="logo-icon-clay" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
              <img src="/logo.png" alt="Webspedia Logo" className="logo-img" />
            </div>
            <h2 style={{ margin: 0 }}>webspedia</h2>
          </div>
          <p>{footerSettings?.description || 'Discover and share the best AI tools for writing, coding, and design.'}</p>
        </div>

        {/* LINKS */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/saved-tools">Saved Tools</a>
          <a href="/profile">Profile</a>
          <a href="/website-services">Website Services</a>
        </div>

        {/* COMMUNITY */}
        <div className="footer-social">
          <h4>Community & Socials</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            {socialLinks && socialLinks.length > 0 ? (
              socialLinks.map((link) => {
                const IconComponent = ICON_MAP[link.icon] || Globe;
                return (
                  <a
                    key={link.id || link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <IconComponent size={14} />
                    <span>{link.platform}</span>
                  </a>
                );
              })
            ) : (
              <>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={14} />
                  <span>Twitter</span>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={14} />
                  <span>LinkedIn</span>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={14} />
                  <span>GitHub</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        {footerSettings?.copyright_text || '© 2026 Webspedia AI Directory. All rights reserved.'}
      </div>
    </footer>
  );
}