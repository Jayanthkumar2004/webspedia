import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ClayCard, ClayBadge } from '../clay';
import { Wrench, Eye, Heart, Users, TrendingUp } from 'lucide-react';
import '../../styles/stats.css';

export default function StatsCards() {
  const [stats, setStats] = useState({
    tools: 0,
    visits: 0,
    likes: 0,
    users: 0
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);

    let toolsCount = 0;
    let visitsCount = 0;
    let likesCount = 0;
    let usersCount = 0;

    const { count: tCount } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });
    toolsCount = tCount || 0;

    const { data: toolsData } = await supabase.from('tools').select('views, likes');
    if (toolsData) {
      visitsCount = toolsData.reduce((acc, item) => acc + Number(item.views || 0), 0);
      likesCount = toolsData.reduce((acc, item) => acc + Number(item.likes || 0), 0);
    }

    const { count: uCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    usersCount = uCount || 0;

    setStats({
      tools: toolsCount,
      visits: visitsCount,
      likes: likesCount,
      users: usersCount
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cardsData = [
    { title: "Total AI Tools", value: stats.tools, icon: <Wrench size={20} color="#ffffff" />, gradient: "linear-gradient(135deg, #7c3aed, #6366f1)" },
    { title: "Platform Visits", value: stats.visits, icon: <Eye size={20} color="#ffffff" />, gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)" },
    { title: "Total Likes", value: stats.likes, icon: <Heart size={20} color="#ffffff" />, gradient: "linear-gradient(135deg, #ec4899, #f43f5e)" },
    { title: "Registered Users", value: stats.users, icon: <Users size={20} color="#ffffff" />, gradient: "linear-gradient(135deg, #10b981, #059669)" }
  ];

  return (
    <div className="stats-cards-grid">
      {cardsData.map((c, i) => (
        <ClayCard elevated key={i} className="stat-clay-card" style={{ padding: '24px' }}>
          <div className="stat-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="stat-icon-frame" style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: c.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              {c.icon}
            </div>

            <ClayBadge style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'none' }}>
              <TrendingUp size={12} />
              <span>Active</span>
            </ClayBadge>
          </div>

          <div className="stat-card-body">
            <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {c.title}
            </h3>
            <p style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
              {loading ? "..." : c.value.toLocaleString()}
            </p>
          </div>
        </ClayCard>
      ))}
    </div>
  );
}