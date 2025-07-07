import { X } from 'lucide-react';
import { formatDate, formatDateTime, getTimeSlotLabel, getStatusLabel, getStatusColor } from '../lib/utils';
import type { Booking } from '../types';

interface BookingModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ booking, isOpen, onClose }: BookingModalProps) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">รายละเอียดการจอง</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสการจอง
            </label>
            <p className="text-sm text-gray-900">{booking.bookingCode}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ผู้จอง
            </label>
            <p className="text-sm text-gray-900">{booking.bookerName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หัวข้อการประชุม
            </label>
            <p className="text-sm text-gray-900">{booking.meetingTitle}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทรศัพท์
            </label>
            <p className="text-sm text-gray-900">{booking.phoneNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ห้องประชุม
            </label>
            <p className="text-sm text-gray-900">{booking.roomName || booking.room?.roomName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่จอง
            </label>
            <div className="text-sm text-gray-900">
              {booking.dates && booking.dates.length > 0 ? booking.dates.map(date => (
                <div key={date.id}>{formatDate(date.bookingDate)}</div>
              )) : formatDate(booking.createdAt)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ช่วงเวลา
            </label>
            <p className="text-sm text-gray-900">{getTimeSlotLabel(booking.timeSlot)}</p>
          </div>

          {booking.needBreak && booking.breakDetails && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียดการพัก
              </label>
              <p className="text-sm text-gray-900">{booking.breakDetails}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
              {getStatusLabel(booking.status)}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่สร้าง
            </label>
            <p className="text-sm text-gray-900">{formatDateTime(booking.createdAt)}</p>
          </div>

          {booking.updatedAt !== booking.createdAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่อัพเดต
              </label>
              <p className="text-sm text-gray-900">{formatDateTime(booking.updatedAt)}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}