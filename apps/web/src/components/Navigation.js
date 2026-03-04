'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
export function Navigation() {
    const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    const handleLogout = () => {
        logout();
        router.push('/');
    };
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };
    return (<nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.5581-2A1.5581 1.5581 0 0116 5.4419V14.5581A1.5581 1.5581 0 0114.4419 16H5.5581A1.5581 1.5581 0 014 14.4419V5.5581A1.5581 1.5581 0 015.5581 4h8.9162z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">
              noobies
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-300 hover:text-white transition">
              Home
            </Link>
            {isAuthenticated && (<Link href="/upload" className="text-gray-300 hover:text-white transition">
                Upload
              </Link>)}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search videos..." className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"/>
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </div>
          </form>

          {/* Auth */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (<div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm hidden sm:inline">{user.username}</span>
                <button onClick={handleLogout} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition text-sm">
                  Logout
                </button>
              </div>) : (<div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-white hover:text-red-500 transition text-sm">
                  Login
                </Link>
                <Link href="/register" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition text-sm">
                  Sign Up
                </Link>
              </div>)}
          </div>
        </div>
      </div>
    </nav>);
}
//# sourceMappingURL=Navigation.js.map