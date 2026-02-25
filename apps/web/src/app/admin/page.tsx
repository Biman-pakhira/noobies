'use client';

import { useEffect, useState } from 'react';
import { Users, Video, Flag, TrendingUp } from 'lucide-react';
import DashboardCard from '@/components/admin/DashboardCard';
import RecentVideos from '@/components/admin/RecentVideos';
import RecentReports from '@/components/admin/RecentReports';
import { useAdminDashboard } from '@/hooks/useAdmin';

export default function AdminDashboard() {
  const { stats, recentVideos, recentReports, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-200">
        Failed to load dashboard data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <DashboardCard
          title="Total Videos"
          value={stats?.totalVideos || 0}
          icon={<Video className="w-6 h-6" />}
          color="green"
        />
        <DashboardCard
          title="Open Reports"
          value={stats?.totalReports || 0}
          icon={<Flag className="w-6 h-6" />}
          color="red"
        />
        <DashboardCard
          title="Active (24h)"
          value={stats?.active24h || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Processing Status */}
      {stats?.pendingVideos > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <p className="text-yellow-200">
            ⚠️ {stats.pendingVideos} video(s) currently processing...
          </p>
        </div>
      )}

      {/* Recent Content & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentVideos videos={recentVideos} />
        <RecentReports reports={recentReports} />
      </div>
    </div>
  );
}
