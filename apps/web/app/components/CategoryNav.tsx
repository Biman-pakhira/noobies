const CATEGORIES = ['All', 'Trending', 'Most Viewed', 'New', 'Music', 'Gaming', 'Sports', 'Education', 'Travel', 'Food', 'Tech'];

export default function CategoryNav() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              i === 0 ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </nav>
  );
}
