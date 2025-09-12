import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useRooms } from '../hooks/useRooms';
import { bookingFormInputSchema, type BookingFormInputData, type BookingFormData } from '../schemas';
import { formatForInput } from '../lib/utils';
import type { Booking, TimeSlot } from '../types';

interface EditBookingModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BookingFormData) => Promise<void>;
}

interface BookingDay {
  date: string;
  timeSlot: TimeSlot;
}

export function EditBookingModal({ booking, isOpen, onClose, onSave }: EditBookingModalProps) {
  const { data: rooms = [] } = useRooms();
  const [isLoading, setIsLoading] = useState(false);
  const [bookingDays, setBookingDays] = useState<BookingDay[]>([]);
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<BookingFormInputData>({
    resolver: zodResolver(bookingFormInputSchema)
  });

  useEffect(() => {
    if (booking && isOpen) {
      // Set form values from booking data
      setValue('bookerName', booking.bookerName);
      setValue('phoneNumber', booking.phoneNumber);
      setValue('meetingTitle', booking.meetingTitle || '');
      setValue('roomId', booking.roomId);
      setValue('department', booking.department || '');
      setValue('needBreak', booking.needBreak ? 'true' : 'false');
      setValue('breakDetails', booking.breakDetails || '');
      setValue('breakOrganizer', booking.breakOrganizer || '');
      
      // Set booking dates and time slots
      if (booking.dates && booking.dates.length > 0) {
        // สร้าง BookingDay array จากข้อมูลเดิม
        const days: BookingDay[] = booking.dates.map(date => ({
          date: format(new Date(date), 'yyyy-MM-dd'),
          timeSlot: booking.timeSlot
        }));
        setBookingDays(days);
        setValue('dates', booking.dates);
        setValue('timeSlot', booking.timeSlot);
      } else {
        // ถ้าไม่มี dates array ให้ใช้วันปัจจุบัน
        const defaultDay: BookingDay = {
          date: format(new Date(), 'yyyy-MM-dd'),
          timeSlot: booking.timeSlot
        };
        setBookingDays([defaultDay]);
        setValue('dates', [defaultDay.date]);
        setValue('timeSlot', booking.timeSlot);
      }
    }
  }, [booking, isOpen, setValue]);

  // ฟังก์ชันสำหรับจัดการ bookingDays
  const addBookingDay = () => {
    const lastDate = bookingDays.length > 0 ? bookingDays[bookingDays.length - 1].date : format(new Date(), 'yyyy-MM-dd');
    const nextDate = format(addDays(new Date(lastDate), 1), 'yyyy-MM-dd');
    
    const newDay: BookingDay = {
      date: nextDate,
      timeSlot: 'morning' // default time slot
    };
    
    const updatedDays = [...bookingDays, newDay];
    setBookingDays(updatedDays);
    setValue('dates', updatedDays.map(day => day.date));
  };

  const removeBookingDay = (index: number) => {
    if (bookingDays.length > 1) {
      const updatedDays = bookingDays.filter((_, i) => i !== index);
      setBookingDays(updatedDays);
      setValue('dates', updatedDays.map(day => day.date));
    }
  };

  const updateBookingDay = (index: number, field: keyof BookingDay, value: string) => {
    const updatedDays = bookingDays.map((day, i) => 
      i === index ? { ...day, [field]: value } : day
    );
    setBookingDays(updatedDays);
    setValue('dates', updatedDays.map(day => day.date));
  };

  const onSubmit = async (data: BookingFormInputData) => {
    setIsLoading(true);
    try {
      // แปลง BookingFormInputData เป็น BookingFormData
      const processedData: BookingFormData = {
        ...data,
        needBreak: data.needBreak === 'true',
        dates: bookingDays.map(day => day.date),
        timeSlot: bookingDays[0]?.timeSlot || 'morning'
      };
      
      // Debug: แสดงข้อมูลที่กำลังจะส่ง
      console.log('EditBookingModal - Sending data:', {
        originalBooking: booking,
        formData: data,
        bookingDays: bookingDays
      });
      
      await onSave(processedData);
      reset();
      onClose();
    } catch (error) {
      console.error('Error updating booking:', error);
      // แสดง error message ให้ผู้ใช้เห็น
      alert(`เกิดข้อผิดพลาดในการบันทึก: ${error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'}`);
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
                หน่วยงาน *
              </label>
              <input
                type="text"
                {...register('department', { required: 'กรุณากรอกหน่วยงาน' })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 text-sm sm:text-base"
                placeholder="เช่น สำนักงานเลขาธิการ"
              />
              {errors.department && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">
                วันที่และช่วงเวลาที่ต้องการจอง *
              </label>
              <button
                type="button"
                onClick={addBookingDay}
                className="flex items-center px-3 py-1 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                เพิ่มวัน
              </button>
            </div>
            
            <div className="space-y-3">
              {bookingDays.map((day, index) => (
                <div key={index} className="p-4 border border-purple-200 rounded-xl bg-purple-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        วันที่ {index + 1}
                      </label>
                      <input
                        type="date"
                        value={day.date}
                        onChange={(e) => updateBookingDay(index, 'date', e.target.value)}
                        min={formatForInput(new Date())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ช่วงเวลา
                      </label>
                      <select
                        value={day.timeSlot}
                        onChange={(e) => updateBookingDay(index, 'timeSlot', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="morning">เช้า (08:30-12:00)</option>
                        <option value="afternoon">บ่าย (13:00-17:00)</option>
                        <option value="full_day">เต็มวัน (08:30-17:00)</option>
                      </select>
                    </div>

                    <div className="flex justify-end">
                      {bookingDays.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBookingDay(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200"
                          title="ลบวันนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
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

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              หน่วยงานผู้จัดเบรค
            </label>
            <select
              {...register('breakOrganizer')}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 text-sm sm:text-base"
            >
              <option value="">เลือกหน่วยงานผู้จัดเบรค</option>
              <option value="ฝปบ.">ฝปบ.</option>
              <option value="กบษ.">กบษ.</option>
              <option value="กปบ.">กปบ.</option>
              <option value="กสฟ.">กสฟ.</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              รายละเอียดอาหารที่ต้องการ
            </label>
            <textarea
              {...register('breakDetails')}
              rows={3}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 text-sm sm:text-base"
              placeholder="เช่น พักเที่ยง 12:00-13:00, ขนมและเครื่องดื่ม"
            />
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