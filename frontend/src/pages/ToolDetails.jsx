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
  Pencil,
  CornerDownRight, 
  Star,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Share2,
  Bookmark,
  Filter,
  SlidersHorizontal,
  Search,
  UserCheck
} from 'lucide-react';
import { trackToolClick } from '../lib/analyticsTracker';
import { DEFAULT_TOOL_ICON, handleImageError } from '../utils/placeholder';
import '../styles/tooldetails.css';

const RATING_LABELS = {
  1: "1 - Terrible 😠",
  2: "2 - Poor 🙁",
  3: "3 - Average 🙂",
  4: "4 - Very Good! 👍",
  5: "5 - Outstanding! 🚀"
};

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

  // Edit Review States
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editHoverRating, setEditHoverRating] = useState(0);

  // Filter & Sort States
  const [selectedStarFilter, setSelectedStarFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const [replyBox, setReplyBox] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [likedComments, setLikedComments] = useState({});
  const [avgRating, setAvgRating] = useState("0.0");
  const [ratingsDistribution, setRatingsDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  useEffect(() => {
    let channel;

    const init = async () => {
      if (id) trackToolClick(id);

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

    // Fetch ratings directly from database 'ratings' table
    const { data: ratingsData } = await supabase
      .from('ratings')
      .select('*')
      .eq('tool_id', id)
      .order('created_at', { ascending: false });

    // Build map of user_id -> rating from ratings table
    const userRatingsMap = {};
    if (ratingsData && ratingsData.length > 0) {
      ratingsData.forEach(r => {
        if (r.user_id && !userRatingsMap[r.user_id]) {
          userRatingsMap[r.user_id] = Number(r.rating || 5);
        }
      });
    }

    // Attach rating to each comment object (prioritizing ground truth from ratings table)
    const enrichedComments = (commentsData || []).map((c, idx) => {
      let ratingVal = 0;
      
      // 1. Try finding rating from ratings table by user_id
      if (c.user_id && userRatingsMap[c.user_id] !== undefined) {
        ratingVal = userRatingsMap[c.user_id];
      }
      
      // 2. Try matching by index in ratingsData
      if (!ratingVal && ratingsData && ratingsData[idx]) {
        ratingVal = Number(ratingsData[idx].rating);
      }
      
      // 3. Try finding rating directly on comment object
      if (!ratingVal && c.rating) {
        ratingVal = Number(c.rating);
      }
      
      // 4. Default fallback to 5
      if (!ratingVal) ratingVal = 5;

      return { ...c, rating: ratingVal };
    });

    setComments(enrichedComments);

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
    } else if (enrichedComments.length > 0) {
      const mainComms = enrichedComments.filter(c => !c.parent_id);
      const sum = mainComms.reduce((acc, c) => acc + Number(c.rating || 5), 0);
      const avg = mainComms.length > 0 ? (sum / mainComms.length).toFixed(1) : "0.0";
      setAvgRating(avg);

      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      mainComms.forEach(c => {
        const val = Math.min(5, Math.max(1, Math.round(Number(c.rating || 5))));
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
    try {
      await supabase.from('comments').insert([{
        tool_id: id,
        user_id: user.id,
        username: profile?.username || "User",
        avatar_url: profile?.avatar_url || "",
        content: newComment.trim(),
        parent_id: null,
        likes: 0
      }]);
    } catch (e) {
      console.warn('Comments insert error:', e);
    }

    // Insert or update rating in ratings table
    try {
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id')
        .eq('tool_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingRating) {
        await supabase.from('ratings').update({ rating: userRating }).eq('id', existingRating.id);
      } else {
        await supabase.from('ratings').insert([{
          tool_id: id,
          user_id: user.id,
          rating: userRating
        }]);
      }
    } catch (e) {
      console.warn('Ratings insert error:', e);
    }

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

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content || '');
    setEditRating(Number(comment.rating || 5));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
    setEditRating(5);
  };

  const saveEdit = async (cid, uid) => {
    if (!user || user.id !== uid) return;
    if (!editContent.trim()) return;

    // 1. Update comment content
    try {
      await supabase
        .from('comments')
        .update({
          content: editContent.trim(),
          rating: editRating
        })
        .eq('id', cid);
    } catch (e) {
      await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', cid);
    }

    // 2. Update rating in ratings table
    try {
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id')
        .eq('tool_id', id)
        .eq('user_id', uid)
        .maybeSingle();

      if (existingRating) {
        await supabase
          .from('ratings')
          .update({ rating: editRating })
          .eq('id', existingRating.id);
      } else {
        await supabase
          .from('ratings')
          .insert([{ tool_id: id, user_id: uid, rating: editRating }]);
      }
    } catch (e) {
      console.warn('Ratings update error:', e);
    }

    setEditingId(null);
    setEditContent('');
    fetchCommentsAndRatings();
  };

  const deleteComment = async (cid, uid) => {
    if (user?.id !== uid) return;
    const confirmDel = window.confirm("Are you sure you want to delete your review?");
    if (!confirmDel) return;

    await supabase.from('comments').delete().eq('id', cid);
    await supabase.from('comments').delete().eq('parent_id', cid);

    // Clean up rating entry for this user and tool
    try {
      await supabase.from('ratings').delete().eq('tool_id', id).eq('user_id', uid);
    } catch (e) {
      console.warn('Ratings delete warning:', e);
    }

    fetchCommentsAndRatings();
  };

  const mainComments = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);
  const getReplies = (cid) => replies.filter(r => r.parent_id === cid);
  const initial = (name) => name?.charAt(0)?.toUpperCase() || "U";

  // Filter and Sort main comments
  const filteredComments = mainComments
    .filter(c => {
      if (selectedStarFilter !== 'all' && Number(c.rating || 5) !== Number(selectedStarFilter)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const contentMatch = (c.content || '').toLowerCase().includes(q);
        const userMatch = (c.username || '').toLowerCase().includes(q);
        if (!contentMatch && !userMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'highest') {
        return Number(b.rating || 5) - Number(a.rating || 5);
      }
      if (sortBy === 'lowest') {
        return Number(a.rating || 5) - Number(b.rating || 5);
      }
      if (sortBy === 'likes') {
        return Number(b.likes || 0) - Number(a.likes || 0);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

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
              <img src={tool.image_url || DEFAULT_TOOL_ICON} alt={tool.title} onError={(e) => handleImageError(e, DEFAULT_TOOL_ICON)} />
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
                  const isSelected = selectedStarFilter === starVal.toString();
                  return (
                    <div 
                      key={starVal} 
                      className={`breakdown-item ${isSelected ? 'active-breakdown-filter' : ''}`}
                      onClick={() => setSelectedStarFilter(isSelected ? 'all' : starVal.toString())}
                      title={`Filter by ${starVal} stars`}
                      style={{ cursor: 'pointer' }}
                    >
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
                <span className="rating-hover-label">
                  {RATING_LABELS[hoverRating || userRating]}
                </span>
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

          {/* FILTER & SORT CONTROLS BAR */}
          <div className="review-controls-bar clay-surface">
            <div className="star-filter-pills">
              <button 
                className={`clay-pill filter-pill ${selectedStarFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedStarFilter('all')}
                type="button"
              >
                All Reviews ({mainComments.length})
              </button>
              {[5, 4, 3, 2, 1].map(starVal => (
                <button 
                  key={starVal}
                  className={`clay-pill filter-pill ${selectedStarFilter === starVal.toString() ? 'active' : ''}`}
                  onClick={() => setSelectedStarFilter(starVal.toString())}
                  type="button"
                >
                  ★ {starVal} ({mainComments.filter(c => Number(c.rating || 5) === starVal).length})
                </button>
              ))}
            </div>

            <div className="search-sort-group">
              <div className="review-search-box clay-inset">
                <Search size={14} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search reviews..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="sort-selector-wrapper">
                <SlidersHorizontal size={14} color="var(--text-muted)" />
                <select 
                  className="clay-select-input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                  <option value="likes">Most Helpful / Liked</option>
                </select>
              </div>
            </div>
          </div>

          {/* REVIEWS LIST */}
          <div className="reviews-list">
            {filteredComments.length === 0 && (
              <div className="empty-reviews clay-surface">
                <p>No reviews match your filter criteria.</p>
                {selectedStarFilter !== 'all' || searchQuery.trim() ? (
                  <button 
                    className="clay-button clay-button-primary"
                    onClick={() => { setSelectedStarFilter('all'); setSearchQuery(''); }}
                    style={{ marginTop: '10px', fontSize: '12px' }}
                  >
                    Reset Filters
                  </button>
                ) : null}
              </div>
            )}

            {filteredComments.map(c => {
              const childReplies = getReplies(c.id);
              const isCurrentUser = user?.id === c.user_id;

              return (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4>{c.username}</h4>
                          {isCurrentUser && (
                            <span className="author-badge" title="Your Review">
                              <UserCheck size={10} /> You
                            </span>
                          )}
                        </div>
                        <span className="review-date">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="review-stars-row" title={`Rated ${c.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= Number(c.rating || 5) ? "#facc15" : "none"}
                          color={s <= Number(c.rating || 5) ? "#facc15" : "var(--text-muted)"}
                        />
                      ))}
                    </div>
                  </div>

                  {editingId === c.id ? (
                    <div className="edit-review-clay-box" style={{ marginTop: '12px', padding: '14px', background: 'var(--clay-surface-recessed)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="star-rating-picker" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>Edit Rating:</span>
                        <div className="interactive-stars" style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="star-pick-btn"
                              onMouseEnter={() => setEditHoverRating(star)}
                              onMouseLeave={() => setEditHoverRating(0)}
                              onClick={() => setEditRating(star)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              <Star
                                size={18}
                                fill={(editHoverRating || editRating) >= star ? "#facc15" : "none"}
                                color={(editHoverRating || editRating) >= star ? "#facc15" : "var(--text-muted)"}
                              />
                            </button>
                          ))}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-primary)' }}>
                          {RATING_LABELS[editHoverRating || editRating]}
                        </span>
                      </div>

                      <textarea
                        className="clay-input"
                        rows="3"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Update your review..."
                        style={{ width: '100%', resize: 'vertical' }}
                      />

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="clay-pill" onClick={cancelEditing} type="button">
                          Cancel
                        </button>
                        <button className="clay-button clay-button-primary" onClick={() => saveEdit(c.id, c.user_id)} type="button" style={{ padding: '6px 14px', fontSize: '12px' }}>
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="review-content-text">{c.content}</p>
                  )}

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
                        setReplyBox(replyBox === c.id ? null : c.id);
                        setReplyTo(c);
                      }}
                      type="button"
                    >
                      <CornerDownRight size={13} />
                      <span>Reply {childReplies.length > 0 ? `(${childReplies.length})` : ''}</span>
                    </button>

                    {!isCurrentUser && (
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

                    {isCurrentUser && (
                      <>
                        <button
                          className="clay-pill action-pill"
                          onClick={() => startEditing(c)}
                          type="button"
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          className="clay-pill action-pill delete-pill"
                          onClick={() => deleteComment(c.id, c.user_id)}
                          type="button"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </>
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
                  {childReplies.length > 0 && (
                    <div className="nested-replies-list">
                      {childReplies.map(r => (
                        <div key={r.id} className="nested-reply-card clay-raised">
                          <div className="reviewer-info">
                            {r.avatar_url ? (
                              <img src={r.avatar_url} alt="" className="clay-avatar avatar-sm" />
                            ) : (
                              <div className="clay-avatar avatar-sm">{initial(r.username)}</div>
                            )}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <h5>{r.username}</h5>
                                {user?.id === r.user_id && (
                                  <span className="author-badge" title="Your Reply">
                                    <UserCheck size={9} /> You
                                  </span>
                                )}
                              </div>
                              <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <p className="reply-content-text">{r.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}