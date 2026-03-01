export default function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="text-2xl font-bold text-red-500 shrink-0">▶ StreamX</div>
        <input
          type="text"
          placeholder="Search videos..."
          className="flex-1 max-w-xl bg-gray-800 border border-gray-700 rounded-full px-5 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
        />
        <div className="flex gap-2 shrink-0">
          <button className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-full">Login</button>
          <button className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-full font-medium">Sign Up</button>
        </div>
      </div>
    </header>
  );
}
