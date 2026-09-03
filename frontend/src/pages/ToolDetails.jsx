import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Check, 
  ExternalLink, 
  Heart, 
  Send, 
  MessageSquare, 
  Trash2, 
  CornerDownRight, 
  Star,
  ChevronRight,
  Bookmark
} from 'lucide-react';
import '../styles/tooldetails.css';

export default function ToolDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tool, setTool] = useState(null);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [saved, setSaved] = useState(false);

  const [replyBox, setReplyBox] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [likedComments, setLikedComments] = useState({});
  const [avgRating, setAvgRating] = useState("0.0");
  const [ratingsDistribution, setRatingsDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  useEffect(() => {
    let channel;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;
      setUser(currentUser);

      const { data: toolData } = await supabase
        .from('tools')
        .select('*')
        .eq('id', id)
        .single();

      setTool(toolData);

      if (currentUser) {
        const { data: savedData } = await supabase
          .from("saved_tools")
          .select("id")
          .eq("tool_id", id)
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (savedData) setSaved(true);
      }

      await fetchCommentsAndRatings();

      const channelName = `comments-${id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `tool_id=eq.${id}`
          },
          () => fetchCommentsAndRatings()
        );

      channel.subscribe();
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchCommentsAndRatings = async () => {
    // Fetch review comments
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('tool_id', id)
      .order('created_at', { ascending: false });

    setComments(commentsData || []);

    // Fetch ratings directly from database 'ratings' table
    const { data: ratingsData } = await supabase
      .from('ratings')
      .select('rating')
      .eq('tool_id', id);

    if (ratingsData && ratingsData.length > 0) {
      const sum = ratingsData.reduce((acc, r) => acc + Number(r.rating || 0), 0);
      const avg = (sum / ratingsData.length).toFixed(1);
      setAvgRating(avg);

      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      ratingsData.forEach(r => {
        const val = Math.min(5, Math.max(1, Math.round(Number(r.rating || 5))));
        if (dist[val] !== undefined) dist[val]++;
      });
      setRatingsDistribution(dist);
    } else {
      setAvgRating("0.0");
      setRatingsDistribution({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert("Please login to save tools");
      return;
    }

    const { data: existing } = await supabase
      .from("saved_tools")
      .select("id")
      .eq("tool_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("saved_tools").delete().eq("id", existing.id);
      setSaved(false);
      return;
    }

    const { error } = await supabase
      .from("saved_tools")
      .insert([{ tool_id: id, user_id: user.id }]);

    if (!error) setSaved(true);
  };

  const addComment = async () => {
    if (!user) {
      alert("Please login to post a review");
      return;
    }
    if (!newComment.trim()) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();

    // Insert review comment
    await supabase.from('comments').insert([{
      tool_id: id,
      user_id: user.id,
      username: profile?.username || "User",
      avatar_url: profile?.avatar_url || "",
      content: newComment,
      parent_id: null,
      likes: 0
    }]);

    // Insert star rating into database
    await supabase.from('ratings').insert([{
      tool_id: id,
      user_id: user.id,
      rating: userRating
    }]);

    setNewComment("");
    setUserRating(5);
    fetchCommentsAndRatings();
  };

  const addReply = async (parentId) => {
    if (!user || !replyText.trim()) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();

    const parent = comments.find(c => c.id === parentId);
    const rootId = parent?.parent_id ? parent.parent_id : parentId;

    await supabase.from('comments').insert([{
      tool_id: id,
      user_id: user.id,
      username: profile?.username || "User",
      avatar_url: profile?.avatar_url || "",
      content: replyText,
      parent_id: rootId,
      parent_content: parent?.content || "",
      likes: 0
    }]);

    setReplyText("");
    setReplyBox(null);
    fetchCommentsAndRatings();
  };

  const likeComment = async (cid) => {
    if (likedComments[cid]) return;
    const currentComment = comments.find(c => c.id === cid);
    if (!currentComment) return;

    const newLikes = Number(currentComment.likes || 0) + 1;
    await supabase.from('comments').update({ likes: newLikes }).eq('id', cid);
    setLikedComments(prev => ({ ...prev, [cid]: true }));
    fetchCommentsAndRatings();
  };

  const deleteComment = async (cid, uid) => {
    if (user?.id !== uid) return;
    await supabase.from('comments').delete().eq('id', cid);
    await supabase.from('comments').delete().eq('parent_id', cid);
    fetchCommentsAndRatings();
  };

  const mainComments = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);
  const getReplies = (cid) => replies.filter(r => r.parent_id === cid);
  const initial = (name) => name?.charAt(0)?.toUpperCase() || "U";

  if (!tool) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="loading-state clay-surface" style={{ margin: "60px auto", maxWidth: "600px" }}>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  const totalRatingsCount = Object.values(ratingsDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="page-container">
      <Navbar />

      <main className="tool-details-wrapper">
        {/* BREADCRUMB */}
        <div className="breadcrumb-nav">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <span>{tool.category || "AI Tool"}</span>
          <ChevronRight size={14} />
          <span className="active">{tool.title}</span>
        </div>

        {/* HERO SHOWCASE CARD */}
        <section className="product-hero-card clay-surface">
          <div className="product-hero-left">
            <div className="product-logo-container clay-inset">
              <img src={tool.image_url || "https://via.placeholder.com/120"} alt={tool.title} />
            </div>

            <div className="product-header-info">
              <div className="title-row">
                <h1>{tool.title}</h1>
                <span className="verified-badge-sm" title="Verified Tool">
                  <Check size={10} strokeWidth={3} />
                </span>
              </div>

              <div className="badge-rating-row">
                <span className="clay-badge">{tool.category || "AI Tool"}</span>
                <div className="rating-pill clay-pill">
                  <Star size={13} fill="#facc15" color="#facc15" />
                  <span className="rating-val">{avgRating}</span>
                  <span className="count-val">({mainComments.length} reviews)</span>
                </div>
              </div>

              <div className="hero-action-buttons">
                <a
                  href={tool.tool_url}
                  target="_blank"
                  rel="noreferrer"
                  className="clay-button clay-button-primary visit-action-btn"
                >
                  <span>Visit Official Tool Website</span>
                  <ExternalLink size={15} />
                </a>

                <button
                  className={`clay-button save-action-btn ${saved ? 'active' : ''}`}
                  onClick={handleSave}
                  type="button"
                >
                  <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
                  <span>{saved ? 'Saved' : 'Save Tool'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT DESCRIPTION */}
        <section className="product-description-card clay-surface">
          <h2>About {tool.title}</h2>
          <p className="description-text">{tool.description}</p>
        </section>

        {/* REVIEWS SYSTEM SECTION */}
        <section className="reviews-section">
          <div className="reviews-header">
            <h2>Ratings & Reviews</h2>
          </div>

          {/* RATING BREAKDOWN & WRITE REVIEW GRID */}
          <div className="ratings-overview-grid">
            {/* RATING SUMMARY CARD */}
            <div className="rating-summary-box clay-surface">
              <div className="big-rating-display">
                <span className="score-num">{avgRating}</span>
                <div className="stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      fill={s <= Math.round(Number(avgRating)) ? "#facc15" : "none"}
                      color={s <= Math.round(Number(avgRating)) ? "#facc15" : "var(--text-muted)"}
                    />
                  ))}
                </div>
                <p className="based-label">Based on {mainComments.length} reviews</p>
              </div>

              <div className="breakdown-list">
                {[5, 4, 3, 2, 1].map((starVal) => {
                  const count = ratingsDistribution[starVal] || 0;
                  const percentage = Math.round((count / totalRatingsCount) * 100);
                  return (
                    <div key={starVal} className="breakdown-item">
                      <span className="star-text">{starVal} ★</span>
                      <div className="progress-bg clay-inset">
                        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="count-num">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WRITE A REVIEW CARD */}
            <div className="write-review-box clay-surface">
              <h3>Write a Review</h3>
              
              <div className="star-rating-picker">
                <span>Rating:</span>
                <div className="interactive-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="star-pick-btn"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setUserRating(star)}
                    >
                      <Star
                        size={20}
                        fill={(hoverRating || userRating) >= star ? "#facc15" : "none"}
                        color={(hoverRating || userRating) >= star ? "#facc15" : "var(--text-muted)"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                className="clay-input review-input-area"
                rows="3"
                placeholder="Share your experience with this tool..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />

              <button className="clay-button clay-button-primary post-review-btn" onClick={addComment} type="button">
                <Send size={14} />
                <span>Submit Review</span>
              </button>
            </div>
          </div>

          {/* REVIEWS LIST */}
          <div className="reviews-list">
            {mainComments.length === 0 && (
              <div className="empty-reviews clay-surface">
                <p>No reviews posted yet. Be the first to share your review!</p>
              </div>
            )}

            {mainComments.map(c => (
              <div key={c.id} className="review-card clay-surface">
                <div className="review-card-header">
                  <div className="reviewer-info" onClick={() => {
                    if (!user) {
                      alert("Please login first to chat with members");
                      navigate('/login');
                      return;
                    }
                    navigate(`/chat/${c.user_id}`);
                  }}>
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" className="clay-avatar" />
                    ) : (
                      <div className="clay-avatar">{initial(c.username)}</div>
                    )}
                    <div>
                      <h4>{c.username}</h4>
                      <span className="review-date">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="review-stars-row">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={13} fill="#facc15" color="#facc15" />
                    ))}
                  </div>
                </div>

                <p className="review-content-text">{c.content}</p>

                <div className="review-footer-actions">
                  <button
                    className={`clay-pill action-pill ${likedComments[c.id] ? 'liked' : ''}`}
                    onClick={() => likeComment(c.id)}
                    type="button"
                  >
                    <Heart size={13} fill={likedComments[c.id] ? "#ef4444" : "none"} />
                    <span>{c.likes ?? 0} Likes</span>
                  </button>

                  <button
                    className="clay-pill action-pill"
                    onClick={() => {
                      setReplyBox(c.id);
                      setReplyTo(c);
                    }}
                    type="button"
                  >
                    <CornerDownRight size={13} />
                    <span>Reply</span>
                  </button>

                  {user?.id !== c.user_id && (
                    <button
                      className="clay-pill action-pill"
                      onClick={() => {
                        if (!user) {
                          alert("Please login first to chat with members");
                          navigate('/login');
                          return;
                        }
                        navigate(`/chat/${c.user_id}`);
                      }}
                      type="button"
                    >
                      <MessageSquare size={13} />
                      <span>Chat</span>
                    </button>
                  )}

                  {user?.id === c.user_id && (
                    <button
                      className="clay-pill action-pill delete-pill"
                      onClick={() => deleteComment(c.id, c.user_id)}
                      type="button"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                {/* REPLY INPUT */}
                {replyBox === c.id && (
                  <div className="reply-form-clay">
                    <input
                      className="clay-input reply-field"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${replyTo?.username}...`}
                    />
                    <button className="clay-button clay-button-primary send-reply-btn" onClick={() => addReply(c.id)} type="button">
                      Send Reply
                    </button>
                  </div>
                )}

                {/* NESTED REPLIES */}
                {getReplies(c.id).length > 0 && (
                  <div className="nested-replies-list">
                    {getReplies(c.id).map(r => (
                      <div key={r.id} className="nested-reply-card clay-raised">
                        <div className="reviewer-info">
                          {r.avatar_url ? (
                            <img src={r.avatar_url} alt="" className="clay-avatar avatar-sm" />
                          ) : (
                            <div className="clay-avatar avatar-sm">{initial(r.username)}</div>
                          )}
                          <div>
                            <h5>{r.username}</h5>
                            <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="reply-content-text">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}