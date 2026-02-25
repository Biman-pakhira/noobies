'use client';

import { useState } from 'react';
import { Trash2, CheckCircle } from 'lucide-react';
import { useReports, useHandleReport } from '@/hooks/useAdmin';

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('OPEN');
  const { reports, total, isLoading, error } = useReports(page, 20, status);
  const handleReport = useHandleReport();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'dismiss' | 'delete_video'>('dismiss');

  const handleSubmit = async () => {
    if (selectedReport) {
      await handleReport.mutateAsync({
        reportId: selectedReport,
        action,
        notes,
      });
      setSelectedReport(null);
      setNotes('');
      setAction('dismiss');
    }
  };

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
        Failed to load reports: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-2">Review and handle user reports</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['OPEN', 'RESOLVED', 'DISMISSED', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-4 py-2 rounded transition-colors ${
              status === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      {!reports || reports.length === 0 ? (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-400">No reports found</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800">
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Video</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Reason</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {reports.map((report: any) => (
                  <tr
                    key={report.id}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-white">
                      <div>
                        <p className="font-medium truncate">{report.video.title}</p>
                        <p className="text-xs text-gray-500">ID: {report.video.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-300">
                      {report.reporter.username}
                    </td>
                    <td className="px-6 py-3 text-gray-300 max-w-xs truncate">
                      {report.reason}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          report.status === 'OPEN'
                            ? 'bg-red-900/20 text-red-400'
                            : report.status === 'RESOLVED'
                            ? 'bg-green-900/20 text-green-400'
                            : 'bg-gray-700/20 text-gray-400'
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {report.status === 'OPEN' && (
                        <button
                          onClick={() => setSelectedReport(report.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {reports && reports.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {page} of {Math.ceil((total || 1) / 20)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={(page * 20) >= (total || 0)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Handle Report</h3>

            {/* Action Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as 'dismiss' | 'delete_video')}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="dismiss">Dismiss Report</option>
                <option value="delete_video">Delete Video</option>
              </select>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this action..."
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setNotes('');
                  setAction('dismiss');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={handleReport.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors flex items-center justify-center gap-2"
              >
                {action === 'delete_video' ? (
                  <>
                    <Trash2 className="w-4 h-4" /> Delete
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Dismiss
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
