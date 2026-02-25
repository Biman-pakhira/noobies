'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';

interface AdminHeaderProps {
  user: any;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="bg-gray-950 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-white">Admin Panel</h2>
        <p className="text-sm text-gray-400">
          Welcome back, {user?.username || 'Admin'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user?.username}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-red-400"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
