import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ClayCard, ClayButton, ClayInput, ClayBadge } from '../components/clay';
import { Sparkles, ArrowRight, Lock, Mail, KeyRound, X, CheckCircle2 } from 'lucide-react';
import DarkModeToggle from '../components/DarkModeToggle';
import '../styles/login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

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

      const { data: profile } = await supabase
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your email address');
      return;
    }

    setResetLoading(true);

    try {
      const redirectUrl = window.location.origin.includes('localhost')
        ? `${window.location.origin}/reset-password`
        : 'https://webspedia.vercel.app/reset-password';

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: redirectUrl,
      });

      if (resetErr) {
        setResetError(resetErr.message);
      } else {
        setResetMessage(`Password reset link sent to ${resetEmail.trim()}! Please check your inbox.`);
      }
    } catch (err) {
      setResetError('Password reset failed: ' + err.message);
    }

    setResetLoading(false);
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
              <div className="label-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "700", margin: 0 }}>Password</label>
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => {
                    setResetEmail(form.email);
                    setShowResetModal(true);
                  }}
                  style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "12px", fontWeight: "700", cursor: "pointer", padding: 0 }}
                >
                  Forgot Password?
                </button>
              </div>

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

      {/* FORGOT PASSWORD MODAL */}
      {showResetModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
            zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
          }}
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="clay-card"
            style={{ width: "100%", maxWidth: "440px", padding: "28px", background: "var(--clay-surface)" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <KeyRound size={18} color="#ffffff" />
                </div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "var(--text-primary)" }}>
                  Reset Password
                </h3>
              </div>

              <button
                type="button"
                className="clay-btn"
                onClick={() => setShowResetModal(false)}
                style={{ width: "32px", height: "32px", borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={16} />
              </button>
            </div>

            {resetMessage ? (
              <div style={{ padding: "20px", textAlign: "center", background: "var(--clay-surface-raised)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <CheckCircle2 size={40} color="var(--color-success)" />
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--text-primary)" }}>Email Sent!</h4>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{resetMessage}</p>
                <ClayButton size="sm" onClick={() => setShowResetModal(false)} style={{ marginTop: "10px" }}>
                  Close
                </ClayButton>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  Enter your registered account email address below to receive a password reset link.
                </p>

                {resetError && <div className="auth-error-badge">{resetError}</div>}

                <div className="input-field-group">
                  <label style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px", display: "block" }}>Email Address</label>
                  <div className="input-with-icon" style={{ position: "relative" }}>
                    <Mail size={16} className="field-icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <ClayInput
                      type="email"
                      placeholder="name@example.com"
                      style={{ paddingLeft: "42px" }}
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <ClayButton variant="primary" type="submit" disabled={resetLoading} style={{ width: "100%", marginTop: "6px" }}>
                  <span>{resetLoading ? 'Sending Link...' : 'Send Reset Link'}</span>
                  <KeyRound size={16} />
                </ClayButton>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}