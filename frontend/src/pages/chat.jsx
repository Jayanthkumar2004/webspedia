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

  const bottomRef = useRef();

  useEffect(() => {
    let messageChannel;
    let presenceChannel;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;
      setUser(data.user);

      const { data: receiverData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setReceiver(receiverData);
      await fetchMessages(data.user.id);
      await markMessagesAsRead(data.user.id, userId);

      // 1. REALTIME MESSAGES & READ STATUS CHANNEL WITH UNIQUE ID
      const msgChannelName = `chat-msg-${userId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      messageChannel = supabase.channel(msgChannelName);

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
              (msg.sender_id === data.user.id && msg.receiver_id === userId) ||
              (msg.sender_id === userId && msg.receiver_id === data.user.id);

            if (!valid) return;

            await fetchMessages(data.user.id);

            if (msg.sender_id === userId) {
              await markMessagesAsRead(data.user.id, userId);
            }
          }
        )
        .subscribe();

      // 2. SUPABASE REALTIME PRESENCE CHANNEL WITH UNIQUE NAME AND EARLY CALLBACK REGISTRATION
      const presenceChannelName = `presence-room-${userId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      presenceChannel = supabase.channel(presenceChannelName, {
        config: {
          presence: {
            key: data.user.id,
          },
        },
      });

      // Register presence callback BEFORE calling subscribe()
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
                user_id: data.user.id,
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
      if (messageChannel) supabase.removeChannel(messageChannel);
      if (presenceChannel) supabase.removeChannel(presenceChannel);
    };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async (currentUserId) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }
    setMessages(data || []);
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

  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: user.id,
        receiver_id: userId,
        content: text.trim(),
        is_read: false
      }
    ]);

    if (!error) {
      setText("");
      setShowEmoji(false);
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
                  <p className={online ? "status-online" : "status-offline"}>
                    {online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="chat-body">
            {messages.map((msg) => {
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
            })}
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
                onChange={(e) => setText(e.target.value)}
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