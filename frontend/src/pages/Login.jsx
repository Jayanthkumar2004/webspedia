import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ClayCard, ClayButton, ClayInput, ClayBadge } from '../components/clay';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';
import DarkModeToggle from '../components/DarkModeToggle';
import '../styles/login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('User not found');
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      let bannedMap = {};
      try {
        bannedMap = JSON.parse(localStorage.getItem('banned_user_ids') || '{}');
      } catch {}

      const isBanned = !!(profile?.is_banned || profile?.role === 'BANNED' || bannedMap[data.user.id]);

      if (isBanned) {
        await supabase.auth.signOut();
        setError('Your account has been banned by an administrator.');
        setLoading(false);
        return;
      }

      const userRole = profile?.role || 'USER';
      localStorage.setItem('role', userRole);

      if (userRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }

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
            Discover the right AI tool for your workflow.
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
            Explore thousands of AI solutions, reviews, and community insights.
          </p>
        </div>

        {/* FORM PANE */}
        <div className="auth-form-pane">
          <div className="form-header" style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>Welcome Back</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
              Sign in to your account to access your saved tools
            </p>
          </div>

          {error && <div className="auth-error-badge">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                  placeholder="••••••••"
                  style={{ paddingLeft: "42px" }}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <ClayButton type="submit" variant="primary" disabled={loading} style={{ width: "100%", marginTop: "8px" }}>
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </ClayButton>
          </form>

          <p className="auth-switch-text" style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
            Don't have an account? <Link to="/register" style={{ color: "var(--accent-primary)", fontWeight: "700" }}>Create an account</Link>
          </p>
        </div>
      </ClayCard>
    </div>
  );
}