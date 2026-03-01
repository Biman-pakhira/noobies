'use client'
import { useState } from 'react'

const CATEGORIES = ['All', 'Trending', 'Most Viewed', 'New', 'Music', 'Gaming', 'Sports', 'Education', 'Travel', 'Food', 'Tech']

export default function CategoryNav() {
  const [active, setActive] = useState('All')

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`shrink-0 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors ${
              active === cat
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </nav>
  )
}
