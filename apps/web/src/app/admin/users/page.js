'use client';
import { Users as UsersIcon } from 'lucide-react';
export default function UsersPage() {
    return (<div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-2">Manage platform users and permissions</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
        <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4"/>
        <h3 className="text-xl font-semibold text-white mb-2">User Management</h3>
        <p className="text-gray-400">
          View, edit, and manage platform users. Ban users, adjust roles, and monitor activity.
        </p>
        <p className="text-gray-500 text-sm mt-4">Coming soon...</p>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map