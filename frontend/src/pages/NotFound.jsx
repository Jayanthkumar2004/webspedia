import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page-container">
      <Navbar />
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
        <div className="clay-surface" style={{ padding: '48px', textAlignment: 'center', textAlign: 'center', maxWidth: '480px', width: '100%' }}>
          <div className="clay-avatar" style={{ width: '64px', height: '64px', margin: '0 auto 20px', background: 'var(--accent-gradient)' }}>
            <AlertCircle size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '10px' }}>404 - Page Not Found</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/" className="clay-button clay-button-primary" style={{ display: 'inline-flex', gap: '8px', padding: '12px 24px' }}>
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
