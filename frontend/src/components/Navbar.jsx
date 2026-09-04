import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DarkModeToggle from './DarkModeToggle';
import { 
  Sparkles, 
  Home, 
  Globe,
  MessageSquare, 
  Bookmark, 
  User, 
  ShieldCheck, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import '../styles/navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [loadingAvatar, setLoadingAvatar] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;
      setUser(currentUser);

      if (currentUser) {
        fetchAvatar(currentUser);
      } else {
        setLoadingAvatar(false);
      }
    };

    fetchUser();

    const storedRole = localStorage.getItem('role');
    if (storedRole) setRole(storedRole);
  }, []);

  const fetchAvatar = async (user) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, role")
      .eq("id", user.id)
      .single();

    if (profile?.avatar_url) {
      setAvatar(profile.avatar_url);
    }
    if (profile?.role) {
      setRole(profile.role);
      localStorage.setItem('role', profile.role);
    }
    setLoadingAvatar(false);
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await supabase.auth.signOut();
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setRole(null);
    navigate('/login');
  };

  const getInitial = () => {
    const name = user?.email || "User";
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar clay-nav">
      {/* LOGO */}
      <div className="logo" onClick={() => { setMobileMenuOpen(false); navigate('/'); }}>
        <div className="logo-icon-clay">
          <Sparkles size={20} color="#ffffff" />
        </div>
        <h2>webspedia</h2>
      </div>

      {/* RIGHT NAVIGATION */}
      <div className="nav-right">
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
            <Home size={16} />
            <span>Home</span>
          </Link>

          <Link to="/website-services" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
            <Globe size={16} />
            <span>Build Your Website</span>
          </Link>

          <Link to="/chats" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
            <MessageSquare size={16} />
            <span>Chats</span>
          </Link>

          <Link to="/saved-tools" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
            <Bookmark size={16} />
            <span>Saved Tools</span>
          </Link>

          {role === 'ADMIN' && (
            <Link to="/admin" className="nav-admin-btn" onClick={() => setMobileMenuOpen(false)}>
              <ShieldCheck size={16} />
              <span>Admin Hub</span>
            </Link>
          )}

          {user ? (
            <>
              <Link to="/profile" className="nav-item avatar-link" onClick={() => setMobileMenuOpen(false)}>
                {avatar ? (
                  <img src={avatar} alt="avatar" className="navbar-avatar" />
                ) : (
                  <div className="navbar-initial">
                    {getInitial()}
                  </div>
                )}
                <span>Profile</span>
              </Link>

              <button className="logout-btn" onClick={handleLogout} type="button">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
              <User size={16} />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* DARK/LIGHT THEME TOGGLE */}
        <DarkModeToggle />

        {/* MOBILE HAMBURGER TOGGLE BUTTON */}
        <button 
          className="mobile-hamburger-btn clay-btn"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          type="button"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}