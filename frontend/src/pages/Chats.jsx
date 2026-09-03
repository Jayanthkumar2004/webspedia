import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MessageSquare, Search, ArrowRight, Sparkles } from 'lucide-react';
import '../styles/Chats.css';

export default function Chats() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    let channel;
    let presenceChannel;

    const init = async () => {
      await loadUsers();

      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;

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
          () => loadUsers()
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

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    setCurrentUser(user);
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        file_url,
        created_at
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    const userIds = [
      ...new Set(
        messages
          ?.flatMap(msg => [msg.sender_id, msg.receiver_id])
          .filter(id => id !== user.id)
      )
    ];

    if (userIds.length === 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    const lastMessages = {};
    messages.forEach(msg => {
      const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!lastMessages[otherUserId]) {
        lastMessages[otherUserId] = {
          text: msg.content || (msg.file_url ? 'Attachment' : ''),
          time: msg.created_at
        };
      }
    });

    const formatted = users?.map(profile => ({
      ...profile,
      lastMessage: lastMessages[profile.id]?.text || "",
      lastTime: lastMessages[profile.id]?.time || ""
    }))?.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

    setProfiles(formatted || []);
    setLoading(false);
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.username?.toLowerCase().includes(search.toLowerCase())
  );

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
                <h2>Messages</h2>
              </div>

              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="clay-input"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="chat-users-list">
              {loading && (
                <div className="empty-chat">
                  <p>Loading conversations...</p>
                </div>
              )}

              {!loading && filteredProfiles.length === 0 && (
                <div className="empty-chat">
                  <p>No messages yet. Visit a user's review on a tool page to start chatting!</p>
                </div>
              )}

              {filteredProfiles.map(profile => {
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
                            {getInitial(profile.username)}
                          </div>
                        )}
                        <span className={`online-indicator ${isOnline ? 'active' : 'offline'}`}></span>
                      </div>

                      <div className="chat-user-info">
                        <h3>{profile.username || "User"}</h3>
                        <p>{profile.lastMessage ? profile.lastMessage.slice(0, 30) + "..." : "Start chatting..."}</p>
                      </div>
                    </div>

                    <div className="chat-user-right">
                      <span className="chat-time">{formatTime(profile.lastTime)}</span>
                      <ArrowRight size={14} className="chat-arrow" />
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
              <p>Select a user from the conversations list to chat in real-time about tools, tips, and recommendations.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}