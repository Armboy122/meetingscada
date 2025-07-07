import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useCreateBooking, useBookings } from '../hooks/useBookings';
import { useRooms } from '../hooks/useRooms';
import type { BookingFormData } from '../types';

interface BookingFormProps {
  selectedDate: Date | null;
  selectedRoomId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingForm({ selectedDate, selectedRoomId, isOpen, onClose, onSuccess }: BookingFormProps) {
  const { data: rooms = [] } = useRooms();
  const createBooking = useCreateBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // ดึงข้อมูลการจองสำหรับห้องที่เลือก
  const { data: existingBookings = [] } = useBookings({ roomId: selectedRoomId });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<BookingFormData>({
    defaultValues: {
      roomId: selectedRoomId,
      timeSlot: 'morning',
      needBreak: false,
      dates: selectedDate ? [format(selectedDate, 'yyyy-MM-dd')] : [],
    },
  });

  const needBreak = watch('needBreak');

  // Update roomId when selectedRoomId prop changes
  useEffect(() => {
    setValue('roomId', selectedRoomId);
  }, [selectedRoomId, setValue]);

  // ตรวจสอบช่วงเวลาที่จองไปแล้วในวันที่เลือก
  const bookedTimeSlots = useMemo(() => {
    if (!selectedDate || !existingBookings.length) return [];

    const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
    const bookedSlots: string[] = [];

    existingBookings.forEach(booking => {
      // ตรวจสอบเฉพาะสถานะ approved หรือ pending
      if (booking.status === 'approved' || booking.status === 'pending') {
        // ตรวจสอบว่าการจองนี้ตรงกับวันที่เลือกหรือไม่
        const bookingDates = booking.dates || [];
        const hasMatchingDate = bookingDates.some(date => 
          format(new Date(date.bookingDate), 'yyyy-MM-dd') === selectedDateString
        );
        
        if (hasMatchingDate) {
          bookedSlots.push(booking.timeSlot);
        }
      }
    });

    return bookedSlots;
  }, [selectedDate, existingBookings]);

  // ตรวจสอบว่าช่วงเวลาใดใช้ได้
  const isTimeSlotAvailable = useMemo(() => {
    if (!bookedTimeSlots.length) {
      return { morning: true, afternoon: true, full_day: true };
    }

    const hasFullDay = bookedTimeSlots.includes('full_day');
    const hasMorning = bookedTimeSlots.includes('morning');
    const hasAfternoon = bookedTimeSlots.includes('afternoon');

    // ถ้ามีการจองเต็มวัน ช่วงเวลาอื่นจะไม่ว่าง
    if (hasFullDay) {
      return { morning: false, afternoon: false, full_day: false };
    }

    // ถ้ามีการจองทั้งเช้าและบ่าย จะไม่สามารถจองเต็มวันได้
    if (hasMorning && hasAfternoon) {
      return { morning: false, afternoon: false, full_day: false };
    }

    return {
      morning: !hasMorning,
      afternoon: !hasAfternoon,
      full_day: !hasMorning && !hasAfternoon
    };
  }, [bookedTimeSlots]);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createBooking.mutateAsync(data);
      onSuccess();
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      setSubmitError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการจอง');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !selectedDate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">จองห้องประชุม</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่จอง
            </label>
            <div className="p-2 bg-gray-50 rounded border">
              {format(selectedDate, 'dd MMMM yyyy', { locale: th })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อผู้จอง *
            </label>
            <input
              type="text"
              {...register('bookerName', { required: 'กรุณากรอกชื่อผู้จอง' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="กรอกชื่อผู้จอง"
            />
            {errors.bookerName && (
              <p className="mt-1 text-sm text-red-600">{errors.bookerName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หัวข้อการประชุม *
            </label>
            <input
              type="text"
              {...register('meetingTitle', { required: 'กรุณากรอกหัวข้อการประชุม' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="กรอกหัวข้อการประชุม"
            />
            {errors.meetingTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.meetingTitle.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทรศัพท์ *
            </label>
            <input
              type="tel"
              {...register('phoneNumber', { 
                required: 'กรุณากรอกเบอร์โทรศัพท์',
                pattern: {
                  value: /^[0-9]{10,}$/,
                  message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักขึ้นไป'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="กรอกเบอร์โทรศัพท์"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ห้องประชุม *
            </label>
            <select
              {...register('roomId', { required: 'กรุณาเลือกห้องประชุม' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">เลือกห้องประชุม</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.roomName} ({room.capacity} ที่นั่ง)
                </option>
              ))}
            </select>
            {errors.roomId && (
              <p className="mt-1 text-sm text-red-600">{errors.roomId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ช่วงเวลา *
            </label>
            <div className="space-y-2">
              <label className={`flex items-center ${!isTimeSlotAvailable.morning ? 'opacity-50' : ''}`}>
                <input
                  type="radio"
                  value="morning"
                  {...register('timeSlot', { required: 'กรุณาเลือกช่วงเวลา' })}
                  className="mr-2"
                  disabled={!isTimeSlotAvailable.morning}
                />
                <span className="flex-1">
                  เช้า (09:00-12:00)
                  {!isTimeSlotAvailable.morning && (
                    <span className="text-red-500 text-sm ml-2">- จองแล้ว</span>
                  )}
                </span>
              </label>
              <label className={`flex items-center ${!isTimeSlotAvailable.afternoon ? 'opacity-50' : ''}`}>
                <input
                  type="radio"
                  value="afternoon"
                  {...register('timeSlot', { required: 'กรุณาเลือกช่วงเวลา' })}
                  className="mr-2"
                  disabled={!isTimeSlotAvailable.afternoon}
                />
                <span className="flex-1">
                  บ่าย (13:00-17:00)
                  {!isTimeSlotAvailable.afternoon && (
                    <span className="text-red-500 text-sm ml-2">- จองแล้ว</span>
                  )}
                </span>
              </label>
              <label className={`flex items-center ${!isTimeSlotAvailable.full_day ? 'opacity-50' : ''}`}>
                <input
                  type="radio"
                  value="full_day"
                  {...register('timeSlot', { required: 'กรุณาเลือกช่วงเวลา' })}
                  className="mr-2"
                  disabled={!isTimeSlotAvailable.full_day}
                />
                <span className="flex-1">
                  เต็มวัน (09:00-17:00)
                  {!isTimeSlotAvailable.full_day && (
                    <span className="text-red-500 text-sm ml-2">- จองแล้ว</span>
                  )}
                </span>
              </label>
            </div>
            {errors.timeSlot && (
              <p className="mt-1 text-sm text-red-600">{errors.timeSlot.message}</p>
            )}
            
            {/* แสดงข้อมูลการจองที่มีอยู่ */}
            {bookedTimeSlots.length > 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>ข้อมูลการจอง:</strong> วันนี้มีการจองไปแล้วในช่วงเวลา{' '}
                  {bookedTimeSlots.map(slot => {
                    switch (slot) {
                      case 'morning': return 'เช้า';
                      case 'afternoon': return 'บ่าย';
                      case 'full_day': return 'เต็มวัน';
                      default: return slot;
                    }
                  }).join(', ')}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อาหารว่าง
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="true"
                  {...register('needBreak')}
                  className="mr-2"
                />
                รับ
              </label>
              <label className="flex items-center">
                <input
                  type="radio" 
                  value="false"
                  {...register('needBreak')}
                  className="mr-2"
                />
                ไม่รับ
              </label>
            </div>
          </div>

          {needBreak && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียดอาหารที่ต้องการ
              </label>
              <textarea
                {...register('breakDetails')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น พักเที่ยง 12:00-13:00"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!isTimeSlotAvailable.morning && !isTimeSlotAvailable.afternoon && !isTimeSlotAvailable.full_day)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังจอง...' : 'จองห้องประชุม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}