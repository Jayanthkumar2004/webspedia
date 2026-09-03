import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart } from 'lucide-react';

export default function LikeButton({ toolId, initialLikes = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = async () => {
    const newLikes = liked ? likes - 1 : likes + 1;
    setLiked(!liked);
    setLikes(newLikes);

    await supabase
      .from('tools')
      .update({ likes: newLikes })
      .eq('id', toolId);
  };

  return (
    <button
      className={`clay-pill action-pill ${liked ? 'liked' : ''}`}
      onClick={handleLike}
      type="button"
    >
      <Heart size={14} fill={liked ? "#ef4444" : "none"} color={liked ? "#ef4444" : "currentColor"} />
      <span>{likes}</span>
    </button>
  );
}