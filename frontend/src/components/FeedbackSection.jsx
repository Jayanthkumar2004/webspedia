import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Send, CheckCircle2, MessageSquareHeart } from 'lucide-react';
import '../styles/feedback.css';

export default function FeedbackSection() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('General');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || '');
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', currentUser.id)
          .single();
          
        if (profile?.username) {
          setName(profile.username);
        }
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please enter your feedback message");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('feedback').insert([
        {
          user_id: user?.id || null,
          username: name.trim() || 'Anonymous',
          user_email: email.trim() || 'N/A',
          rating: rating,
          category: category,
          message: message.trim(),
          status: 'pending'
        }
      ]);

      if (error) {
        // Fallback: If feedback table has RLS or schema issues, store fallback
        console.warn("Feedback insert error:", error.message);
        alert("Submission note: " + error.message);
      } else {
        setSubmitted(true);
        setMessage('');
      }
    } catch (err) {
      alert("Submission error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <section className="feedback-section">
      <div className="feedback-card clay-card">
        <div className="feedback-header">
          <div className="feedback-badge-clay">
            <MessageSquareHeart size={24} color="#ffffff" />
          </div>
          <h2>We Value Your Feedback</h2>
          <p>Help us improve Webspedia! Share your thoughts, report bugs, or suggest new features.</p>
        </div>

        {submitted ? (
          <div className="feedback-success-box clay-raised">
            <CheckCircle2 size={48} color="var(--color-success)" />
            <h3>Thank You for Your Feedback!</h3>
            <p>Your response has been recorded and submitted directly to our platform admin team.</p>
            <button
              className="clay-btn submit-another-btn"
              onClick={() => setSubmitted(false)}
              type="button"
            >
              Submit Another Response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            {/* RATING PICKER */}
            <div className="form-group rating-picker-group">
              <label>How would you rate your experience?</label>
              <div className="interactive-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-btn"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      size={26}
                      fill={(hoverRating || rating) >= star ? "#facc15" : "none"}
                      color={(hoverRating || rating) >= star ? "#facc15" : "var(--text-muted)"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* CATEGORY & USER INFO ROW */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Feedback Category</label>
                <select
                  className="clay-input category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="General">General Feedback</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label>Your Name (Optional)</label>
                <input
                  type="text"
                  className="clay-input"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <label>Email Address</label>
                <input
                  type="email"
                  className="clay-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* MESSAGE TEXTAREA */}
            <div className="form-group">
              <label>Your Message / Feedback</label>
              <textarea
                className="clay-input feedback-textarea"
                rows="4"
                placeholder="Tell us what you love, or what we can do better..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="clay-btn-primary submit-feedback-btn"
              disabled={loading}
            >
              <Send size={16} />
              <span>{loading ? 'Submitting...' : 'Send Feedback'}</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
