import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ClayCard, ClayButton, ClayInput, ClayBadge } from '../components/clay';
import { Sparkles, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import DarkModeToggle from '../components/DarkModeToggle';
import '../styles/login.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill all password fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      setError('Failed to update password: ' + err.message);
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
            Set a new secure password.
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
            Update your account password to regain full access to your saved tools and profile.
          </p>
        </div>

        {/* FORM PANE */}
        <div className="auth-form-pane">
          <div className="form-header" style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>Reset Your Password</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0 0" }}>
              Choose a strong new password for your Webspedia account
            </p>
          </div>

          {error && <div className="auth-error-badge">{error}</div>}

          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircle2 size={48} color="var(--color-success)" style={{ marginBottom: "14px" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 8px 0" }}>
                Password Updated!
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 20px 0" }}>
                Your password has been successfully reset. Redirecting you to sign in...
              </p>
              <ClayButton variant="primary" onClick={() => navigate('/login')} style={{ width: "100%" }}>
                <span>Go to Login</span>
                <ArrowRight size={16} />
              </ClayButton>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="input-field-group">
                <label style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px", display: "block" }}>New Password</label>
                <div className="input-with-icon" style={{ position: "relative" }}>
                  <Lock size={16} className="field-icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <ClayInput
                    type="password"
                    placeholder="Enter new password"
                    style={{ paddingLeft: "42px" }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label style={{ fontSize: "13px", fontWeight: "700", marginBottom: "6px", display: "block" }}>Confirm New Password</label>
                <div className="input-with-icon" style={{ position: "relative" }}>
                  <Lock size={16} className="field-icon" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <ClayInput
                    type="password"
                    placeholder="Confirm new password"
                    style={{ paddingLeft: "42px" }}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <ClayButton type="submit" variant="primary" disabled={loading} style={{ width: "100%", marginTop: "8px" }}>
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight size={16} />
              </ClayButton>
            </form>
          )}

          <p className="auth-switch-text" style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
            Remembered your password? <Link to="/login" style={{ color: "var(--accent-primary)", fontWeight: "700" }}>Back to Login</Link>
          </p>
        </div>
      </ClayCard>
    </div>
  );
}
