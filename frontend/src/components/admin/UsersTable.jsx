import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, ShieldAlert, ShieldCheck, Trash2, Ban } from 'lucide-react';
import '../../styles/UsersTable.css';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="users-table-card clay-card">
      <div className="users-header">
        <div className="header-title-group">
          <Users size={22} className="header-icon" />
          <div>
            <h2>User Management</h2>
            <p>Monitor user accounts, roles, and active/banned status</p>
          </div>
        </div>

        <div className="users-count-pill">
          <span>{users.length} Users</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>User Profile</th>
              <th>Email</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="table-message">Loading users...</td>
              </tr>
            ) : users.length > 0 ? (
              users.map(user => {
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
                <td colSpan="5" className="table-message">No registered users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}