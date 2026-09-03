import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { 
  Star, 
  Bookmark, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import '../styles/toolcard.css';

export default function ToolCard({ tool }) {
  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);
  const [avgRating, setAvgRating] = useState("0.0");
  const [reviewsCount, setReviewsCount] = useState(0);

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
        .select('id')
        .eq('tool_id', tool.id);

      setReviewsCount(commentsData?.length || 0);

      // Fetch star ratings directly from database 'ratings' table
      const { data: ratingData } = await supabase
        .from('ratings')
        .select('rating')
        .eq('tool_id', tool.id);

      if (ratingData && ratingData.length > 0) {
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

  const goToDetails = () => {
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
            src={tool.image_url || "https://via.placeholder.com/80"}
            alt={tool.title}
            className="tool-logo-img"
          />
        </div>

        <button
          className={`tool-bookmark-btn clay-button ${saved ? 'active' : ''}`}
          onClick={handleSave}
          title={saved ? "Saved" : "Save Tool"}
          type="button"
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        </button>
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
    </div>
  );
}