import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Search, Filter, RotateCcw } from 'lucide-react';
import { useDailyBookings } from '../hooks/useBookings';
import { useAuth } from '../contexts/AuthContext';
import { DailyMeetingCard } from './DailyMeetingCard';
import { DailyStats } from './DailyStats';
import { EditBookingModal } from './EditBookingModal';
import { formatDateLong, formatSystemDate } from '../lib/utils';
import type { DailyMeeting, Booking } from '../types';

interface DailyOverviewProps {
  onMeetingSelect?: (meeting: DailyMeeting) => void;
  onApprove?: (meeting: DailyMeeting) => void;
  onReject?: (meeting: DailyMeeting) => void;
  onEdit?: (meeting: DailyMeeting) => void;
}

export function DailyOverview({ 
  onMeetingSelect,
  onApprove,
  onReject,
  onEdit
}: DailyOverviewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(formatSystemDate(new Date()));
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roomFilter, setRoomFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<DailyMeeting | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: dailyData, isLoading } = useDailyBookings(selectedDate);
  const { admin: currentUser } = useAuth();

  // Navigate dates
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(formatSystemDate(prevDay));
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(formatSystemDate(nextDay));
  };

  const goToToday = () => {
    setSelectedDate(formatSystemDate(new Date()));
  };

  // Filter meetings
  const filteredMeetings = dailyData?.meetings.filter(meeting => {
    if (statusFilter && meeting.status !== statusFilter) return false;
    if (roomFilter && meeting.roomId.toString() !== roomFilter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        meeting.meetingTitle.toLowerCase().includes(searchLower) ||
        meeting.bookerName.toLowerCase().includes(searchLower) ||
        meeting.roomName.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }) || [];

  // Reset filters
  const resetFilters = () => {
    setStatusFilter('');
    setRoomFilter('');
    setSearchTerm('');
  };

  const hasActiveFilters = statusFilter || roomFilter || searchTerm;

  // Event handlers
  const handleView = (meeting: DailyMeeting) => {
    setSelectedMeeting(meeting);
    onMeetingSelect?.(meeting);
  };

  const handleEdit = (meeting: DailyMeeting) => {
    setSelectedMeeting(meeting);
    setShowEditModal(true);
    onEdit?.(meeting);
  };

  const handleSaveEdit = async () => {
    if (!selectedMeeting) return;
    
    // This would typically call an API to update the booking
    // For now, we'll just close the modal
    setShowEditModal(false);
    setSelectedMeeting(null);
  };

  const handleApprove = (meeting: DailyMeeting) => {
    onApprove?.(meeting);
  };

  const handleReject = (meeting: DailyMeeting) => {
    onReject?.(meeting);
  };

  // Get unique rooms for filter
  const uniqueRooms = Array.from(
    new Set(dailyData?.meetings.map(m => m.roomId) || [])
  ).map(roomId => {
    const meeting = dailyData?.meetings.find(m => m.roomId === roomId);
    return { id: roomId, name: meeting?.roomName || `ห้อง ${roomId}` };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-slate-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-slate-800">
                {formatDateLong(selectedDate)}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousDay}
                className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="วันก่อนหน้า"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextDay}
                className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="วันถัดไป"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
            />
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:from-purple-600 hover:to-violet-600 transition-colors text-sm font-medium"
            >
              วันนี้
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {dailyData?.stats && <DailyStats stats={dailyData.stats} />}

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50">
        <div className="p-4 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-slate-700">ฟิลเตอร์การประชุม</span>
              {hasActiveFilters && (
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                  มีฟิลเตอร์ใช้งาน
                </span>
              )}
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                แสดง {filteredMeetings.length} จาก {dailyData?.meetings.length || 0} รายการ
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>รีเซ็ต</span>
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <span>{showFilters ? 'ซ่อน' : 'แสดง'}ฟิลเตอร์</span>
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  ค้นหา
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาชื่อการประชุม, ผู้จอง, หรือห้อง..."
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">สถานะ</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="pending">รออนุมัติ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ปฏิเสธ</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>

              {/* Room Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ห้อง</label>
                <select
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                >
                  <option value="">ทั้งหมด</option>
                  {uniqueRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">
              {hasActiveFilters ? 'ไม่พบการประชุมที่ตรงกับเงื่อนไขการกรอง' : 'ไม่มีการประชุมในวันนี้'}
            </h3>
            <p className="text-slate-500 text-sm">
              {hasActiveFilters ? (
                <>ลองปรับเปลี่ยนตัวกรองหรือรีเซ็ตเพื่อดูข้อมูลทั้งหมด</>
              ) : (
                <>เลือกวันที่อื่น หรือสร้างการจองใหม่</>
              )}
            </p>
          </div>
        ) : (
          filteredMeetings.map(meeting => (
            <DailyMeetingCard
              key={meeting.id}
              meeting={meeting}
              onView={handleView}
              onEdit={handleEdit}
              onApprove={handleApprove}
              onReject={handleReject}
              canManage={!!currentUser}
            />
          ))
        )}
      </div>

      {/* Edit Modal */}
      {selectedMeeting && (
        <EditBookingModal
          booking={selectedMeeting as unknown as Booking}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMeeting(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}