import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MessageSquare, Search, ArrowRight, Sparkles, Trash2, UserX, X } from 'lucide-react';
import '../styles/Chats.css';

export default function Chats() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState({});

  const getSafeUser = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      return sessionData?.session?.user || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let channel;
    let presenceChannel;

    const init = async () => {
      const user = await getSafeUser();
      setCurrentUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      await loadUsers(user);

      const channelName = `all-chats-${user.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          () => loadUsers(user)
        )
        .subscribe();

      // SUPABASE REALTIME PRESENCE CHANNEL WITH UNIQUE NAME AND EARLY CALLBACK REGISTRATION
      const presenceChannelName = `presence-list-${user.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      presenceChannel = supabase.channel(presenceChannelName, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      // Register presence callback BEFORE calling subscribe()
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
            console.error("Chats presence sync error:", e);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            try {
              await presenceChannel.track({
                user_id: user.id,
                online_at: new Date().toISOString(),
              });
            } catch (e) {
              console.error("Chats presence track error:", e);
            }
          }
        });
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (presenceChannel) supabase.removeChannel(presenceChannel);
    };
  }, []);

  const loadUsers = async (activeUser) => {
    const user = activeUser || (await getSafeUser());
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    let removedContacts = {};
    try {
      removedContacts = JSON.parse(localStorage.getItem('deleted_contacts') || '{}');
    } catch {}

    // Fetch messages where active user is sender or receiver
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    // Collect IDs of users with whom active user has message history
    const lastMessages = {};
    const partnerIds = new Set();

    (messages || []).forEach(msg => {
      const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (otherUserId && otherUserId !== user.id) {
        partnerIds.add(otherUserId);
        if (!lastMessages[otherUserId]) {
          lastMessages[otherUserId] = {
            text: msg.content || (msg.file_url ? 'Attachment' : ''),
            time: msg.created_at
          };
        }
      }
    });

    if (partnerIds.size === 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    // Fetch profiles ONLY for active chat partners
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .in('id', Array.from(partnerIds));

    const formatted = (users || [])
      .filter(profile => {
        const hasMessages = !!lastMessages[profile.id]?.text || !!lastMessages[profile.id]?.time;
        const notRemoved = !removedContacts[profile.id];
        return hasMessages && notRemoved;
      })
      .map(profile => ({
        ...profile,
        lastMessage: lastMessages[profile.id]?.text || "",
        lastTime: lastMessages[profile.id]?.time || ""
      }))
      .sort((a, b) => {
        if (a.lastTime && b.lastTime) {
          return new Date(b.lastTime) - new Date(a.lastTime);
        }
        return a.lastTime ? -1 : 1;
      });

    setProfiles(formatted);
    setLoading(false);
  };

  const deleteChatHistory = async (targetUserId, targetUsername, e) => {
    e.stopPropagation();
    if (!currentUser) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete all messages with ${targetUsername || "this user"}?`);
    if (!confirmDelete) return;

    try {
      await supabase
        .from('messages')
        .delete()
        .eq('sender_id', currentUser.id)
        .eq('receiver_id', targetUserId);

      await supabase
        .from('messages')
        .delete()
        .eq('sender_id', targetUserId)
        .eq('receiver_id', currentUser.id);

      loadUsers(currentUser);
      alert("Chat history deleted.");
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const deleteContactItem = async (targetUserId, targetUsername, e) => {
    e.stopPropagation();
    if (!currentUser) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete ${targetUsername || "this contact"} from your list?`);
    if (!confirmDelete) return;

    try {
      await supabase
        .from('messages')
        .delete()
        .eq('sender_id', currentUser.id)
        .eq('receiver_id', targetUserId);

      await supabase
        .from('messages')
        .delete()
        .eq('sender_id', targetUserId)
        .eq('receiver_id', currentUser.id);

      let removed = {};
      try {
        removed = JSON.parse(localStorage.getItem('deleted_contacts') || '{}');
      } catch {}
      removed[targetUserId] = true;
      localStorage.setItem('deleted_contacts', JSON.stringify(removed));

      loadUsers(currentUser);
      alert(`${targetUsername || "Contact"} deleted.`);
    } catch (err) {
      alert("Delete contact failed: " + err.message);
    }
  };

  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const performUserSearch = async () => {
      setSearching(true);
      try {
        const activeUser = currentUser || (await getSafeUser());
        const activeId = activeUser?.id || '';

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', activeId)
          .or(`username.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(20);

        if (!error && data) {
          setSearchResults(data);
        } else {
          const { data: allProfiles } = await supabase.from('profiles').select('*');
          const matched = (allProfiles || []).filter(p =>
            p.id !== activeId && (
              (p.username || '').toLowerCase().includes(q) ||
              (p.email || '').toLowerCase().includes(q)
            )
          );
          setSearchResults(matched);
        }
      } catch (err) {
        console.error("User search error:", err);
      }
      setSearching(false);
    };

    const timer = setTimeout(() => {
      performUserSearch();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, currentUser]);

  // Combine active conversation profiles and search results when searching
  const isSearching = !!search.trim();

  const displayList = isSearching ? (() => {
    const combined = [];
    const seen = new Set();

    // First add active conversation matches
    profiles.forEach(p => {
      const match = (p.username || '').toLowerCase().includes(search.toLowerCase()) ||
                    (p.email || '').toLowerCase().includes(search.toLowerCase());
      if (match && !seen.has(p.id)) {
        seen.add(p.id);
        combined.push(p);
      }
    });

    // Then add global user search matches from DB
    searchResults.forEach(p => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        combined.push({
          ...p,
          lastMessage: p.email ? `Email: ${p.email}` : "Click to start chatting",
          lastTime: ""
        });
      }
    });

    return combined;
  })() : profiles;

  const formatTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="page-container">
      <Navbar />

      <main className="chats-main-wrapper">
        <div className="chats-container">
          {/* SIDEBAR LIST */}
          <div className="chat-sidebar clay-card">
            <div className="chat-sidebar-top">
              <div className="sidebar-title-row">
                <MessageSquare size={22} className="icon" />
                <h2>Messages ({isSearching ? displayList.length : profiles.length})</h2>
              </div>

              <div className="search-input-wrapper" style={{ position: 'relative' }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="clay-input"
                  placeholder="Search users by username or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '38px', paddingRight: search ? '32px' : '14px', width: '100%' }}
                />
                {search && (
                  <X
                    size={14}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 2 }}
                    onClick={() => setSearch('')}
                    title="Clear search"
                  />
                )}
              </div>
            </div>

            <div className="chat-users-list">
              {(loading || searching) && (
                <div className="empty-chat">
                  <p>{searching ? `Searching users for "${search}"...` : 'Loading conversations...'}</p>
                </div>
              )}

              {!loading && !searching && displayList.length === 0 && (
                <div className="empty-chat">
                  <p>{isSearching ? `No registered users found matching "${search}".` : 'No active conversations yet. Click "Chat" on a profile or tool review to message someone!'}</p>
                </div>
              )}

              {displayList.map(profile => {
                const isOnline = !!onlineUsers[profile.id];

                return (
                  <div
                    key={profile.id}
                    className="chat-user-card clay-card"
                    onClick={() => navigate(`/chat/${profile.id}`)}
                  >
                    <div className="chat-user-left">
                      <div className="chat-avatar-wrapper">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="avatar" className="chat-avatar" />
                        ) : (
                          <div className="chat-avatar-fallback">
                            {getInitial(profile.username || profile.email)}
                          </div>
                        )}
                        <span className={`online-indicator ${isOnline ? 'active' : 'offline'}`}></span>
                      </div>

                      <div className="chat-user-info">
                        <h3>{profile.username || profile.email?.split('@')[0] || "User"}</h3>
                        <p>{profile.lastMessage || profile.email || "Click to start chatting"}</p>
                      </div>
                    </div>

                    <div className="chat-user-right">
                      <span className="chat-time">{formatTime(profile.lastTime)}</span>
                      <div className="chat-card-actions">
                        {profile.lastTime && (
                          <>
                            <button
                              className="delete-icon-btn"
                              onClick={(e) => deleteChatHistory(profile.id, profile.username, e)}
                              title="Delete Chat History"
                              type="button"
                            >
                              <Trash2 size={14} />
                            </button>

                            <button
                              className="delete-contact-icon-btn"
                              onClick={(e) => deleteContactItem(profile.id, profile.username, e)}
                              title="Delete Contact"
                              type="button"
                            >
                              <UserX size={14} />
                            </button>
                          </>
                        )}

                        <ArrowRight size={14} className="chat-arrow" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAIN WELCOME AREA */}
          <div className="chat-welcome clay-card">
            <div className="chat-welcome-box">
              <div className="chat-big-icon-clay">
                <Sparkles size={36} color="#ffffff" />
              </div>
              <h1>Your Direct Messages</h1>
              <p>Select any active conversation partner from the left sidebar to start chatting in real-time about AI tools, recommendations, and reviews.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}