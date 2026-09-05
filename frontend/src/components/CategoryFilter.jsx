export default function CategoryFilter({ category, setCategory, customCategories }) {
  const defaultCategories = ['All', 'Writing', 'Design', 'Coding', 'Marketing', 'Productivity', 'Video', 'Audio'];
  const categories = customCategories && customCategories.length > 0 ? customCategories : defaultCategories;

  return (
    <div className="categories-scroll">
      {categories.map(cat => {
        const isActive = (category || 'All').trim().toLowerCase() === (cat || '').trim().toLowerCase();

        return (
          <button
            key={cat}
            className={`category-pill clay-pill ${isActive ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
            type="button"
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}