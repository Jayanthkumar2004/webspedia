import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ClayCard, ClayButton, ClayInput, ClayBadge } from '../components/clay';
import { Sparkles, ArrowRight, Lock, Mail, User } from 'lucide-react';
import DarkModeToggle from '../components/DarkModeToggle';
import '../styles/login.css';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username
          }
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('Signup failed');
        setLoading(false);
        return;
      }

      alert('Registered successfully!');
      navigate('/login');

    } catch {
      setError('Server error');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-theme-fixed">
        <DarkModeToggle />
      </div>

      <ClayCard elevated className="auth-container">
        {/* BRAND SIDEBAR */}
        <div className="auth-brand-pane">
          <ClayBadge style={{ marginBottom: "20px" }}>
            <Sparkles size={16} />
            <span>WEBSPEDIA</span>
          </ClayBadge>

          <h2 style={{ fontSize: "28px", fontWeight: "900", lineHeight: "1.2", marginBottom: "12px" }}>
            Join the community of AI tools explorers.
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
            Create your personal library of saved AI tools and share reviews with the community.
          </p>
        </div>

        {/* FORM PANE */}
        <div className="auth-form-pane">
          <div className="form-header" style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>Create Account</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
              Get started with your free Webspedia account
            </p>
          </div>

          {error && <div className="auth-error-badge">{error}</div>}

          <form onSubmit={handleRegister} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="input-field-group">
              <label style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px", display: "block" }}>Username</label>
              <div className="input-with-icon" style={{ position: "relative" }}>
                <User size={16} className="field-icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <ClayInput
                  id="username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  style={{ paddingLeft: "42px" }}
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                />
              </div>
            </div>

            <div className="input-field-group">
              <label style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px", display: "block" }}>Email Address</label>
              <div className="input-with-icon" style={{ position: "relative" }}>
                <Mail size={16} className="field-icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <ClayInput
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  style={{ paddingLeft: "42px" }}
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="input-field-group">
              <label style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px", display: "block" }}>Password</label>
              <div className="input-with-icon" style={{ position: "relative" }}>
                <Lock size={16} className="field-icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <ClayInput
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  style={{ paddingLeft: "42px" }}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <ClayButton type="submit" variant="primary" disabled={loading} style={{ width: "100%", marginTop: "8px" }}>
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={16} />
            </ClayButton>
          </form>

          <p className="auth-switch-text" style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--accent-primary)", fontWeight: "700" }}>Sign In</Link>
          </p>
        </div>
      </ClayCard>
    </div>
  );
}