import { useState } from 'react';
import { ArrowLeft, Check, X, Edit, Eye, Trash2, Building, BarChart3 } from 'lucide-react';
import { useBookings, useApproveBooking, useRejectBooking, useUpdateBooking, useDeleteBooking } from '../hooks/useBookings';
import { EditBookingModal } from './EditBookingModal';
import { formatDate, getTimeSlotLabel, getStatusLabel, getStatusColor } from '../lib/utils';
import type { Booking, BookingFormData } from '../types';

// Import new components
import { RoomManagement } from './RoomManagement';
import { AdminManagement } from './AdminManagement';
import { HistoryReports } from './HistoryReports';

interface AdminDashboardProps {
  onBack: () => void;
}

type AdminTab = 'bookings' | 'rooms' | 'admins' | 'reports';

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const { data: bookings = [], refetch } = useBookings({ status: selectedStatus });
  const { data: allBookings = [], refetch: refetchAll } = useBookings({}); // ดึงข้อมูลทั้งหมดสำหรับ count
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();
  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();

  const handleApprove = async (booking: Booking) => {
    setSelectedBooking(booking);
    setActionType('approve');
    setShowModal(true);
  };

  const handleReject = async (booking: Booking) => {
    setSelectedBooking(booking);
    setActionType('reject');
    setRejectReason('');
    setShowModal(true);
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleDelete = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBooking) return;

    try {
      await deleteBooking.mutateAsync(selectedBooking.id);
      setShowDeleteConfirm(false);
      setSelectedBooking(null);
      refetch();
      refetchAll();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleSaveEdit = async (data: BookingFormData) => {
    if (!selectedBooking) return;

    try {
      await updateBooking.mutateAsync({
        id: selectedBooking.id,
        data
      });
      setShowEditModal(false);
      setSelectedBooking(null);
      refetch();
      refetchAll();
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedBooking) return;

    try {
      if (actionType === 'approve') {
        await approveBooking.mutateAsync({
          id: selectedBooking.id,
          data: { adminId: 1 }
        });
      } else {
        await rejectBooking.mutateAsync({
          id: selectedBooking.id,
          data: { adminId: 1, reason: rejectReason }
        });
      }
      setShowModal(false);
      setSelectedBooking(null);
      refetch();
      refetchAll();
    } catch (error) {
      console.error('Error processing booking:', error);
    }
  };

  const statusTabs = [
    { key: 'pending', label: 'รออนุมัติ', count: allBookings.filter(b => b.status === 'pending').length },
    { key: 'approved', label: 'อนุมัติแล้ว', count: allBookings.filter(b => b.status === 'approved').length },
    { key: 'rejected', label: 'ปฏิเสธ', count: allBookings.filter(b => b.status === 'rejected').length },
    { key: '', label: 'ทั้งหมด', count: allBookings.length },
  ];

  const adminTabs = [
    { key: 'bookings', label: 'จัดการการจอง', icon: Check, count: allBookings.filter(b => b.status === 'pending').length },
    { key: 'rooms', label: 'จัดการห้องประชุม', icon: Building },
    { key: 'reports', label: 'รายงานและประวัติ', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-violet-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-purple-100 hover:to-purple-200 text-slate-700 hover:text-purple-700 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 self-start border border-slate-200 hover:border-purple-300"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-bold text-sm sm:text-base">กลับหน้าแรก</span>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">จัดการระบบจองห้องประชุม</p>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-2 mb-6 sm:mb-8">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
            {adminTabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as AdminTab)}
                  className={`flex items-center space-x-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-xl sm:rounded-2xl transition-all duration-200 whitespace-nowrap min-w-fit ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg'
                      : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count && tab.count > 0 && (
                    <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
                      activeTab === tab.key
                        ? 'bg-white/20 text-white'
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'bookings' && (
          <>
            {/* Status Tabs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-2 mb-6 sm:mb-8">
              <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
                {statusTabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedStatus(tab.key)}
                    className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium rounded-xl sm:rounded-2xl transition-all duration-200 whitespace-nowrap min-w-fit ${
                      selectedStatus === tab.key
                        ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg'
                        : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.replace('รออนุมัติ', 'รอ').replace('อนุมัติแล้ว', 'ผ่าน').replace('ปฏิเสธ', 'ไม่ผ่าน').replace('ทั้งหมด', 'ทั้งหมด')}</span>
                    <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
                      selectedStatus === tab.key
                        ? 'bg-white/20 text-white'
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 overflow-hidden">
              {/* Mobile Cards View */}
              <div className="block sm:hidden">
                {bookings.map(booking => (
                  <div key={booking.id} className="border-b border-purple-100 p-4 last:border-b-0">
                    {/* วันที่และช่วงเวลา - ขนาดใหญ่ที่สุด */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-lg font-bold text-slate-800">
                          {booking.dates && booking.dates.length > 0 ? formatDate(booking.dates[0].bookingDate) : formatDate(booking.createdAt)}
                        </div>
                        <div className="text-base font-semibold text-purple-600 mt-1">
                          {getTimeSlotLabel(booking.timeSlot)}
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                    
                    {/* ข้อมูลตามลำดับที่ต้องการ */}
                    <div className="space-y-2 mb-4">
                      {/* ห้องประชุม */}
                      <div className="text-sm font-medium text-slate-700">
                        📍 {booking.roomName || booking.room?.roomName}
                      </div>
                      
                      {/* หัวข้อการประชุม */}
                      {booking.meetingTitle && (
                        <div className="text-sm text-slate-600">
                          💼 {booking.meetingTitle}
                        </div>
                      )}
                      
                      {/* ผู้จอง */}
                      <div className="text-sm text-slate-600">
                        👤 {booking.bookerName}
                      </div>
                      
                      {/* เบอร์ผู้จอง */}
                      <div className="text-sm text-slate-600">
                        📞 {booking.phoneNumber}
                      </div>
                      
                      {/* ข้อมูลเบรค */}
                      {booking.needBreak && (
                        <div className="text-sm text-orange-600 font-medium">
                          ☕ ต้องการเบรค{booking.breakDetails ? `: ${booking.breakDetails}` : ''}
                        </div>
                      )}
                      
                      {/* รหัสการจอง */}
                      <div className="text-xs text-slate-500">
                        🔖 {booking.bookingCode}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowModal(true);
                          setActionType('approve');
                        }}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {/* ปุ่มแก้ไข - ใช้ได้ทุกสถานะ */}
                      <button
                        onClick={() => handleEdit(booking)}
                        className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      
                      {/* ปุ่มลบ - ใช้ได้ทุกสถานะ */}
                      <button
                        onClick={() => handleDelete(booking)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="ลบข้อมูล"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      
                      {/* ปุ่มอนุมัติ/ปฏิเสธ - เฉพาะสถานะ pending */}
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(booking)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                            title="อนุมัติ"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleReject(booking)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="ปฏิเสธ"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-500 text-sm">ไม่มีข้อมูลการจอง</p>
                  </div>
                )}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        วันที่และเวลา
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        ห้องประชุม
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        ผู้จอง
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-purple-25 transition-colors duration-200">
                        {/* วันที่และเวลา */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-800">
                            {booking.dates && booking.dates.length > 0 ? formatDate(booking.dates[0].bookingDate) : formatDate(booking.createdAt)}
                          </div>
                          <div className="text-sm font-medium text-purple-600">
                            {getTimeSlotLabel(booking.timeSlot)}
                          </div>
                        </td>
                        
                        {/* ห้องประชุม */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          📍 {booking.roomName || booking.room?.roomName}
                        </td>
                        
                        {/* ผู้จอง */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">👤 {booking.bookerName}</div>
                          <div className="text-sm text-slate-600">📞 {booking.phoneNumber}</div>
                          {booking.needBreak && (
                            <div className="text-xs text-orange-600 font-medium mt-1">
                              ☕ ต้องการเบรค{booking.breakDetails ? `: ${booking.breakDetails}` : ''}
                            </div>
                          )}
                        </td>
                        
                        {/* สถานะ */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </span>
                        </td>
                        
                        {/* จัดการ */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowModal(true);
                                setActionType('approve');
                              }}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="ดูรายละเอียด"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {/* ปุ่มแก้ไข - ใช้ได้ทุกสถานะ */}
                            <button
                              onClick={() => handleEdit(booking)}
                              className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            {/* ปุ่มลบ - ใช้ได้ทุกสถานะ */}
                            <button
                              onClick={() => handleDelete(booking)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="ลบข้อมูล"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            {/* ปุ่มอนุมัติ/ปฏิเสธ - เฉพาะสถานะ pending */}
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(booking)}
                                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                                  title="อนุมัติ"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(booking)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  title="ปฏิเสธ"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-500 text-lg">ไม่มีข้อมูลการจอง</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'rooms' && <RoomManagement />}
        {activeTab === 'admins' && <AdminManagement />}
        {activeTab === 'reports' && <HistoryReports />}

        {/* Modal */}
        {showModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-purple-100/50 p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6">
                {actionType === 'approve' ? 'อนุมัติการจอง' : 'ปฏิเสธการจอง'}
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 bg-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="text-sm sm:text-base">
                  <span className="font-bold text-slate-700">รหัสการจอง:</span> 
                  <span className="ml-1 sm:ml-2 text-slate-800">{selectedBooking.bookingCode}</span>
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-bold text-slate-700">ผู้จอง:</span> 
                  <span className="ml-1 sm:ml-2 text-slate-800">{selectedBooking.bookerName}</span>
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-bold text-slate-700">ห้องประชุม:</span> 
                  <span className="ml-1 sm:ml-2 text-slate-800">{selectedBooking.roomName}</span>
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-bold text-slate-700">วันที่:</span>
                  {selectedBooking.dates && selectedBooking.dates.length > 0 ? selectedBooking.dates.map(date => (
                    <div key={date.id} className="ml-2 sm:ml-4 text-slate-800">• {formatDate(date.bookingDate)}</div>
                  )) : (
                    <div className="ml-2 sm:ml-4 text-slate-800">• {formatDate(selectedBooking.createdAt)}</div>
                  )}
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-bold text-slate-700">เวลา:</span> 
                  <span className="ml-1 sm:ml-2 text-slate-800">{getTimeSlotLabel(selectedBooking.timeSlot)}</span>
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-bold text-slate-700">เบอร์โทร:</span> 
                  <span className="ml-1 sm:ml-2 text-slate-800">{selectedBooking.phoneNumber}</span>
                </div>
                {selectedBooking.meetingTitle && (
                  <div className="text-sm sm:text-base">
                    <span className="font-bold text-slate-700">หัวข้อการประชุม:</span> 
                    <span className="ml-1 sm:ml-2 text-slate-800">{selectedBooking.meetingTitle}</span>
                  </div>
                )}
                {selectedBooking.needBreak && (
                  <div className="text-sm sm:text-base">
                    <span className="font-bold text-slate-700">ข้อมูลเบรค:</span> 
                    <span className="ml-1 sm:ml-2 text-orange-600 font-medium">
                      ☕ ต้องการเบรค{selectedBooking.breakDetails ? ` - ${selectedBooking.breakDetails}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* แสดง textarea เฉพาะเมื่อ reject และสถานะ pending */}
              {actionType === 'reject' && selectedBooking.status === 'pending' && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    เหตุผลการปฏิเสธ *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80"
                    placeholder="กรุณาระบุเหตุผล..."
                    required
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium order-2 sm:order-1"
                >
                  {selectedBooking.status === 'pending' ? 'ยกเลิก' : 'ปิด'}
                </button>
                
                {/* แสดงปุ่มอนุมัติ/ปฏิเสธ เฉพาะสถานะ pending */}
                {selectedBooking.status === 'pending' && (
                  <button
                    onClick={handleConfirmAction}
                    disabled={actionType === 'reject' && !rejectReason.trim()}
                    className={`px-4 sm:px-6 py-2 sm:py-3 text-white rounded-xl font-medium transition-all duration-200 order-1 sm:order-2 ${
                      actionType === 'approve'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {actionType === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}
                  </button>
                )}
                
                {/* แสดงปุ่ม disabled เมื่อสถานะไม่ใช่ pending */}
                {selectedBooking.status !== 'pending' && (
                  <button
                    disabled
                    className="px-4 sm:px-6 py-2 sm:py-3 text-gray-400 bg-gray-100 rounded-xl cursor-not-allowed opacity-50 font-medium order-1 sm:order-2"
                  >
                    {selectedBooking.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-purple-100/50 p-6 sm:p-8 max-w-md w-full">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ยืนยันการลบข้อมูลการจอง
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  คุณแน่ใจหรือไม่ที่จะลบการจอง <strong>{selectedBooking.bookingCode}</strong>?<br/>
                  การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  ลบข้อมูล
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Booking Modal */}
        <EditBookingModal
          booking={selectedBooking}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBooking(null);
          }}
          onSave={handleSaveEdit}
        />
      </div>
    </div>
  );
}