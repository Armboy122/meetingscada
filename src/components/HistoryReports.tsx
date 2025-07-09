import { useState } from 'react';
import { BarChart3, Calendar, Users, TrendingUp, Clock, Filter, Download } from 'lucide-react';
import { useHistory, useHistorySummary} from '../hooks/useHistory';
import { useAdmins } from '../hooks/useAdmins';
import { formatDate } from '../lib/utils';

export function HistoryReports() {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const { data: admins = [] } = useAdmins();
  const { data: historySummary, error: historySummaryError } = useHistorySummary();
  const { data: historyData, error: historyError } = useHistory({
    limit,
    offset,
    action: selectedAction || undefined,
    adminId: selectedAdminId ? parseInt(selectedAdminId) : undefined,
  });

  const actionOptions = [
    { value: '', label: 'ทุกการดำเนินการ' },
    { value: 'created', label: 'สร้างการจอง' },
    { value: 'approved', label: 'อนุมัติการจอง' },
    { value: 'rejected', label: 'ปฏิเสธการจอง' },
    { value: 'cancelled', label: 'ยกเลิกการจอง' },
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '📝';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'cancelled': return '🚫';
      default: return '📋';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleNextPage = () => {
    if (historyData?.pagination?.hasMore) {
      setOffset(offset + limit);
    }
  };

  // Check if History API is available
  if (historySummaryError || historyError) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">รายงานและประวัติ</h2>
              <p className="text-sm text-slate-600">สถิติการใช้งานและประวัติการดำเนินการ</p>
            </div>
          </div>
        </div>

        {/* Not Available Message */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ฟีเจอร์ประวัติและรายงานยังไม่พร้อมใช้งาน
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              API endpoints สำหรับประวัติและรายงานยังไม่ได้ถูกพัฒนาใน backend
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-700">
                <strong>ฟีเจอร์ที่จะมีในอนาคต:</strong>
              </p>
              <ul className="mt-2 text-sm text-blue-600 space-y-1">
                <li>• สถิติการใช้งานระบบ</li>
                <li>• ประวัติการดำเนินการของผู้ดูแล</li>
                <li>• รายงานการจองห้องประชุม</li>
                <li>• การวิเคราะห์แนวโน้มการใช้งาน</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">รายงานและประวัติ</h2>
            <p className="text-sm text-slate-600">สถิติการใช้งานและประวัติการดำเนินการ</p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {historySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {historySummary.actionSummary?.map((stat) => (
            <div
              key={stat.action}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg">
                  <span className="text-lg">{getActionIcon(stat.action)}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">{stat.count}</div>
                  <div className="text-sm text-slate-600">ครั้ง</div>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-700">
                {actionOptions.find(opt => opt.value === stat.action)?.label || stat.action}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Admins */}
      {historySummary?.topAdmins && historySummary.topAdmins.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">ผู้ดูแลที่ทำงานมากที่สุด</h3>
          </div>
          <div className="space-y-3">
            {historySummary.topAdmins.slice(0, 5).map((admin, index) => (
              <div key={admin.adminId} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full text-orange-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{admin.adminName}</div>
                    <div className="text-xs text-slate-600">@{admin.adminUsername}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-600">{admin.totalActions}</div>
                  <div className="text-xs text-slate-500">การดำเนินการ</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
            <Filter className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">กรองข้อมูล</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ประเภทการดำเนินการ
            </label>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {actionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ผู้ดูแลระบบ
            </label>
            <select
              value={selectedAdminId}
              onChange={(e) => {
                setSelectedAdminId(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกคน</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id.toString()}>
                  {admin.fullName} (@{admin.username})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              จำนวนรายการต่อหน้า
            </label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setOffset(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 รายการ</option>
              <option value={20}>20 รายการ</option>
              <option value={50}>50 รายการ</option>
              <option value={100}>100 รายการ</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">ประวัติการดำเนินการ</h3>
            </div>
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              title="ส่งออกข้อมูล"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">ส่งออก</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  วันที่และเวลา
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  การดำเนินการ
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  การจอง
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ผู้ดำเนินการ
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  เหตุผล
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historyData?.history?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDate(item.actionDate)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
                      <span>{getActionIcon(item.action)}</span>
                      <span>{actionOptions.find(opt => opt.value === item.action)?.label || item.action}</span>
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{item.bookingCode}</div>
                    <div className="text-sm text-slate-600">{item.bookerName}</div>
                    <div className="text-xs text-slate-500">{item.meetingTitle}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.actionBy === 'admin' ? (
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <Users className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{item.adminName}</div>
                          <div className="text-xs text-slate-500">@{item.adminUsername}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-green-100 rounded-full">
                          <Users className="w-3 h-3 text-green-600" />
                        </div>
                        <div className="text-sm text-slate-600">ผู้จอง</div>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                    {item.reason || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!historyData?.history || historyData.history.length === 0) && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">ไม่มีประวัติการดำเนินการ</p>
              <p className="text-slate-400 text-sm">ลองเปลี่ยนตัวกรองเพื่อดูข้อมูลอื่น</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {historyData?.pagination && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span>แสดง {offset + 1} - {Math.min(offset + limit, historyData.pagination.total)} จาก {historyData.pagination.total} รายการ</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                  className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!historyData.pagination.hasMore}
                  className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 