'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetQuery } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface SearchFilters {
  q: string;
  category?: string;
  sort?: string;
  dateRange?: string;
  minDuration?: number;
  maxDuration?: number;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  uploaderUsername: string;
  views: number;
  createdAt: string;
  duration: number;
  score: number;
}

interface SearchResponse {
  items: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({
    q: searchParams.get('q') || '',
    sort: searchParams.get('sort') || 'relevance',
    category: searchParams.get('category') || '',
    dateRange: searchParams.get('dateRange') || '',
  });
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch search results
  useEffect(() => {
    if (!filters.q || filters.q.trim().length === 0) {
      setResults([]);
      return;
    }

    const searchVideos = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: filters.q,
          page: page.toString(),
          pageSize: '20',
          sort: filters.sort || 'relevance',
        });

        if (filters.category) params.append('category', filters.category);
        if (filters.dateRange) params.append('dateRange', filters.dateRange);
        if (filters.minDuration) params.append('minDuration', filters.minDuration.toString());
        if (filters.maxDuration) params.append('maxDuration', filters.maxDuration.toString());

        const response = await apiClient.get<SearchResponse>(`/search?${params.toString()}`);
        setResults(response.data.items);
        setTotal(response.data.total);
      } catch (error: any) {
        if (error.response?.status !== 503) {
          toast.error('Failed to search videos');
        }
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchVideos();
  }, [filters.q, filters.sort, filters.category, filters.dateRange, page]);

  const handleSearch = (newQuery: string) => {
    setFilters((prev) => ({ ...prev, q: newQuery }));
    setPage(1);
    router.push(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Search Bar */}
      <div className="sticky top-16 z-20 bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex gap-4">
          <input
            type="text"
            value={filters.q}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search videos..."
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <span>⚙️</span>
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={filters.sort || 'relevance'}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="relevance">Most Relevant</option>
                <option value="newest">Newest</option>
                <option value="mostViewed">Most Viewed</option>
                <option value="trending">Trending</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <select
                value={filters.dateRange || ''}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Time</option>
                <option value="last_week">Last Week</option>
                <option value="last_month">Last Month</option>
                <option value="last_year">Last Year</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
              <select
                value={
                  filters.minDuration === 0 && filters.maxDuration === 240
                    ? '0-4min'
                    : filters.minDuration === 240 && filters.maxDuration === 1200
                      ? '4-20min'
                      : filters.minDuration === 1200
                        ? '20min+'
                        : ''
                }
                onChange={(e) => {
                  if (e.target.value === '0-4min') {
                    handleFilterChange('minDuration', '0');
                    handleFilterChange('maxDuration', '240');
                  } else if (e.target.value === '4-20min') {
                    handleFilterChange('minDuration', '240');
                    handleFilterChange('maxDuration', '1200');
                  } else if (e.target.value === '20min+') {
                    handleFilterChange('minDuration', '1200');
                    handleFilterChange('maxDuration', '');
                  } else {
                    handleFilterChange('minDuration', '');
                    handleFilterChange('maxDuration', '');
                  }
                }}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Any</option>
                <option value="0-4min">Under 4 minutes</option>
                <option value="4-20min">4 - 20 minutes</option>
                <option value="20min+">Over 20 minutes</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">&nbsp;</label>
              <button
                onClick={() => {
                  setFilters({ q: filters.q, sort: 'relevance' });
                  setPage(1);
                }}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-6xl mx-auto p-4">
        {!filters.q || filters.q.trim().length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Enter a search query to get started</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-gray-700 border-t-red-500 rounded-full"></div>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No videos found for "{filters.q}". Try a different search.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-4">
              Found <span className="text-white font-semibold">{total}</span> results for "
              <span className="text-white font-semibold">{filters.q}</span>"
            </p>

            <div className="space-y-2 mb-8">
              {results.map((video) => (
                <Link
                  key={video.id}
                  href={`/watch/${video.id}`}
                  className="group flex gap-4 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition"
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 relative w-40 h-24 bg-gray-800 rounded overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500">No thumbnail</span>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 px-1 py-0.5 rounded text-xs text-white">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold line-clamp-2 group-hover:text-red-500 transition">
                      {video.title}
                    </h3>

                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{video.description}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{video.uploaderUsername}</span>
                      <span>{formatViews(video.views)} views</span>
                      <span>{formatDate(video.createdAt)}</span>
                      {video.score && (
                        <span className="text-red-500">
                          Relevance: {(video.score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex items-center justify-center gap-4 py-8">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className={clsx(
                    'px-4 py-2 rounded font-medium transition',
                    page === 1
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  )}
                >
                  Previous
                </button>

                <span className="text-gray-400">
                  Page <span className="text-white font-semibold">{page}</span> of{' '}
                  <span className="text-white font-semibold">{Math.ceil(total / 20)}</span>
                </span>

                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  className={clsx(
                    'px-4 py-2 rounded font-medium transition',
                    page >= Math.ceil(total / 20)
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  )}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
