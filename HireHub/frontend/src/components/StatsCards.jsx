import { TrophyIcon, UsersIcon } from "lucide-react";

function StatsCards({ activeSessionsCount, recentSessionsCount }) {
  return (
    <div className="lg:col-span-1 grid grid-cols-1 gap-6">
      <div className="glass-card p-5 hover-scale smooth">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-white/70 rounded-2xl">
            <UsersIcon className="w-7 h-7 text-gray-800" />
          </div>
          <div className="text-sm text-gray-500">Live</div>
        </div>
        <div className="text-4xl font-extrabold mb-1">{activeSessionsCount}</div>
        <div className="text-sm text-gray-500">Active Sessions</div>
      </div>

      <div className="glass-card p-5 hover-scale smooth">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-white/70 rounded-2xl">
            <TrophyIcon className="w-7 h-7 text-gray-800" />
          </div>
        </div>
        <div className="text-4xl font-extrabold mb-1">{recentSessionsCount}</div>
        <div className="text-sm text-gray-500">Total Sessions</div>
      </div>
    </div>
  );
}

export default StatsCards;
