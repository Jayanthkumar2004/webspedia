import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import EmojiPicker from "emoji-picker-react";
import {
  Send,
  Smile,
  Paperclip,
  ArrowLeft,
  Check,
  CheckCheck,
  FileText
} from "lucide-react";
import Navbar from "../components/Navbar";
import "../styles/chat.css";

export default function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [online, setOnline] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  const bottomRef = useRef();
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const getSafeUser = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      return sessionData?.session?.user || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let presenceChannel;

    const init = async () => {
      const activeUser = await getSafeUser();
      if (!activeUser) {
        navigate('/login');
        return;
      }
      setUser(activeUser);

      const { data: receiverData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setReceiver(receiverData);
      await fetchMessages(activeUser.id);
      await markMessagesAsRead(activeUser.id, userId);

      // 1. REALTIME MESSAGES, READ STATUS & BROADCAST TYPING CHANNEL
      const msgChannelName = `chat-room-${userId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const messageChannel = supabase.channel(msgChannelName);
      channelRef.current = messageChannel;

      messageChannel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages"
          },
          async (payload) => {
            const msg = payload.new || payload.old;
            if (!msg) return;

            const valid =
              (msg.sender_id === activeUser.id && msg.receiver_id === userId) ||
              (msg.sender_id === userId && msg.receiver_id === activeUser.id);

            if (!valid) return;

            await fetchMessages(activeUser.id);

            if (msg.sender_id === userId) {
              await markMessagesAsRead(activeUser.id, userId);
            }
          }
        )
        .on("broadcast", { event: "typing" }, (payload) => {
          if (payload.payload?.senderId === userId) {
            setIsPeerTyping(payload.payload.isTyping);

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (payload.payload.isTyping) {
              typingTimeoutRef.current = setTimeout(() => {
                setIsPeerTyping(false);
              }, 3500);
            }
          }
        })
        .subscribe();

      // 2. SUPABASE REALTIME PRESENCE CHANNEL FOR ONLINE / OFFLINE TRACKING
      const presenceChannelName = `presence-room-${userId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      presenceChannel = supabase.channel(presenceChannelName, {
        config: {
          presence: {
            key: activeUser.id,
          },
        },
      });

      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          try {
            const state = presenceChannel.presenceState();
            const isReceiverOnline = !!state[userId];
            setOnline(isReceiverOnline);
          } catch (e) {
            console.error("Presence sync error:", e);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            try {
              await presenceChannel.track({
                user_id: activeUser.id,
                online_at: new Date().toISOString(),
              });
            } catch (e) {
              console.error("Presence track error:", e);
            }
          }
        });
    };

    init();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (presenceChannel) supabase.removeChannel(presenceChannel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPeerTyping]);

  const fetchMessages = async (currentUserId) => {
    const { data: sentData } = await supabase
      .from("messages")
      .select("*")
      .eq("sender_id", currentUserId)
      .eq("receiver_id", userId);

    const { data: receivedData } = await supabase
      .from("messages")
      .select("*")
      .eq("sender_id", userId)
      .eq("receiver_id", currentUserId);

    const combined = [...(sentData || []), ...(receivedData || [])].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    setMessages(combined);
  };

  const markMessagesAsRead = async (currentUserId, otherUserId) => {
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("sender_id", otherUserId)
        .eq("receiver_id", currentUserId)
        .eq("is_read", false);
    } catch (err) {
      console.log("Read status update error", err);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (channelRef.current && user) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { senderId: user.id, isTyping: val.trim().length > 0 }
      });
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    const currentText = text.trim();
    setText("");
    setShowEmoji(false);

    // Stop broadcast typing state
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { senderId: user.id, isTyping: false }
      });
    }

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: user.id,
        receiver_id: userId,
        content: currentText,
        is_read: false
      }
    ]);

    if (!error) {
      fetchMessages(user.id);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("chat-files")
      .upload(fileName, file);

    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("chat-files").getPublicUrl(fileName);

    await supabase.from("messages").insert([
      {
        sender_id: user.id,
        receiver_id: userId,
        file_url: data.publicUrl,
        content: file.name,
        is_read: false
      }
    ]);

    setUploading(false);
    fetchMessages(user.id);
  };

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="chat-page-main">
        <div className="chat-wrapper clay-card">
          {/* HEADER */}
          <div className="chat-header">
            <div className="chat-header-left">
              <button className="clay-btn back-btn" onClick={() => navigate("/chats")} type="button">
                <ArrowLeft size={16} />
              </button>

              <div className="chat-user-info">
                <div className="chat-user-avatar">
                  {receiver?.avatar_url ? (
                    <img src={receiver.avatar_url} alt="" />
                  ) : (
                    <div className="default-avatar">
                      {(receiver?.username || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`avatar-online-dot ${online ? 'active' : ''}`}></span>
                </div>

                <div className="chat-user-text">
                  <h2>{receiver?.username || "User"}</h2>
                  <p className={isPeerTyping ? "status-typing" : (online ? "status-online" : "status-offline")}>
                    {isPeerTyping ? "typing..." : (online ? "Online" : "Offline")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="chat-body">
            {messages.length === 0 && !isPeerTyping ? (
              <div className="empty-chat-room" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                <p>No message history with {receiver?.username || "this user"} yet. Type a message below to start chatting!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSent = msg.sender_id === user?.id;
                const isRead = !!msg.is_read;

                return (
                  <div
                    key={msg.id}
                    className={`message-row ${isSent ? 'sent-row' : 'received-row'}`}
                  >
                    <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                      {msg.file_url && (
                        <a href={msg.file_url} target="_blank" rel="noreferrer" className="file-link">
                          <FileText size={16} />
                          <span>{msg.content || "Attached File"}</span>
                        </a>
                      )}

                      {!msg.file_url && <p className="message-text">{msg.content}</p>}

                      <div className="message-meta" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{formatTime(msg.created_at)}</span>
                        {isSent && (
                          isRead ? (
                            <CheckCheck size={14} className="seen-icon read" color="#6366f1" title="Seen (Double Tick)" />
                          ) : (
                            <Check size={14} className="seen-icon unread" color="var(--text-muted)" title="Sent (Single Tick)" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* REAL-TIME TYPING BUBBLE */}
            {isPeerTyping && (
              <div className="message-row received-row">
                <div className="message-bubble received typing-indicator-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-text">{receiver?.username || "User"} is typing...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* EMOJI PICKER MODAL */}
          {showEmoji && (
            <div className="emoji-picker-container">
              <EmojiPicker
                onEmojiClick={(e) => setText(prev => prev + e.emoji)}
                theme="auto"
              />
            </div>
          )}

          {/* INPUT BAR */}
          <div className="chat-input-wrapper">
            <button
              className="emoji-btn clay-btn"
              onClick={() => setShowEmoji(prev => !prev)}
              type="button"
            >
              <Smile size={20} />
            </button>

            <label className="file-upload-btn clay-btn">
              <Paperclip size={18} />
              <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            <div className="chat-input-box">
              <input
                className="clay-input"
                placeholder={uploading ? "Uploading file..." : "Type your message..."}
                value={text}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={uploading}
              />
            </div>

            <button className="clay-btn-primary send-btn" onClick={sendMessage} type="button">
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}