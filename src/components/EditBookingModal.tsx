import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useRooms } from '../hooks/useRooms';

import type { Booking, BookingFormData } from '../types';

interface EditBookingModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BookingFormData) => Promise<void>;
}

export function EditBookingModal({ booking, isOpen, onClose, onSave }: EditBookingModalProps) {
  const { data: rooms = [] } = useRooms();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<BookingFormData>();

  useEffect(() => {
    if (booking && isOpen) {
      // Set form values from booking data
      setValue('bookerName', booking.bookerName);
      setValue('phoneNumber', booking.phoneNumber);
      setValue('meetingTitle', booking.meetingTitle || '');
      setValue('timeSlot', booking.timeSlot);
      setValue('roomId', booking.roomId);
      
      // Set booking dates if available
      if (booking.dates && booking.dates.length > 0) {
        const bookingDate = new Date(booking.dates[0].bookingDate);
        setValue('dates', [bookingDate.toISOString().split('T')[0]]);
      }
    }
  }, [booking, isOpen, setValue]);

  const onSubmit = async (data: BookingFormData) => {
    setIsLoading(true);
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-purple-100/50 p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">แก้ไขข้อมูลการจอง</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 rounded-xl sm:rounded-2xl">
          <div className="text-xs sm:text-sm text-slate-600">
            <span className="font-bold">รหัสการจอง:</span> {booking.bookingCode}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                ชื่อผู้จอง *
              </label>
              <input
                type="text"
                {...register('bookerName', { required: 'กรุณากรอกชื่อผู้จอง' })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 text-sm sm:text-base"
                placeholder="ชื่อ-นามสกุล"
              />
              {errors.bookerName && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.bookerName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                เบอร์โทรศัพท์ *
              </label>
              <input
                type="tel"
                {...register('phoneNumber', { required: 'กรุณากรอกเบอร์โทรศัพท์' })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 text-sm sm:text-base"
                placeholder="08X-XXX-XXXX"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              หัวข้อการประชุม
            </label>
            <input
              type="text"
              {...register('meetingTitle')}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 text-sm sm:text-base"
              placeholder="หัวข้อการประชุม (ไม่บังคับ)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                ห้องประชุม *
              </label>
              <select
                {...register('roomId', { required: 'กรุณาเลือกห้องประชุม' })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 text-sm sm:text-base"
              >
                <option value="">เลือกห้องประชุม</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.roomName} (ความจุ {room.capacity} ที่นั่ง)
                  </option>
                ))}
              </select>
              {errors.roomId && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.roomId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                วันที่จอง *
              </label>
              <input
                type="date"
                {...register('dates.0', { required: 'กรุณาเลือกวันที่' })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 text-sm sm:text-base"
              />
              {errors.dates?.[0] && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.dates[0].message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              ช่วงเวลา *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center p-3 sm:p-4 border-2 border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-all duration-200">
                <input
                  type="radio"
                  value="morning"
                  {...register('timeSlot', { required: 'กรุณาเลือกช่วงเวลา' })}
                  className="sr-only"
                />
                <div className="flex items-center justify-center w-4 h-4 border-2 border-purple-400 rounded-full mr-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full opacity-0 peer-checked:opacity-100"></div>
                </div>
                <div>
                  <div className="font-medium text-slate-800 text-sm sm:text-base">เช้า</div>
                  <div className="text-xs sm:text-sm text-slate-600">09:00 - 12:00</div>
                </div>
              </label>

              <label className="flex items-center p-3 sm:p-4 border-2 border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-all duration-200">
                <input
                  type="radio"
                  value="afternoon"
                  {...register('timeSlot', { required: 'กรุณาเลือกช่วงเวลา' })}
                  className="sr-only"
                />
                <div className="flex items-center justify-center w-4 h-4 border-2 border-purple-400 rounded-full mr-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full opacity-0 peer-checked:opacity-100"></div>
                </div>
                <div>
                  <div className="font-medium text-slate-800 text-sm sm:text-base">บ่าย</div>
                  <div className="text-xs sm:text-sm text-slate-600">13:00 - 17:00</div>
                </div>
              </label>

              <label className="flex items-center p-3 sm:p-4 border-2 border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-all duration-200">
                <input
                  type="radio"
                  value="full_day"
                  {...register('timeSlot', { required: 'กรุณาเลือกช่วงเวลา' })}
                  className="sr-only"
                />
                <div className="flex items-center justify-center w-4 h-4 border-2 border-purple-400 rounded-full mr-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full opacity-0 peer-checked:opacity-100"></div>
                </div>
                <div>
                  <div className="font-medium text-slate-800 text-sm sm:text-base">เต็มวัน</div>
                  <div className="text-xs sm:text-sm text-slate-600">09:00 - 17:00</div>
                </div>
              </label>
            </div>
            {errors.timeSlot && (
              <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.timeSlot.message}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-purple-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2.5 sm:py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium text-sm sm:text-base order-2 sm:order-1"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2 active:scale-95 touch-manipulation"
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}