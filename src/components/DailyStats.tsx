import { Building, Users, Coffee, Clock } from 'lucide-react';
import type { DailyStats } from '../types';

interface DailyStatsProps {
  stats: DailyStats;
}

export function DailyStats({ stats }: DailyStatsProps) {
  const statItems = [
    {
      icon: Clock,
      label: 'การประชุมทั้งหมด',
      value: stats.totalMeetings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Building,
      label: 'ห้องที่ใช้งาน',
      value: `${stats.roomsInUse}/${stats.totalRooms}`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: Users,
      label: 'ผู้เข้าร่วมรวม',
      value: `${stats.totalAttendees}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Coffee,
      label: 'ขอเบรค',
      value: stats.breakRequests,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-4 sm:p-6">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
        <h3 className="text-lg font-bold text-slate-800">สรุปภาพรวม</h3>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={index}
              className={`${item.bgColor} ${item.borderColor} border rounded-xl p-3 sm:p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <IconComponent className={`w-5 h-5 ${item.color}`} />
                {stats.pendingApprovals > 0 && item.label === 'การประชุมทั้งหมด' && (
                  <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full font-medium">
                    {stats.pendingApprovals} รออนุมัติ
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {item.value}
              </div>
              <div className="text-xs text-slate-600">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Additional Info */}
      {(stats.pendingApprovals > 0 || stats.breakRequests > 0) && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex flex-wrap gap-2 text-sm">
            {stats.pendingApprovals > 0 && (
              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                ⏳ มี {stats.pendingApprovals} รายการรออนุมัติ
              </span>
            )}
            {stats.breakRequests > 0 && (
              <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                ☕ มี {stats.breakRequests} รายการขอเบรค
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}