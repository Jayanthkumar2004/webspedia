import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Sparkles, ChevronDown, ArrowRight, Flame } from 'lucide-react';
import { DEFAULT_TOOL_ICON, handleImageError } from '../utils/placeholder';
import '../styles/searchbar.css';

export default function SearchBar({
  search = '',
  setSearch,
  category = 'All',
  setCategory,
  categories = [],
  tools = [],
  onSearchSubmit,
  showTrending = true
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Global Keyboard Shortcut listener: Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (setSearch) setSearch(val);
    setIsOpen(true);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (search && search.trim()) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(e);
    }
  };

  const handleSelectTool = (toolId) => {
    setIsOpen(false);
    navigate(`/tool/${toolId}`);
  };

  const handleTrendingClick = (tag) => {
    if (setSearch) setSearch(tag);
    if (setCategory) setCategory('All');
    if (onSearchSubmit) {
      setTimeout(() => onSearchSubmit({ preventDefault: () => {} }), 50);
    }
  };

  // Filter matching tools for live suggestions dropdown (up to 5 matches)
  const query = (search || '').toLowerCase().trim();
  const suggestions = query && tools && tools.length > 0
    ? tools.filter(t => {
        const titleMatch = (t.title || '').toLowerCase().includes(query);
        const catMatch = (t.category || '').toLowerCase().includes(query);
        const descMatch = (t.description || '').toLowerCase().includes(query);
        const tagMatch = Array.isArray(t.tags) ? t.tags.join(' ').toLowerCase().includes(query) : false;
        return titleMatch || catMatch || descMatch || tagMatch;
      }).slice(0, 5)
    : [];

  const trendingTags = ['ChatGPT', 'Midjourney', 'GitHub Copilot', 'Claude', 'Jasper'];

  return (
    <div className="search-bar-root" ref={wrapperRef}>
      <form
        className={`search-container-clay ${isFocused ? 'is-focused' : ''}`}
        onSubmit={handleSubmit}
      >
        {/* INLINE CATEGORY SELECTOR DROPDOWN */}
        {setCategory && categories && categories.length > 1 && (
          <div className="search-category-select-wrapper">
            <select
              className="search-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="category-select-arrow" />
          </div>
        )}

        {/* INPUT FIELD WRAPPER */}
        <div className="search-input-inner">
          <Search className="search-icon-clay" size={18} />
          <input
            ref={inputRef}
            type="text"
            className="search-input-field"
            placeholder="Search AI tools by title, category, feature..."
            value={search}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* CLEAR BUTTON */}
          {search ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                if (setSearch) setSearch('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              title="Clear search query"
            >
              <X size={15} />
            </button>
          ) : (
            /* KEYBOARD SHORTCUT BADGE */
            <div className="search-shortcut-badge" title="Press Ctrl+K or / to search">
              <span>⌘K</span>
            </div>
          )}
        </div>

        {/* EXPLORE SUBMIT BUTTON */}
        <button className="search-submit-btn clay-button-primary" type="submit">
          <span>Explore</span>
        </button>
      </form>

      {/* LIVE AUTO-SUGGESTIONS DROPDOWN */}
      {isOpen && search.trim().length > 0 && (
        <div className="search-suggestions-dropdown clay-card-floating">
          <div className="suggestions-header">
            <span>Matching AI Tools</span>
            <span className="suggestions-count">{suggestions.length} results</span>
          </div>

          {suggestions.length > 0 ? (
            <div className="suggestions-list">
              {suggestions.map((tool) => (
                <div
                  key={tool.id}
                  className="suggestion-item"
                  onClick={() => handleSelectTool(tool.id)}
                >
                  <img
                    src={tool.image_url || DEFAULT_TOOL_ICON}
                    alt={tool.title || 'AI Tool'}
                    onError={(e) => handleImageError(e, DEFAULT_TOOL_ICON)}
                    className="suggestion-icon"
                  />
                  <div className="suggestion-info">
                    <div className="suggestion-title-row">
                      <span className="suggestion-title">{tool.title}</span>
                      {tool.category && (
                        <span className="suggestion-category-badge">{tool.category}</span>
                      )}
                    </div>
                    <p className="suggestion-desc">
                      {tool.description ? tool.description.slice(0, 75) + '...' : 'AI Tool'}
                    </p>
                  </div>
                  <ArrowRight size={16} className="suggestion-arrow" />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-suggestions">
              <Sparkles size={20} color="var(--text-muted)" />
              <p>No tools matching "<strong>{search}</strong>" found</p>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Try searching by category or general keyword</span>
            </div>
          )}
        </div>
      )}

      {/* TRENDING QUICK SEARCH TAGS */}
      {showTrending && (
        <div className="search-trending-tags">
          <span className="trending-label">
            <Flame size={13} color="#ef4444" />
            <span>Popular:</span>
          </span>
          <div className="trending-chips">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="trending-chip-clay"
                onClick={() => handleTrendingClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}