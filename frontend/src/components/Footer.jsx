import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* BRAND */}
        <div className="footer-brand">
          <h2>webspedia</h2>
          <p>Discover and share the best AI tools for writing, coding, and design.</p>
        </div>

        {/* LINKS */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/saved-tools">Saved Tools</a>
          <a href="/profile">Profile</a>
        </div>

        {/* COMMUNITY */}
        <div className="footer-social">
          <h4>Community</h4>
          <p>Twitter</p>
          <p>LinkedIn</p>
          <p>GitHub</p>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        © 2026 Webspedia AI Directory. All rights reserved.
      </div>
    </footer>
  );
}