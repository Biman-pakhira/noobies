'use client';
const colorClasses = {
    blue: 'bg-blue-900/20 border-blue-500/30 text-blue-400',
    green: 'bg-green-900/20 border-green-500/30 text-green-400',
    red: 'bg-red-900/20 border-red-500/30 text-red-400',
    purple: 'bg-purple-900/20 border-purple-500/30 text-purple-400',
};
export default function DashboardCard({ title, value, icon, color, change, }) {
    return (<div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change && <p className="text-xs text-gray-500 mt-2">{change}</p>}
        </div>
        <div className="opacity-50">{icon}</div>
      </div>
    </div>);
}
//# sourceMappingURL=DashboardCard.js.map