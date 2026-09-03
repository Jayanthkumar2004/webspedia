import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { supabase } from '../../lib/supabase';
import '../../styles/charts.css';

export default function Charts() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('7days');
  const [customDate, setCustomDate] = useState('');

  const [stats, setStats] = useState({
    totalTools: 0,
    totalUsers: 0,
    todayTools: 0,
    todayUsers: 0
  });

  const getDateRange = () => {
    const toUTC = (date) =>
      new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();

    if (filter === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return { from: toUTC(start), to: new Date().toISOString() };
    }

    if (filter === 'yesterday') {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      return { from: toUTC(start), to: toUTC(end) };
    }

    if (filter === 'custom' && customDate) {
      const start = new Date(customDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customDate);
      end.setHours(23, 59, 59, 999);
      return { from: toUTC(start), to: toUTC(end) };
    }

    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { from: toUTC(start), to: new Date().toISOString() };
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    const { from, to } = getDateRange();

    const { data: tools } = await supabase
      .from('tools')
      .select('created_at')
      .gte('created_at', from)
      .lte('created_at', to);

    const { data: users } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', from)
      .lte('created_at', to);

    const { count: totalTools } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const grouped = {};

    tools?.forEach(tool => {
      const dateKey = new Date(tool.created_at).toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = { name: dateKey, tools: 0, users: 0 };
      grouped[dateKey].tools += 1;
    });

    users?.forEach(user => {
      const dateKey = new Date(user.created_at).toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = { name: dateKey, tools: 0, users: 0 };
      grouped[dateKey].users += 1;
    });

    const chartData = Object.values(grouped).sort((a, b) => new Date(a.name) - new Date(b.name));

    const today = new Date().toISOString().split('T')[0];
    const todayTools = tools?.filter(item => item.created_at.startsWith(today)).length || 0;
    const todayUsers = users?.filter(item => item.created_at.startsWith(today)).length || 0;

    setAnalytics(chartData);
    setStats({
      totalTools: totalTools || 0,
      totalUsers: totalUsers || 0,
      todayTools,
      todayUsers
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, [filter, customDate]);

  const totalActivity = useMemo(() => {
    return analytics.reduce((acc, item) => acc + item.tools + item.users, 0);
  }, [analytics]);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h2>Platform Growth Analytics</h2>
          <p>Track tool submissions, registrations, and system engagement</p>
        </div>

        <div className="analytics-filters">
          <button
            className={`clay-pill filter-btn ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
            type="button"
          >
            Today
          </button>

          <button
            className={`clay-pill filter-btn ${filter === 'yesterday' ? 'active' : ''}`}
            onClick={() => setFilter('yesterday')}
            type="button"
          >
            Yesterday
          </button>

          <button
            className={`clay-pill filter-btn ${filter === '7days' ? 'active' : ''}`}
            onClick={() => setFilter('7days')}
            type="button"
          >
            Last 7 Days
          </button>

          <input
            type="date"
            className="clay-input date-picker"
            onChange={(e) => {
              setFilter('custom');
              setCustomDate(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card clay-surface">
          <span className="stats-label">Total Tools</span>
          <h3 className="stats-value">{stats.totalTools}</h3>
        </div>

        <div className="stats-card clay-surface">
          <span className="stats-label">Total Users</span>
          <h3 className="stats-value">{stats.totalUsers}</h3>
        </div>

        <div className="stats-card clay-surface">
          <span className="stats-label">Tools Added Today</span>
          <h3 className="stats-value">{stats.todayTools}</h3>
        </div>

        <div className="stats-card clay-surface">
          <span className="stats-label">Users Joined Today</span>
          <h3 className="stats-value">{stats.todayUsers}</h3>
        </div>
      </div>

      {loading ? (
        <div className="loading-box clay-surface">
          <p>Loading analytics...</p>
        </div>
      ) : analytics.length === 0 ? (
        <div className="empty-box clay-surface">
          <h3>No Analytics Data</h3>
          <p>No activity found for the selected time range.</p>
        </div>
      ) : (
        <div className="charts-flex-grid">
          <div className="chart-card clay-surface">
            <div className="chart-header">
              <div>
                <h3>Growth Overview</h3>
                <p>Trend of user registrations and tool additions</p>
              </div>
              <span className="clay-badge">{totalActivity} Total Events</span>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="toolsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--clay-border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="tools" stroke="#6366f1" fill="url(#toolsGradient)" strokeWidth={3} />
                <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="url(#usersGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card clay-surface">
            <div className="chart-header">
              <div>
                <h3>Daily Activity Comparison</h3>
                <p>Comparison between submitted tools and newly joined users</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--clay-border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="tools" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="users" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}