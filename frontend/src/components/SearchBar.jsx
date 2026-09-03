import { Search, X } from 'lucide-react';

export default function SearchBar({ search, setSearch }) {
  return (
    <div className="search-input-wrapper">
      <Search className="search-icon" size={18} />
      <input
        type="text"
        className="clay-input search-input"
        placeholder="Search AI tools, categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {search && (
        <button
          type="button"
          className="clay-button clear-btn"
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', padding: '6px', borderRadius: '50%' }}
          onClick={() => setSearch('')}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}