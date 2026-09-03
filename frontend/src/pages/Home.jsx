import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import ToolCard from '../components/ToolCard';
import BannerSlider from '../components/BannerSlider';
import FeedbackSection from '../components/FeedbackSection';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { Search, ChevronLeft, ChevronRight, Sparkles, Layers, Cpu, Code, PenTool, Flame } from 'lucide-react';
import '../styles/home.css';

export default function Home() {
  const [tools, setTools] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef();

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tools:', error.message);
      } else {
        setTools(data || []);
      }
      setLoading(false);
    };

    fetchTools();
  }, []);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -260, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 260, behavior: 'smooth' });
  };

  const categories = [
    'All',
    'AI Assistant',
    'Code Generation',
    'Copywriting',
    'Design & Image',
    'Video & Audio',
    'Productivity',
    'Marketing',
    'Developer Tools',
  ];

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.title?.toLowerCase().includes(search.toLowerCase()) ||
      tool.description?.toLowerCase().includes(search.toLowerCase()) ||
      tool.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = category === 'All' || tool.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        {/* HERO SECTION WITH CLAYMORPHISM SPLIT DESIGN */}
        <section className="hero-section">
          <div className="hero-split-card clay-card">
            <div className="hero-left-text">
              <div className="hero-badge clay-pill">
                <Sparkles size={14} className="icon-sparkle" />
                <span>Next-Gen AI Directory</span>
              </div>

              <h1 className="hero-title">
                Discover & Benchmark <br />
                <span className="gradient-text">Top AI Tools</span>
              </h1>

              <p className="hero-subtitle">
                Explore curated artificial intelligence software, read community reviews, bookmark your favorites, and boost your workflow.
              </p>

              {/* SEARCH INPUT BAR */}
              <div className="search-container">
                <div className="search-box clay-inset">
                  <Search className="search-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Search AI tools by name, tag, or topic..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="search-btn clay-button-primary" type="button">
                  Explore
                </button>
              </div>

              {/* METRIC PILLS */}
              <div className="hero-stats">
                <div className="stat-pill clay-surface">
                  <Layers size={16} color="var(--accent-primary)" />
                  <span>{tools.length}+ Verified Tools</span>
                </div>
                <div className="stat-pill clay-surface">
                  <Sparkles size={16} color="#10b981" />
                  <span>Community Rated</span>
                </div>
              </div>
            </div>

            {/* HERO RIGHT 3D CARDS VISUAL */}
            <div className="hero-right-visual">
              <div className="floating-clay-card card-1 clay-raised">
                <div className="card-icon-box clay-inset">
                  <Cpu size={22} color="var(--accent-primary)" />
                </div>
                <div>
                  <div className="card-title">ChatGPT</div>
                  <div className="card-sub">AI Assistant</div>
                </div>
                <span className="star-rating">★ 4.9</span>
              </div>

              <div className="floating-clay-card card-2 clay-raised">
                <div className="card-icon-box clay-inset">
                  <Code size={22} color="#10b981" />
                </div>
                <div>
                  <div className="card-title">GitHub Copilot</div>
                  <div className="card-sub">Code Generation</div>
                </div>
                <span className="star-rating">★ 4.8</span>
              </div>

              <div className="floating-clay-card card-3 clay-raised">
                <div className="card-icon-box clay-inset">
                  <PenTool size={22} color="#f59e0b" />
                </div>
                <div>
                  <div className="card-title">Jasper AI</div>
                  <div className="card-sub">Copywriting</div>
                </div>
                <span className="star-rating">★ 4.7</span>
              </div>
            </div>
          </div>
        </section>

        {/* PROMOTIONAL AD BANNER SLIDER (EDITABLE VIA ADMIN CRUD) */}
        <BannerSlider />

        {/* CATEGORIES NAVIGATION */}
        <section className="category-section">
          <div className="category-wrapper">
            <button className="arrow-btn clay-button" onClick={scrollLeft} aria-label="Scroll Left" type="button">
              <ChevronLeft size={18} />
            </button>

            <div className="categories-scroll" ref={scrollRef}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-pill clay-pill ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>

            <button className="arrow-btn clay-button" onClick={scrollRight} aria-label="Scroll Right" type="button">
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* MAIN TOOL GRID */}
        <section className="tools-section">
          <div className="section-header">
            <div className="section-title-group">
              <Flame size={22} className="section-icon" color="var(--accent-primary)" />
              <h2>Explore AI Tools Catalog</h2>
            </div>
            <span className="clay-pill count-badge">{filteredTools.length} Tools</span>
          </div>

          <div className="tools-grid">
            {loading ? (
              <div className="loading-state clay-surface">
                <p>Loading AI tools catalog...</p>
              </div>
            ) : filteredTools.length > 0 ? (
              filteredTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))
            ) : (
              <div className="empty-state clay-surface">
                <p>No matching tools found. Try adjusting your search query or category filter.</p>
              </div>
            )}
          </div>
        </section>

        {/* USER FEEDBACK SECTION */}
        <FeedbackSection />
      </main>

      <Footer />
    </div>
  );
}