'use client';

import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Configure platform settings and preferences</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
        <SettingsIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Admin Settings</h3>
        <p className="text-gray-400">
          Configure system settings, moderation policies, feature toggles, and platform preferences.
        </p>
        <p className="text-gray-500 text-sm mt-4">Coming soon...</p>
      </div>
    </div>
  );
}
