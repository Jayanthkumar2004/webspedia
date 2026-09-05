import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ClayCard, ClayButton, ClayInput, ClayBadge, ClayAvatar } from "../components/clay";
import { DEFAULT_TOOL_ICON, handleImageError } from "../utils/placeholder";
import { 
  User, 
  Camera, 
  Mail, 
  Calendar, 
  Lock, 
  Bookmark, 
  Check, 
  ArrowRight
} from "lucide-react";
import "../styles/profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [savedTools, setSavedTools] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Auth error:", error.message);
      return null;
    }
    return data?.user;
  };

  const fetchProfile = async () => {
    const currentUser = await getUser();
    if (!currentUser) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();

    if (error) {
      console.error("Fetch profile error:", error.message);
      return;
    }

    setUser(data);
    setUsername(data.username || "");
    setAvatar(data.avatar_url || "");
  };

  const fetchSavedTools = async () => {
    const currentUser = await getUser();
    if (!currentUser) return;

    const { data, error } = await supabase
      .from("saved_tools")
      .select(`
        id,
        tool_id,
        tools (*)
      `)
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Saved tools error:", error.message);
      return;
    }

    const formatted = data?.map(item => item.tools)?.filter(Boolean);
    setSavedTools(formatted || []);
  };

  const updateProfile = async () => {
    const currentUser = await getUser();
    if (!currentUser) {
      alert("User not logged in");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        username,
        avatar_url: avatar,
      })
      .eq("id", currentUser.id)
      .select();

    if (error) {
      alert(error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No profile found to update");
      return;
    }

    alert("Profile updated successfully!");
    fetchProfile();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error.message);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    setAvatar(data.publicUrl);
  };

  useEffect(() => {
    const load = async () => {
      await fetchProfile();
      await fetchSavedTools();
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <ClayCard className="profile-loading-card">
          <p>Loading profile details...</p>
        </ClayCard>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content profile-page-main">
        <ClayCard elevated className="profile-outer-card">
          {/* HEADER */}
          <div className="profile-header">
            <div className="profile-header-icon-clay">
              <User size={24} color="#ffffff" />
            </div>
            <div>
              <h1 className="profile-title">Account Workspace</h1>
              <p className="profile-sub">Manage your profile information and saved tools</p>
            </div>
          </div>

          {/* GRID */}
          <div className="profile-grid">
            {/* LEFT SIDEBAR */}
            <div className="profile-sidebar">
              <div className="avatar-wrapper">
                <ClayAvatar src={avatar} name={username || "User"} size={100} />
                <label className="avatar-upload-btn" title="Upload Photo">
                  <Camera size={18} color="#ffffff" />
                  <input type="file" onChange={handleImageUpload} style={{ display: "none" }} />
                </label>
              </div>

              <div className="profile-name">
                <h2>{username || "User"}</h2>
                <ClayBadge style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}>
                  <span>Verified User</span>
                </ClayBadge>
              </div>

              <div className="profile-details">
                <ClayCard recessed className="profile-detail-card">
                  <Mail size={18} color="var(--accent-primary)" className="detail-icon-svg" />
                  <div className="detail-text-box">
                    <span className="detail-label">Email</span>
                    <p className="detail-val">{user?.email}</p>
                  </div>
                </ClayCard>

                <ClayCard recessed className="profile-detail-card">
                  <User size={18} color="var(--accent-primary)" className="detail-icon-svg" />
                  <div className="detail-text-box">
                    <span className="detail-label">Username</span>
                    <p className="detail-val">{username || "No username"}</p>
                  </div>
                </ClayCard>

                <ClayCard recessed className="profile-detail-card">
                  <Calendar size={18} color="var(--accent-primary)" className="detail-icon-svg" />
                  <div className="detail-text-box">
                    <span className="detail-label">Member Since</span>
                    <p className="detail-val">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "2026"}
                    </p>
                  </div>
                </ClayCard>
              </div>
            </div>

            {/* RIGHT MAIN FORM */}
            <div className="profile-main">
              <div className="section-block">
                <h3>Upload Avatar</h3>
                <p className="section-subtitle">Upload a new picture to update your avatar</p>
                <div className="file-input-wrapper">
                  <input type="file" className="clay-input profile-file" onChange={handleImageUpload} />
                </div>
              </div>

              <div className="section-block">
                <h3>Email Address</h3>
                <p className="section-subtitle">Your registered account email</p>
                <ClayCard recessed className="email-box">
                  <p className="user-email-text">{user?.email}</p>
                  <ClayBadge>
                    <Check size={12} />
                    <span>Verified</span>
                  </ClayBadge>
                </ClayCard>
              </div>

              <div className="section-block">
                <h3>Display Name</h3>
                <p className="section-subtitle">Choose how your name appears to others</p>
                <ClayInput
                  value={username}
                  placeholder="Enter username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <ClayButton variant="primary" onClick={updateProfile} className="update-profile-btn">
                <span>Save Profile Changes</span>
              </ClayButton>

              <p className="secure-text">
                <Lock size={13} /> <span>Your data is secure and encrypted</span>
              </p>
            </div>
          </div>

          {/* SAVED TOOLS PREVIEW */}
          <ClayCard recessed className="saved-tools-box">
            <div className="saved-tools-header">
              <div className="title-group">
                <Bookmark size={18} color="var(--accent-primary)" />
                <h3>Saved Tools ({savedTools.length})</h3>
              </div>
              <ClayButton size="sm" onClick={() => navigate("/saved-tools")}>
                <span>View Library</span>
                <ArrowRight size={14} />
              </ClayButton>
            </div>

            {savedTools.length === 0 ? (
              <p className="empty-text">Your bookmarked tools will appear here for quick access.</p>
            ) : (
              <div className="saved-tools-grid">
                {savedTools.slice(0, 3).map((tool) => (
                  <ClayCard
                    key={tool.id}
                    className="saved-mini-card"
                    onClick={() => navigate(`/tool/${tool.id}`)}
                  >
                    <img
                      src={tool.image_url || DEFAULT_TOOL_ICON}
                      alt={tool.title}
                      onError={(e) => handleImageError(e, DEFAULT_TOOL_ICON)}
                      className="saved-mini-img"
                    />
                    <div>
                      <h4>{tool.title}</h4>
                      <ClayBadge>{tool.category || "AI Tool"}</ClayBadge>
                    </div>
                  </ClayCard>
                ))}
              </div>
            )}
          </ClayCard>
        </ClayCard>
      </main>

      <Footer />
    </div>
  );
}