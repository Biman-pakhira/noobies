'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
export default function AdminLayout({ children }) {
    const router = useRouter();
    const { user, isLoading } = useAuthStore();
    if (isLoading) {
        return (<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>);
    }
    // Check if user is admin or moderator
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
        router.push('/');
        return null;
    }
    return (<div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader user={user}/>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-800">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>);
}
//# sourceMappingURL=layout.js.map