import { X, Clock, User, Building, Calendar } from 'lucide-react';
import { formatDate, getTimeSlotLabel, getStatusLabel, getStatusColor } from '../lib/utils';
import type { Booking } from '../types';

interface BookingListModalProps {
  date: Date | null;
  bookings: Booking[];
  isOpen: boolean;
  onClose: () => void;
  onBookingClick: (booking: Booking) => void;
  onNewBooking?: (date: Date) => void;
}

export function BookingListModal({ 
  date, 
  bookings, 
  isOpen, 
  onClose, 
  onBookingClick,
  onNewBooking 
}: BookingListModalProps) {
  if (!isOpen || !date) return null;

  // กรองการจองเฉพาะวันที่เลือก
  const dayBookings = bookings.filter(booking => {
    if (!booking.dates || booking.dates.length === 0) return false;
    
    const targetDate = formatDate(date, 'yyyy-MM-dd');
    return booking.dates.some(bookingDate => {
      const formattedBookingDate = typeof bookingDate === 'string' 
        ? bookingDate.split('T')[0] 
        : formatDate(bookingDate, 'yyyy-MM-dd');
      return formattedBookingDate === targetDate;
    });
  });

  // ตรวจสอบช่วงเวลาที่ยังว่าง
  const getAvailableTimeSlots = () => {
    if (dayBookings.length === 0) {
      return ['morning', 'afternoon', 'full_day']; // ว่างทั้งหมด
    }

    const bookedSlots = dayBookings.map(booking => booking.timeSlot);
    const hasFullDay = bookedSlots.includes('full_day');
    const hasMorning = bookedSlots.includes('morning');
    const hasAfternoon = bookedSlots.includes('afternoon');

    if (hasFullDay) {
      return []; // เต็มแล้ว
    }

    const availableSlots = [];
    if (!hasMorning) availableSlots.push('morning');
    if (!hasAfternoon) availableSlots.push('afternoon');
    
    // ถ้าทั้งเช้าและบ่ายว่าง ให้เพิ่มตัวเลือกเต็มวัน
    if (!hasMorning && !hasAfternoon) {
      availableSlots.push('full_day');
    }

    return availableSlots;
  };

  const availableSlots = getAvailableTimeSlots();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">
              รายการการจองวันที่
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {formatDate(date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-purple-100 transition-colors duration-200 text-slate-600 hover:text-purple-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {dayBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">ไม่มีการจองในวันนี้</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-purple-100 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-purple-200"
                  onClick={() => onBookingClick(booking)}
                >
                  {/* สถานะ */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                    <span className="text-xs text-slate-500">
                      รหัส: {booking.bookingCode}
                    </span>
                  </div>

                  {/* รายละเอียดการจอง */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-slate-700">
                        {getTimeSlotLabel(booking.timeSlot)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-slate-600">
                        {booking.bookerName}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-slate-600">
                        {booking.roomName || `ห้อง ID: ${booking.roomId}`}
                      </span>
                    </div>
                  </div>

                  {/* หัวข้อการประชุม */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-slate-800 line-clamp-2">
                      {booking.meetingTitle}
                    </h4>
                  </div>

                  {/* อาหารว่าง */}
                  {booking.needBreak && (
                    <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block">
                      🍪 ต้องการอาหารว่าง
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-100 bg-gray-50">
          {availableSlots.length > 0 && onNewBooking ? (
            <div className="flex flex-col space-y-3">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  ช่วงเวลาที่ยังว่าง:
                </p>
                <div className="flex justify-center space-x-2 mb-3">
                  {availableSlots.includes('morning') && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      เช้า
                    </span>
                  )}
                  {availableSlots.includes('afternoon') && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      บ่าย
                    </span>
                  )}
                  {availableSlots.includes('full_day') && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      เต็มวัน
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  onNewBooking(date);
                  onClose();
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                + จองช่วงเวลาที่ว่าง
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center">
              คลิกที่รายการเพื่อดูรายละเอียดเพิ่มเติม
              {availableSlots.length === 0 && <span className="block mt-1 text-red-500">ช่วงเวลาเต็มแล้ว</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}