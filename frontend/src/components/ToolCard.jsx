import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { 
  Star, 
  Bookmark, 
  ArrowRight,
  Sparkles,
  Share,
  Share2,
  Copy,
  Check,
  MessageCircle,
  X
} from 'lucide-react';
import { trackToolClick } from '../lib/analyticsTracker';
import { DEFAULT_TOOL_ICON, handleImageError } from '../utils/placeholder';
import '../styles/toolcard.css';

export default function ToolCard({ tool }) {
  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);
  const [avgRating, setAvgRating] = useState("0.0");
  const [reviewsCount, setReviewsCount] = useState(0);

  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;

      if (currentUser) {
        const { data: savedData } = await supabase
          .from("saved_tools")
          .select("id")
          .eq("tool_id", tool.id)
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (savedData) setSaved(true);
      }

      // Fetch review comments count from database
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('tool_id', tool.id);

      const mainComments = (commentsData || []).filter(c => !c.parent_id);
      setReviewsCount(mainComments.length);

      // Fetch star ratings directly from database 'ratings' table
      const { data: ratingData } = await supabase
        .from('ratings')
        .select('*')
        .eq('tool_id', tool.id);

      const userRatingsMap = {};
      if (ratingData && ratingData.length > 0) {
        ratingData.forEach(r => {
          if (r.user_id && !userRatingsMap[r.user_id]) {
            userRatingsMap[r.user_id] = Number(r.rating || 5);
          }
        });
      }

      if (mainComments.length > 0) {
        const total = mainComments.reduce((sum, c) => {
          let r = c.rating ? Number(c.rating) : (c.user_id && userRatingsMap[c.user_id] ? userRatingsMap[c.user_id] : 5);
          return sum + r;
        }, 0);
        const avg = total / mainComments.length;
        setAvgRating(avg.toFixed(1));
      } else if (ratingData && ratingData.length > 0) {
        const total = ratingData.reduce((sum, r) => sum + Number(r.rating || 0), 0);
        const avg = total / ratingData.length;
        setAvgRating(avg.toFixed(1));
      } else {
        setAvgRating("0.0");
      }
    };

    fetchPreview();
  }, [tool.id]);

  const handleSave = async (e) => {
    e.stopPropagation();
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;

    if (!currentUser) {
      alert("Please login first to save tools");
      return;
    }

    const { data: existing } = await supabase
      .from("saved_tools")
      .select("id")
      .eq("tool_id", tool.id)
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("saved_tools").delete().eq("id", existing.id);
      setSaved(false);
      return;
    }

    const { error } = await supabase
      .from("saved_tools")
      .insert([{ tool_id: tool.id, user_id: currentUser.id }]);

    if (!error) setSaved(true);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/tool/${tool.id}`;
    const shareData = {
      title: tool.title,
      text: tool.description || `Check out ${tool.title} on Webspedia!`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to share modal if share fails or user cancels
      }
    }

    setShowShareModal(true);
  };

  const copyShareLink = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/tool/${tool.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const goToDetails = () => {
    trackToolClick(tool.id);
    navigate(`/tool/${tool.id}`);
  };

  const shortTitle = tool.title?.length > 24
    ? tool.title.slice(0, 24) + "..."
    : tool.title;

  const shortDesc = tool.description?.length > 70
    ? tool.description.slice(0, 70) + "..."
    : tool.description;

  return (
    <div className="tool-card clay-surface" onClick={goToDetails}>
      {/* TOP ROW */}
      <div className="tool-top">
        <div className="tool-logo-box clay-inset">
          <img
            src={tool.image_url || DEFAULT_TOOL_ICON}
            alt={tool.title}
            onError={(e) => handleImageError(e, DEFAULT_TOOL_ICON)}
            className="tool-logo-img"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="tool-share-btn"
            onClick={handleShare}
            title="Share Tool"
            type="button"
          >
            <Share size={13} />
            <span>Share</span>
          </button>

          <button
            className={`tool-bookmark-btn clay-button ${saved ? 'active' : ''}`}
            onClick={handleSave}
            title={saved ? "Saved" : "Save Tool"}
            type="button"
          >
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="tool-content">
        <h2 className="tool-title-text">{shortTitle}</h2>
        <p className="tool-desc-text">{shortDesc}</p>

        <div className="tool-category-badge clay-badge">
          <Sparkles size={11} />
          <span>{tool.category || "AI Tool"}</span>
        </div>

        {/* RATING FETCHED FROM DATABASE */}
        <div className="tool-rating-row">
          <Star size={14} fill="#facc15" color="#facc15" />
          <span className="rating-score">{avgRating}</span>
          <span className="reviews-count">({reviewsCount} reviews)</span>
        </div>

        {/* CTA BUTTON */}
        <button className="clay-button clay-button-primary tool-cta-btn" onClick={goToDetails} type="button">
          <span>View Tool</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* SHARE MODAL OVERLAY */}
      {showShareModal && (
        <div 
          className="edit-modal-overlay" 
          onClick={(e) => { e.stopPropagation(); setShowShareModal(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div 
            className="clay-surface" 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Share2 size={18} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>Share {tool.title}</h3>
              </div>
              <button 
                className="clay-pill" 
                onClick={(e) => { e.stopPropagation(); setShowShareModal(false); }} 
                type="button" 
                style={{ padding: '6px' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                readOnly 
                className="clay-input" 
                value={`${window.location.origin}/tool/${tool.id}`}
                style={{ fontSize: '12px', width: '100%' }}
              />
              <button 
                className={`clay-button ${copied ? 'active' : 'clay-button-primary'}`} 
                onClick={copyShareLink}
                type="button"
                style={{ padding: '10px 14px', flexShrink: 0 }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span style={{ fontSize: '12px' }}>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(`Check out ${tool.title} on Webspedia!\n${window.location.origin}/tool/${tool.id}`)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="clay-button"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '10px', fontSize: '13px' }}
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </a>

              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${tool.title} on Webspedia!`)}&url=${encodeURIComponent(`${window.location.origin}/tool/${tool.id}`)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="clay-button"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '10px', fontSize: '13px' }}
              >
                <Share2 size={15} />
                <span>Twitter / X</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}