import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ClayCard, ClayButton, ClayInput, ClayBadge, ClayAvatar } from "../components/clay";
import { 
  User, 
  Camera, 
  Mail, 
  Calendar, 
  ShieldCheck, 
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
        <ClayCard style={{ margin: "40px auto", maxWidth: "600px", padding: "40px", textAlign: "center" }}>
          <p>Loading profile details...</p>
        </ClayCard>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content" style={{ paddingTop: "32px" }}>
        <ClayCard elevated style={{ padding: "32px", marginBottom: "32px" }}>
          {/* HEADER */}
          <div className="profile-header" style={{ marginBottom: "28px" }}>
            <div className="profile-header-icon-clay">
              <User size={24} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "900", margin: 0 }}>Account Workspace</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "2px 0 0 0" }}>Manage your profile information and saved tools</p>
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

              <div className="profile-name" style={{ textAlign: "center", marginTop: "14px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 6px 0" }}>{username || "User"}</h2>
                <ClayBadge style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}>
                  <span>Verified User</span>
                </ClayBadge>
              </div>

              <div className="profile-details" style={{ marginTop: "20px" }}>
                <ClayCard recessed style={{ padding: "14px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <Mail size={18} color="var(--accent-primary)" />
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Email</span>
                    <p style={{ fontSize: "13px", fontWeight: "700", margin: 0 }}>{user?.email}</p>
                  </div>
                </ClayCard>

                <ClayCard recessed style={{ padding: "14px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <User size={18} color="var(--accent-primary)" />
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Username</span>
                    <p style={{ fontSize: "13px", fontWeight: "700", margin: 0 }}>{username || "No username"}</p>
                  </div>
                </ClayCard>

                <ClayCard recessed style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <Calendar size={18} color="var(--accent-primary)" />
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Member Since</span>
                    <p style={{ fontSize: "13px", fontWeight: "700", margin: 0 }}>
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "2026"}
                    </p>
                  </div>
                </ClayCard>
              </div>
            </div>

            {/* RIGHT MAIN FORM */}
            <div className="profile-main">
              <div className="section-block">
                <h3 style={{ fontSize: "16px", fontWeight: "800" }}>Upload Avatar</h3>
                <p className="section-subtitle">Upload a new picture to update your avatar</p>
                <div className="file-input-wrapper">
                  <input type="file" className="clay-input profile-file" onChange={handleImageUpload} />
                </div>
              </div>

              <div className="section-block">
                <h3 style={{ fontSize: "16px", fontWeight: "800" }}>Email Address</h3>
                <p className="section-subtitle">Your registered account email</p>
                <ClayCard recessed style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ margin: 0, fontWeight: "700" }}>{user?.email}</p>
                  <ClayBadge>
                    <Check size={12} />
                    <span>Verified</span>
                  </ClayBadge>
                </ClayCard>
              </div>

              <div className="section-block">
                <h3 style={{ fontSize: "16px", fontWeight: "800" }}>Display Name</h3>
                <p className="section-subtitle">Choose how your name appears to others</p>
                <ClayInput
                  value={username}
                  placeholder="Enter username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <ClayButton variant="primary" onClick={updateProfile} style={{ width: "100%", marginTop: "10px" }}>
                <span>Save Profile Changes</span>
              </ClayButton>

              <p className="secure-text" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", marginTop: "12px" }}>
                <Lock size={13} /> Your data is secure and encrypted
              </p>
            </div>
          </div>

          {/* SAVED TOOLS PREVIEW */}
          <ClayCard recessed style={{ padding: "24px", marginTop: "32px" }}>
            <div className="saved-tools-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div className="title-group" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bookmark size={18} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Saved Tools ({savedTools.length})</h3>
              </div>
              <ClayButton size="sm" onClick={() => navigate("/saved-tools")}>
                <span>View Library</span>
                <ArrowRight size={14} />
              </ClayButton>
            </div>

            {savedTools.length === 0 ? (
              <p className="empty-text" style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Your bookmarked tools will appear here for quick access.</p>
            ) : (
              <div className="saved-tools-grid">
                {savedTools.slice(0, 3).map((tool) => (
                  <ClayCard
                    key={tool.id}
                    className="saved-mini-card"
                    style={{ padding: "14px", display: "flex", gap: "12px", cursor: "pointer" }}
                    onClick={() => navigate(`/tool/${tool.id}`)}
                  >
                    <img
                      src={tool.image_url || "https://via.placeholder.com/80"}
                      alt={tool.title}
                      style={{ width: "48px", height: "48px", borderRadius: "var(--radius-sm)", objectFit: "cover" }}
                    />
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "800" }}>{tool.title}</h4>
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