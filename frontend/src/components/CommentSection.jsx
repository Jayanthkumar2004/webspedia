import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, MessageSquare } from 'lucide-react';
import '../styles/comments.css';

export default function CommentSection({ toolId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('tool_id', toolId)
      .order('created_at', { ascending: false });

    setComments(data || []);
  };

  useEffect(() => {
    fetchComments();
  }, [toolId]);

  const postComment = async () => {
    if (!text.trim()) return;

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      alert('Please login to post a comment');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    await supabase.from('comments').insert([
      {
        tool_id: toolId,
        user_id: user.id,
        username: profile?.username || 'User',
        avatar_url: profile?.avatar_url || '',
        content: text.trim(),
        likes: 0
      }
    ]);

    setText('');
    fetchComments();
  };

  return (
    <div className="comments-clay-container clay-surface">
      <div className="comments-header">
        <MessageSquare size={18} className="icon" />
        <h3>Discussion ({comments.length})</h3>
      </div>

      <div className="comment-input-box">
        <textarea
          className="clay-input comment-textarea"
          rows="3"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="clay-button clay-button-primary post-btn" onClick={postComment} type="button">
          <Send size={14} />
          <span>Post</span>
        </button>
      </div>

      <div className="comments-list">
        {comments.map(c => (
          <div key={c.id} className="comment-item-card clay-raised">
            <p className="comment-body-text">{c.content || c.text}</p>
            <span className="comment-timestamp">{new Date(c.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}