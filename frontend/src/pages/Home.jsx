import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import ToolCard from '../components/ToolCard';
import BannerSlider from '../components/BannerSlider';
import PromotedWebsites from '../components/PromotedWebsites';
import FeedbackSection from '../components/FeedbackSection';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { Search, ChevronLeft, ChevronRight, Sparkles, Cpu, Code, PenTool, Flame, Layers, X, RotateCcw } from 'lucide-react';
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

  // Default fallback categories
  const defaultCategories = [
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

  // Dynamic category pills generated from existing database tools + defaults
  const categories = ['All'];
  const categoryMap = new Map();

  // First add default categories to preserve nice capitalization
  defaultCategories.slice(1).forEach(c => {
    categoryMap.set(c.toLowerCase(), c);
  });

  // Then add any custom categories dynamically from database tools
  tools.forEach(t => {
    if (t.category && typeof t.category === 'string') {
      const trimmed = t.category.trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && !categoryMap.has(lower)) {
        const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        categoryMap.set(lower, formatted);
      }
    }
  });

  categoryMap.forEach(displayVal => {
    categories.push(displayVal);
  });

  const toolsSectionRef = useRef(null);

  const handleExploreClick = () => {
    if (toolsSectionRef.current) {
      toolsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleExploreClick();
  };

  const clearSearch = () => {
    setSearch('');
  };

  const resetAllFilters = () => {
    setSearch('');
    setCategory('All');
  };

  const filteredTools = tools
    .map(tool => {
      const rawQuery = search.toLowerCase().trim();
      if (!rawQuery) return { tool, score: 1 };

      const words = rawQuery.split(/\s+/).filter(Boolean);
      const title = (tool.title || '').toLowerCase();
      const categoryStr = (tool.category || '').toLowerCase();
      const desc = (tool.description || '').toLowerCase();
      const pricing = (tool.pricing || tool.pricing_type || '').toLowerCase();
      const urlStr = (tool.tool_url || '').toLowerCase();
      const tagsStr = Array.isArray(tool.tags) ? tool.tags.join(' ').toLowerCase() : (tool.tags || '').toLowerCase();

      let score = 0;
      let matchedCount = 0;

      // Exact title match bonus
      if (title === rawQuery) score += 20;

      words.forEach(word => {
        let matched = false;

        if (title.includes(word)) {
          score += title.startsWith(word) ? 10 : 6;
          matched = true;
        }

        if (categoryStr.includes(word)) {
          score += categoryStr === word ? 8 : 4;
          matched = true;
        }

        if (desc.includes(word)) {
          score += 3;
          matched = true;
        }

        if (pricing.includes(word) || tagsStr.includes(word) || urlStr.includes(word)) {
          score += 3;
          matched = true;
        }

        if (matched) matchedCount++;
      });

      if (matchedCount === 0) return null;

      if (matchedCount === words.length) score += 10;

      return { tool, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map(item => item.tool)
    .filter(tool => {
      if (category === 'All') return true;
      if (!tool.category) return false;
      return tool.category.trim().toLowerCase() === category.trim().toLowerCase();
    });

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
            <div className="hero-badge clay-pill">
              <Sparkles size={14} className="icon-sparkle" color="var(--accent-primary)" />
              <span>Next-Gen AI Directory</span>
            </div>

            <h1 className="hero-title">
              Discover & Benchmark <br />
              <span className="gradient-text">Top AI Tools</span>
            </h1>

            <p className="hero-subtitle">
              Explore curated artificial intelligence software, read community reviews, bookmark your favorites, and boost your workflow.
            </p>

            {/* PROFESSIONAL SEARCH CONTAINER */}
            <form className="search-container" onSubmit={handleSearchSubmit}>
              <div className="search-input-wrapper clay-inset">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search AI tools by title, category, feature..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      marginRight: '6px'
                    }}
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button className="search-btn clay-button-primary" type="submit" onClick={handleExploreClick}>
                <span>Explore</span>
              </button>
            </form>

            {/* PROFESSIONAL METRIC STATS ROW */}
            <div className="hero-stats-row">
              <div className="stat-item-clay clay-surface">
                <div className="stat-icon-clay">
                  <Layers size={15} color="var(--accent-primary)" />
                </div>
                <span><strong>{tools.length}+</strong> Verified Tools</span>
              </div>

              <div className="stat-item-clay clay-surface">
                <div className="stat-icon-clay">
                  <Sparkles size={15} color="#10b981" />
                </div>
                <span><strong>Community</strong> Rated</span>
              </div>
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
                  className={`category-pill clay-pill ${category.trim().toLowerCase() === cat.trim().toLowerCase() ? 'active' : ''}`}
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
        <section className="tools-section" ref={toolsSectionRef}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div className="section-title-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Flame size={22} className="section-icon" color="var(--accent-primary)" />
              <h2>Explore AI Tools Catalog</h2>
              {search.trim() && (
                <span className="clay-pill" style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: '700', padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Query: "{search.trim()}"
                  <X size={13} style={{ cursor: 'pointer' }} onClick={clearSearch} title="Clear search" />
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {(search || category !== 'All') && (
                <button className="clay-pill" onClick={resetAllFilters} type="button" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  <RotateCcw size={12} /> Reset Filters
                </button>
              )}
              <span className="clay-pill count-badge">{filteredTools.length} Tools</span>
            </div>
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
              <div className="empty-state clay-surface" style={{ padding: '48px 24px', textAlign: 'center', width: '100%', gridColumn: '1 / -1', borderRadius: '24px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>No matching AI tools found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', maxWidth: '440px', margin: '0 auto 20px' }}>
                  {search ? `No tools matched your search query "${search}". Try checking for typos or resetting your filters.` : 'No tools available in this category.'}
                </p>
                <button
                  className="clay-button-primary"
                  onClick={resetAllFilters}
                  type="button"
                  style={{ padding: '10px 24px', borderRadius: '9999px', fontSize: '14px', fontWeight: '800' }}
                >
                  Reset Search & Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* PROMOTED WEBSITES SECTION (EDITABLE VIA ADMIN CRUD) */}
        <PromotedWebsites />

        {/* USER FEEDBACK SECTION */}
        <FeedbackSection />
      </main>

      <Footer />
    </div>
  );
}