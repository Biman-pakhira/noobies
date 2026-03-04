'use client';
import { BarChart3 } from 'lucide-react';
import { useUserAnalytics, usePlatformAnalytics } from '@/hooks/useAdmin';
export default function AnalyticsPage() {
    const userAnalytics = useUserAnalytics();
    const platformAnalytics = usePlatformAnalytics();
    if (userAnalytics.isLoading || platformAnalytics.isLoading) {
        return (<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-2">Platform statistics and insights</p>
      </div>

      {/* Platform Analytics */}
      {!platformAnalytics.error && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Status */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5"/>
              Video Status Distribution
            </h3>
            <div className="space-y-3">
              {platformAnalytics.data?.videoStatus?.map((item) => (<div key={item.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300">{item.status}</span>
                    <span className="text-white font-semibold">{item._count}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{
                    width: `${(item._count / (platformAnalytics.data?.videoStatus?.reduce((sum, s) => sum + s._count, 0) || 1)) * 100}%`,
                }}></div>
                  </div>
                </div>))}
            </div>
          </div>

          {/* Total Stats */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Total Statistics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Views</p>
                <p className="text-3xl font-bold text-white">
                  {(platformAnalytics.data?.totalViews || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Likes</p>
                <p className="text-3xl font-bold text-white">
                  {(platformAnalytics.data?.totalLikes || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>)}

      {/* Top Uploaders */}
      {!userAnalytics.error && (<div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Uploaders</h3>
          {!userAnalytics.data?.topUploaders || userAnalytics.data.topUploaders.length === 0 ? (<p className="text-gray-400">No uploader data available</p>) : (<div className="space-y-2">
              {userAnalytics.data.topUploaders.slice(0, 10).map((uploader, index) => (<div key={uploader.uploaderId} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-500 w-6 text-center">#{index + 1}</span>
                    <span className="text-white">User {uploader.uploaderId.slice(0, 8)}</span>
                  </div>
                  <span className="text-blue-400 font-semibold">
                    {uploader._count.id} video{uploader._count.id !== 1 ? 's' : ''}
                  </span>
                </div>))}
            </div>)}
        </div>)}

      {/* Errors */}
      {userAnalytics.error && (<div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-200">
          Failed to load user analytics
        </div>)}
      {platformAnalytics.error && (<div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-200">
          Failed to load platform analytics
        </div>)}
    </div>);
}
//# sourceMappingURL=page.js.map