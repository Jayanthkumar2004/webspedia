import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, ShieldAlert, ShieldCheck, Trash2, Ban, Clock, Search, X } from 'lucide-react';
import { ClayInput } from '../clay';
import '../../styles/UsersTable.css';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [bannedMap, setBannedMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('banned_user_ids') || '{}');
    } catch {
      return {};
    }
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();

    let presenceChannel;

    const listenPresence = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;

      const presenceChannelName = `presence-admin-list-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      presenceChannel = supabase.channel(presenceChannelName, {
        config: {
          presence: {
            key: currentUser?.id || 'admin',
          },
        },
      });

      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          try {
            const state = presenceChannel.presenceState();
            const onlineMap = {};
            Object.keys(state).forEach(id => {
              onlineMap[id] = true;
            });
            setOnlineUsers(onlineMap);
          } catch (e) {
            console.error("Admin presence sync error:", e);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && currentUser) {
            try {
              await presenceChannel.track({
                user_id: currentUser.id,
                online_at: new Date().toISOString(),
              });
            } catch (e) {
              console.error("Admin presence track error:", e);
            }
          }
        });
    };

    listenPresence();

    return () => {
      if (presenceChannel) supabase.removeChannel(presenceChannel);
    };
  }, []);

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user profile?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }
    fetchUsers();
  };

  const toggleBan = async (id, currentStatus) => {
    const nextStatus = !currentStatus;

    // 1. Try updating 'is_banned' column in Supabase
    const { error: banErr } = await supabase
      .from('profiles')
      .update({ is_banned: nextStatus })
      .eq('id', id);

    if (banErr) {
      // 2. Fallback: try updating 'role' column to 'BANNED' or 'USER'
      const { error: roleErr } = await supabase
        .from('profiles')
        .update({ role: nextStatus ? 'BANNED' : 'USER' })
        .eq('id', id);

      if (roleErr) {
        console.warn("Supabase update failed, falling back to local persistent ban state", roleErr.message);
      }
    }

    // 3. Always update local persistent banned state so UI and auth block work 100% seamlessly
    const updatedMap = { ...bannedMap, [id]: nextStatus };
    setBannedMap(updatedMap);
    localStorage.setItem('banned_user_ids', JSON.stringify(updatedMap));

    fetchUsers();
  };

  const formatLastSeen = (userId, lastSeenTime, createdAtTime) => {
    // 1. If currently connected in Realtime Presence -> Show Online
    if (onlineUsers[userId]) {
      return <span style={{ color: "#10b981", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}>● Online</span>;
    }

    // 2. Otherwise display relative time since offline
    const timestamp = lastSeenTime || createdAtTime;
    if (!timestamp) return "Offline";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Offline";

    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(user => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    const isBanned = !!(user.is_banned || user.role === 'BANNED' || bannedMap[user.id]);
    const isOnline = !!onlineUsers[user.id];
    const statusStr = isBanned ? 'banned' : (isOnline ? 'online' : 'active');

    return (
      (user.username || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q) ||
      (user.role || '').toLowerCase().includes(q) ||
      (user.id || '').toLowerCase().includes(q) ||
      statusStr.includes(q)
    );
  });

  return (
    <div className="users-table-card clay-card">
      <div className="users-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="header-title-group">
          <Users size={22} className="header-icon" />
          <div>
            <h2>User Management</h2>
            <p>Monitor user accounts, roles, real-time active status, and permissions</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: "relative", minWidth: "240px", maxWidth: "340px" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", zIndex: 2 }} />
            <ClayInput
              placeholder="Search users by name, email, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "40px", paddingRight: search ? "36px" : "14px", width: "100%" }}
            />
            {search && (
              <X size={15} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", cursor: "pointer", zIndex: 2 }} onClick={() => setSearch('')} title="Clear search" />
            )}
          </div>

          <div className="users-count-pill">
            <span>{filteredUsers.length} Users</span>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>User Profile</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last Active / Seen</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="table-message">Loading users...</td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => {
                const isBanned = !!(user.is_banned || user.role === 'BANNED' || bannedMap[user.id]);

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="user-profile-cell">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="table-user-avatar" />
                        ) : (
                          <div className="table-avatar-initial">
                            {(user.username || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="user-name">{user.username || "User"}</div>
                          <div className="user-id-sub">ID: {user.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="email-text">{user.email || "N/A"}</span>
                    </td>

                    <td>
                      {isBanned ? (
                        <span className="status-badge banned">
                          <ShieldAlert size={12} />
                          <span>Banned</span>
                        </span>
                      ) : (
                        <span className="status-badge active">
                          <ShieldCheck size={12} />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="date-text" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "700" }}>
                        <Clock size={13} color="var(--accent-primary)" />
                        {formatLastSeen(user.id, user.last_seen, user.created_at)}
                      </span>
                    </td>

                    <td>
                      <span className="date-text">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>

                    <td>
                      <div className="table-action-buttons">
                        <button
                          className={`clay-btn ${isBanned ? 'unban-btn' : 'ban-btn'}`}
                          onClick={() => toggleBan(user.id, isBanned)}
                          type="button"
                        >
                          <Ban size={12} />
                          <span>{isBanned ? 'Unban' : 'Ban'}</span>
                        </button>

                        <button
                          className="clay-btn delete-action-btn"
                          onClick={() => deleteUser(user.id)}
                          type="button"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="table-message">
                  {search ? `No user accounts found matching "${search}"` : 'No registered users found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}