import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import ToolCard from '../components/ToolCard';
import BannerSlider from '../components/BannerSlider';
import FeedbackSection from '../components/FeedbackSection';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { Search, ChevronLeft, ChevronRight, Sparkles, Cpu, Code, PenTool, Image as ImageIcon, Flame } from 'lucide-react';
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

  const categories = [
    'All',
    'Writing',
    'Design',
    'Coding',
    'Marketing',
    'Productivity',
    'Video',
    'Audio',
    'Research',
    'Education',
    'Business'
  ];

  const filteredTools = tools
    .map(tool => {
      const query = search.toLowerCase().trim();
      if (!query) return { tool, score: 1 };

      let score = 0;
      if (tool.title?.toLowerCase().includes(query)) score += 3;
      if (tool.category?.toLowerCase().includes(query)) score += 2;
      if (tool.description?.toLowerCase().includes(query)) score += 1;

      return score > 0 ? { tool, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map(item => item.tool)
    .filter(tool => category === 'All' || tool.category === category);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        {/* SPLIT HERO SECTION WITH 3D CLAY VISUAL */}
        <section className="hero-split-card clay-surface">
          <div className="hero-left-content">
            <div className="hero-badge clay-badge">
              <Sparkles size={14} />
              <span>Modern AI Discovery Platform</span>
            </div>

            <h1 className="hero-title">
              Discover the right <br />
              <span className="gradient-text">AI tools</span> for your workflow.
            </h1>

            <p className="hero-subtitle">
              Find, compare, and integrate top-rated AI tools for writing, coding, design, research, and automation.
            </p>

            {/* SEARCH BAR */}
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={18} />
                <input
                  className="clay-input search-input"
                  placeholder="Search AI tools, categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="clay-button clay-button-primary search-btn" type="button">
                <span>Search</span>
              </button>
            </div>

            {/* POPULAR CATEGORIES TAGS */}
            <div className="popular-tags-row">
              <span className="popular-label">Popular:</span>
              <button className="tag-pill clay-pill" onClick={() => setCategory('Writing')} type="button">
                <PenTool size={12} />
                <span>Writing</span>
              </button>
              <button className="tag-pill clay-pill" onClick={() => setCategory('Design')} type="button">
                <ImageIcon size={12} />
                <span>Design</span>
              </button>
              <button className="tag-pill clay-pill" onClick={() => setCategory('Coding')} type="button">
                <Code size={12} />
                <span>Coding</span>
              </button>
            </div>
          </div>

          {/* RIGHT 3D CLAY VISUAL COMPOSITION */}
          <div className="hero-right-visual">
            <div className="clay-visual-container">
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