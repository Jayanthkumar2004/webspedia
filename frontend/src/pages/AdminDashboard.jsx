import { useEffect, useState } from 'react';
import Sidebar from '../components/admin/Sidebar';
import UsersTable from '../components/admin/UsersTable';
import ToolsTable from '../components/admin/ToolsTable';
import ToolForm from '../components/admin/ToolForm';
import BannersManager from '../components/admin/BannersManager';
import FeedbackManager from '../components/admin/FeedbackManager';
import WebsitesManager from '../components/admin/WebsitesManager';
import Charts from '../components/admin/Charts';
import StatsCards from '../components/admin/StatsCards';
import DarkModeToggle from '../components/DarkModeToggle';
import { ClayCard, ClayButton, ClayBadge, ClayAvatar } from '../components/clay';
import { supabase } from '../lib/supabase';
import {
  Sparkles,
  Activity,
  BarChart3,
  Wrench,
  MessageSquareHeart,
  Globe
} from 'lucide-react';
import '../styles/admin.css';

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [recentTools, setRecentTools] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const { data: toolsData } = await supabase
        .from("tools")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentTools(toolsData || []);

      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentUsers(usersData || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <Sidebar active={active} setActive={setActive} />

      {/* MAIN CONTENT AREA */}
      <div className="admin-main">
        {/* TOPBAR */}
        <div className="admin-topbar">
          <div className="admin-header-left">
            <ClayBadge style={{ marginBottom: "8px" }}>
              <Sparkles size={14} />
              <span>Admin SaaS Control Center</span>
            </ClayBadge>
            <h1 className="admin-title">{active} Workspace</h1>
            <p className="admin-subtitle">
              Monitor platform metrics, manage published AI tools, promotional banners, partner websites, user feedback, and supervise accounts.
            </p>
          </div>

          <div className="admin-header-right">
            <DarkModeToggle />
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {active === "Dashboard" && (
          <div className="dashboard-view">
            {/* HERO BANNER CARD */}
            <ClayCard elevated className="dashboard-hero-card">
              <div className="dashboard-hero-content">
                <div>
                  <ClayBadge style={{ marginBottom: "12px" }}>
                    <Activity size={14} />
                    <span>Real-time Operations</span>
                  </ClayBadge>
                  <h2 style={{ fontSize: "26px", fontWeight: "900", margin: "0 0 8px 0" }}>System Overview & Control</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0, maxWidth: "560px" }}>
                    Manage tool catalog additions, update user permissions, inspect promoted website links, and manage ad banners.
                  </p>
                </div>
                <div className="hero-buttons">
                  <ClayButton variant="primary" onClick={() => setActive("Tools")}>
                    <Wrench size={16} />
                    <span>Manage Catalog</span>
                  </ClayButton>
                  <ClayButton onClick={() => setActive("Our Websites")}>
                    <Globe size={16} />
                    <span>Our Websites</span>
                  </ClayButton>
                </div>
              </div>
            </ClayCard>

            {/* LIVE METRIC STATS */}
            <StatsCards />

            {/* ANALYTICS CHART PREVIEW */}
            <ClayCard elevated className="analytics-card" style={{ marginTop: "28px" }}>
              <div className="analytics-header" style={{ marginBottom: "20px" }}>
                <div className="analytics-title-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <BarChart3 size={20} color="var(--accent-primary)" />
                  <h2 style={{ fontSize: "20px", fontWeight: "800", margin: 0 }}>Engagement & Growth Analytics</h2>
                </div>
              </div>
              <div className="chart-wrapper">
                <Charts />
              </div>
            </ClayCard>

            {/* RECENT TOOLS & USERS GRID */}
            <div className="dashboard-bottom-grid">
              <ClayCard elevated className="dashboard-panel-card">
                <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>Recent Tool Additions</h3>
                  <ClayButton size="sm" onClick={() => setActive("Tools")}>View All</ClayButton>
                </div>
                <div className="dashboard-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentTools.map(tool => (
                    <ClayCard recessed key={tool.id} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
                      <img src={tool.image_url || "https://via.placeholder.com/40"} alt="" style={{ width: "40px", height: "40px", borderRadius: "var(--radius-sm)", objectFit: "cover" }} />
                      <div className="item-info">
                        <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "800" }}>{tool.title}</h4>
                        <ClayBadge>{tool.category || "AI Tool"}</ClayBadge>
                      </div>
                    </ClayCard>
                  ))}
                </div>
              </ClayCard>

              <ClayCard elevated className="dashboard-panel-card">
                <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>New Registered Users</h3>
                  <ClayButton size="sm" onClick={() => setActive("Users")}>View All</ClayButton>
                </div>
                <div className="dashboard-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentUsers.map(user => (
                    <ClayCard recessed key={user.id} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
                      <ClayAvatar src={user.avatar_url} name={user.username || "User"} size={38} />
                      <div className="item-info">
                        <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "800" }}>{user.username || "User"}</h4>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.email}</span>
                      </div>
                    </ClayCard>
                  ))}
                </div>
              </ClayCard>
            </div>
          </div>
        )}

        {/* TOOLS TAB */}
        {active === "Tools" && (
          <div className="tools-tab-view">
            <ToolForm onToolAdded={fetchRecentActivity} />
            <ToolsTable />
          </div>
        )}

        {/* BANNERS TAB */}
        {active === "Banners" && (
          <div className="banners-tab-view">
            <BannersManager />
          </div>
        )}

        {/* WEBSITES TAB */}
        {active === "Our Websites" && (
          <div className="websites-tab-view">
            <WebsitesManager />
          </div>
        )}

        {/* FEEDBACK TAB */}
        {active === "Feedback" && (
          <div className="feedback-tab-view">
            <FeedbackManager />
          </div>
        )}

        {/* USERS TAB */}
        {active === "Users" && (
          <div className="users-tab-view">
            <UsersTable />
          </div>
        )}

        {/* ANALYTICS TAB */}
        {active === "Analytics" && (
          <div className="analytics-tab-view">
            <ClayCard elevated style={{ padding: "28px" }}>
              <div className="analytics-header" style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>Platform Trends & Deep Analytics</h2>
              </div>
              <div className="chart-wrapper">
                <Charts />
              </div>
            </ClayCard>
          </div>
        )}
      </div>
    </div>
  );
}