'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { getUser, isLoggedIn, logout } = useAuth()
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setLoggedIn(isLoggedIn())
    const user = getUser()
    if (user) setUsername(user.username)
  }, [])

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-3">
        
        {/* Logo */}
        <Link href="/" className="text-xl md:text-2xl font-bold text-red-500 shrink-0">
          ▶ <span className="hidden sm:inline">StreamX</span>
        </Link>

        {/* Search - desktop */}
        <input
          type="text"
          placeholder="Search videos..."
          className="hidden md:block flex-1 max-w-xl bg-gray-800 border border-gray-700 rounded-full px-5 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
        />

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search icon - mobile */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            🔍
          </button>

          {loggedIn ? (
            <>
              <span className="hidden sm:block text-gray-300 text-sm font-medium">
                👤 {username}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs md:text-sm text-gray-300 hover:text-white border border-gray-700 rounded-full"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 text-xs md:text-sm text-gray-300 hover:text-white border border-gray-700 rounded-full">
                Login
              </Link>
              <Link href="/signup" className="px-3 py-1.5 text-xs md:text-sm bg-red-600 hover:bg-red-700 rounded-full font-medium text-white">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile search bar - expandable */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <input
            type="text"
            placeholder="Search videos..."
            autoFocus
            className="w-full bg-gray-800 border border-gray-700 rounded-full px-5 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
          />
        </div>
      )}
    </header>
  )
}
