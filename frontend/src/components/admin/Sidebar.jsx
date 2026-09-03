import { LayoutDashboard, Wrench, Users, BarChart3, Megaphone, Sparkles, ArrowLeft, MessageSquareHeart, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin.css';

export default function Sidebar({ active, setActive }) {
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Tools", icon: <Wrench size={18} /> },
    { name: "Banners", icon: <Megaphone size={18} /> },
    { name: "Our Websites", icon: <Globe size={18} /> },
    { name: "Feedback", icon: <MessageSquareHeart size={18} /> },
    { name: "Users", icon: <Users size={18} /> },
    { name: "Analytics", icon: <BarChart3 size={18} /> }
  ];

  return (
    <div className="sidebar clay-card">
      <div>
        <div className="admin-logo-row" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="admin-logo-icon">
            <Sparkles size={20} color="#ffffff" />
          </div>
          <h2>Admin Hub</h2>
        </div>

        <ul className="sidebar-menu">
          {menu.map(item => (
            <li
              key={item.name}
              className={`sidebar-item ${active === item.name ? "active" : ""}`}
              onClick={() => setActive(item.name)}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        <button className="clay-btn exit-admin-btn" onClick={() => navigate('/')} type="button">
          <ArrowLeft size={16} />
          <span>Main Site</span>
        </button>
      </div>
    </div>
  );
}