import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ToolCard from "../components/ToolCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ClayCard, ClayBadge, ClayEmptyState, ClaySkeleton } from "../components/clay";
import { Bookmark, Sparkles } from "lucide-react";
import "../styles/toolcard.css";

export default function SavedTools() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedTools();
  }, []);

  const fetchSavedTools = async () => {
    setLoading(true);

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;

    if (!currentUser) {
      setLoading(false);
      return;
    }

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
      console.log(error.message);
      setLoading(false);
      return;
    }

    const formatted = data?.map(item => item.tools)?.filter(Boolean);
    setTools(formatted || []);
    setLoading(false);
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content" style={{ paddingTop: "32px" }}>
        {/* HERO HEADER CARD */}
        <ClayCard elevated style={{ padding: "40px", marginBottom: "32px" }}>
          <ClayBadge style={{ marginBottom: "16px" }}>
            <Bookmark size={14} />
            <span>Personal Library</span>
          </ClayBadge>

          <h1 className="hero-title" style={{ fontSize: "38px", fontWeight: "900", margin: "0 0 10px 0" }}>
            Your Saved <span className="gradient-text">AI Tools</span>
          </h1>

          <p className="hero-subtitle" style={{ margin: 0, color: "var(--text-secondary)", fontSize: "15px" }}>
            Your personal collection of bookmarked AI tools for quick access and workflow automation.
          </p>
        </ClayCard>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="tools-grid">
            {[1, 2, 3].map((n) => (
              <ClayCard key={n} style={{ height: "260px", padding: "24px" }}>
                <ClaySkeleton height="40px" width="40px" style={{ marginBottom: "16px" }} />
                <ClaySkeleton height="24px" width="60%" style={{ marginBottom: "12px" }} />
                <ClaySkeleton height="16px" width="90%" style={{ marginBottom: "8px" }} />
                <ClaySkeleton height="16px" width="70%" />
              </ClayCard>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && tools.length === 0 && (
          <ClayEmptyState
            icon={Sparkles}
            title="No Saved Tools Yet"
            message="Click the bookmark icon on any tool card in the catalog to save it to your personal library."
          />
        )}

        {/* TOOLS GRID */}
        {!loading && tools.length > 0 && (
          <div className="tools-grid">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}