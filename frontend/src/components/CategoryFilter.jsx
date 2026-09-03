export default function CategoryFilter({ category, setCategory }) {
  const categories = ['All', 'Writing', 'Design', 'Coding', 'Marketing', 'Productivity', 'Video', 'Audio'];

  return (
    <div className="categories-scroll">
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
  );
}