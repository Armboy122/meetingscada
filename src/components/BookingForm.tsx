import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Trash2, Check, ArrowLeft } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useCreateBooking, useBookings } from '../hooks/useBookings';
import { useRooms } from '../hooks/useRooms';
import { bookingFormInputSchema, type BookingFormInputData, type BookingFormData } from '../schemas';
import { formatDateLong, formatForInput } from '../lib/utils';
import type { TimeSlot } from '../types';

interface BookingFormProps {
  selectedDate: Date | null;
  selectedRoomId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BookingDay {
  date: string;
  timeSlot: TimeSlot;
}

export function BookingForm({ selectedDate, selectedRoomId, isOpen, onClose, onSuccess }: BookingFormProps) {
  const { data: rooms = [] } = useRooms();
  const createBooking = useCreateBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingDays, setBookingDays] = useState<BookingDay[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  
  // ดึงข้อมูลการจองสำหรับห้องที่เลือก
  const { data: existingBookings = [] } = useBookings({ roomId: selectedRoomId });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<BookingFormInputData>({
    resolver: zodResolver(bookingFormInputSchema),
    defaultValues: {
      roomId: selectedRoomId,
      needBreak: 'false',
      dates: [],
      department: '',
      bookerName: '',
      phoneNumber: '',
      meetingTitle: '',
      timeSlot: 'morning' as const,
    },
  });

  const needBreak = watch('needBreak');

  // Update roomId when selectedRoomId prop changes
  useEffect(() => {
    setValue('roomId', selectedRoomId);
  }, [selectedRoomId, setValue]);

  // ตรวจสอบช่วงเวลาที่จองไปแล้วในวันที่เลือก
  const getBookedTimeSlotsForDate = useCallback((dateString: string) => {
    const bookedSlots: string[] = [];

    existingBookings.forEach(booking => {
      // ตรวจสอบเฉพาะสถานะ approved หรือ pending
      if (booking.status === 'approved' || booking.status === 'pending') {
        // ตรวจสอบว่าการจองนี้ตรงกับวันที่เลือกหรือไม่
        const bookingDates = booking.dates || [];
        const hasMatchingDate = bookingDates.some(date => 
          format(new Date(date), 'yyyy-MM-dd') === dateString
        );
        
        if (hasMatchingDate) {
          bookedSlots.push(booking.timeSlot);
        }
      }
    });

    return bookedSlots;
  }, [existingBookings]);

  // ตรวจสอบว่าช่วงเวลาใดใช้ได้สำหรับวันที่กำหนด
  const isTimeSlotAvailableForDate = useCallback((dateString: string, timeSlot: TimeSlot) => {
    const bookedSlots = getBookedTimeSlotsForDate(dateString);
    
    if (bookedSlots.length === 0) return true;

    const hasFullDay = bookedSlots.includes('full_day');
    const hasMorning = bookedSlots.includes('morning');
    const hasAfternoon = bookedSlots.includes('afternoon');

    // ถ้ามีการจองเต็มวัน ช่วงเวลาอื่นจะไม่ว่าง
    if (hasFullDay) return false;

    // ถ้าต้องการจองเต็มวัน แต่มีการจองช่วงเช้าหรือบ่าย
    if (timeSlot === 'full_day' && (hasMorning || hasAfternoon)) return false;

    // ถ้าต้องการจองช่วงเช้า แต่มีการจองช่วงเช้าแล้ว
    if (timeSlot === 'morning' && hasMorning) return false;

    // ถ้าต้องการจองช่วงบ่าย แต่มีการจองช่วงบ่ายแล้ว
    if (timeSlot === 'afternoon' && hasAfternoon) return false;

    return true;
  }, [getBookedTimeSlotsForDate]);

  // ฟังก์ชันหา default time slot ที่ยังว่าง
  const getDefaultTimeSlot = useCallback((dateString: string): TimeSlot => {
    if (isTimeSlotAvailableForDate(dateString, 'morning')) return 'morning';
    if (isTimeSlotAvailableForDate(dateString, 'afternoon')) return 'afternoon';
    if (isTimeSlotAvailableForDate(dateString, 'full_day')) return 'full_day';
    return 'morning'; // fallback
  }, [isTimeSlotAvailableForDate]);

  // Initialize booking days when modal opens
  useEffect(() => {
    if (isOpen && selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const initialDay: BookingDay = {
        date: dateString,
        timeSlot: getDefaultTimeSlot(dateString)
      };
      setBookingDays([initialDay]);
      setValue('dates', [initialDay.date]);
      setShowConfirmation(false);
      setFormData(null);
    }
  }, [isOpen, selectedDate, setValue, getDefaultTimeSlot]);

  // เพิ่มวันใหม่
  const addBookingDay = () => {
    const lastDate = bookingDays.length > 0 ? bookingDays[bookingDays.length - 1].date : format(selectedDate || new Date(), 'yyyy-MM-dd');
    const nextDate = format(addDays(new Date(lastDate), 1), 'yyyy-MM-dd');
    
    const newDay: BookingDay = {
      date: nextDate,
      timeSlot: getDefaultTimeSlot(nextDate)
    };
    
    const updatedDays = [...bookingDays, newDay];
    setBookingDays(updatedDays);
    setValue('dates', updatedDays.map(day => day.date));
  };

  // ลบวัน
  const removeBookingDay = (index: number) => {
    if (bookingDays.length > 1) {
      const updatedDays = bookingDays.filter((_, i) => i !== index);
      setBookingDays(updatedDays);
      setValue('dates', updatedDays.map(day => day.date));
    }
  };

  // อัปเดตวันที่
  const updateBookingDay = (index: number, field: keyof BookingDay, value: string) => {
    const updatedDays = bookingDays.map((day, i) => 
      i === index ? { ...day, [field]: value } : day
    );
    setBookingDays(updatedDays);
    setValue('dates', updatedDays.map(day => day.date));
  };

  // ฟังก์ชันสำหรับแสดงชื่อช่วงเวลา
  const getTimeSlotLabel = (timeSlot: TimeSlot) => {
    switch (timeSlot) {
      case 'morning': return 'เช้า (08:30-12:00)';
      case 'afternoon': return 'บ่าย (13:00-17:00)';
      case 'full_day': return 'เต็มวัน (08:30-17:00)';
      default: return timeSlot;
    }
  };

  // ฟังก์ชันสำหรับแสดงชื่อห้อง
  const getRoomName = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? `${room.roomName} (${room.capacity} ที่นั่ง)` : 'ไม่พบห้องประชุม';
  };

  // ฟังก์ชันสำหรับยืนยันการจอง
  const handleFormSubmit = async (data: BookingFormInputData) => {
    console.log('Form submitted with data:', data);
    console.log('Booking days:', bookingDays);
    setSubmitError(null);
    
    try {
      // ตรวจสอบว่ามี bookingDays
      if (bookingDays.length === 0) {
        throw new Error('กรุณาเลือกวันที่จอง');
      }

      // ตรวจสอบว่าทุกวันที่เลือกช่วงเวลาใช้ได้
      for (const day of bookingDays) {
        if (!isTimeSlotAvailableForDate(day.date, day.timeSlot)) {
          throw new Error(`ช่วงเวลาที่เลือกในวันที่ ${format(new Date(day.date), 'dd/MM/yyyy')} ไม่ว่าง`);
        }
      }

      // แปลงค่า needBreak เป็น boolean และรวมหน่วยงานกับชื่อผู้จอง
      const processedData: BookingFormData = {
        ...data,
        bookerName: `${data.bookerName} (${data.department})`, // รวมหน่วยงานเข้ากับชื่อ
        needBreak: data.needBreak === 'true',
        timeSlot: bookingDays[0].timeSlot, // ใช้ timeSlot จาก bookingDays แทน
        // ปรับ breakDetails ให้ใส่หน่วยงานจัดเบรคข้างหน้า
        breakDetails: data.needBreak === 'true' && data.breakOrganizer 
          ? `${data.breakOrganizer} ${data.breakDetails || ''}`.trim()
          : data.breakDetails || ''
      };
      
      console.log('Processed data:', processedData);
      setFormData(processedData);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error validating booking:', error);
      setSubmitError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
    }
  };

  // ฟังก์ชันสำหรับจองจริง
  const handleConfirmBooking = async () => {
    if (!formData) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // สร้างการจองสำหรับแต่ละวันที่เลือก
      for (const day of bookingDays) {
        const bookingData: BookingFormData = {
          ...formData,
          timeSlot: day.timeSlot,
          dates: [day.date],
          // needBreak ได้แปลงเป็น boolean แล้วใน handleFormSubmit
          needBreak: formData.needBreak,
        };
        
        await createBooking.mutateAsync(bookingData);
      }
      
      onSuccess();
      reset();
      setBookingDays([]);
      setShowConfirmation(false);
      setFormData(null);
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      setSubmitError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการจอง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ฟังก์ชันสำหรับกลับไปแก้ไข
  const handleBackToEdit = () => {
    setShowConfirmation(false);
    setFormData(null);
    setSubmitError(null);
  };

  if (!isOpen || !selectedDate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {showConfirmation ? 'ยืนยันการจอง' : 'จองห้องประชุม'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showConfirmation ? (
          // หน้ายืนยันการจอง
          <div className="space-y-4">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">กรุณาตรวจสอบข้อมูลการจอง</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ชื่อผู้จอง</label>
                    <p className="text-sm text-gray-900">{formData?.bookerName} ({formData?.department})</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                    <p className="text-sm text-gray-900">{formData?.phoneNumber}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">หัวข้อการประชุม</label>
                  <p className="text-sm text-gray-900">{formData?.meetingTitle}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">ห้องประชุม</label>
                  <p className="text-sm text-gray-900">{getRoomName(Number(formData?.roomId) || 0)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">วันที่และช่วงเวลา</label>
                  <div className="mt-1 space-y-2">
                    {bookingDays.map((day, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded border">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDateLong(day.date)}
                        </span>
                        <span className="text-sm text-gray-600">-</span>
                        <span className="text-sm text-blue-600 font-medium">
                          {getTimeSlotLabel(day.timeSlot)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">อาหารว่าง</label>
                  <p className="text-sm text-gray-900">{formData?.needBreak ? 'รับ' : 'ไม่รับ'}</p>
                  {formData?.needBreak && (
                    <>
                      {formData?.breakOrganizer && (
                        <p className="text-sm text-blue-600 mt-1 font-medium">
                          ผู้จัด: {formData.breakOrganizer}
                        </p>
                      )}
                      {formData?.breakDetails && (
                        <p className="text-sm text-gray-600 mt-1">
                          รายละเอียด: {formData.breakDetails}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={handleBackToEdit}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                แก้ไข
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                <Check className="w-4 h-4 mr-2" />
                {isSubmitting ? 'กำลังจอง...' : 'ยืนยันการจอง'}
              </button>
            </div>
          </div>
        ) : (
          // หน้าฟอร์มจอง
          <form onSubmit={handleSubmit(handleFormSubmit, (errors) => {
            console.log('Form validation errors:', errors);
            setSubmitError('กรุณากรอกข้อมูลให้ครบถ้วน');
          })} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}
            
            {Object.keys(errors).length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 font-medium">กรุณาแก้ไขข้อผิดพลาดต่อไปนี้:</p>
                <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key}>{error?.message}</li>
                  ))}
                </ul>
              </div>
            )}
            
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
                หน่วยงาน *
              </label>
              <input
                type="text"
                {...register('department', { required: 'กรุณากรอกหน่วยงาน' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น สำนักงานเลขาธิการ"
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
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
                  value: /^(\d{5}|\d{10,})$/,
                  message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 5 หลัก (เบอร์ภายใน) หรือ 10 หลักขึ้นไป'
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
                {...register('roomId', { 
                  required: 'กรุณาเลือกห้องประชุม',
                  valueAsNumber: true
                })}
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  วันที่และช่วงเวลาที่ต้องการจอง *
                </label>
                <button
                  type="button"
                  onClick={addBookingDay}
                  className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  เพิ่มวัน
                </button>
              </div>
              
              <div className="space-y-3">
                {bookingDays.map((day, index) => {
                  const bookedSlots = getBookedTimeSlotsForDate(day.date);
                  const isDateBooked = bookedSlots.length > 0;
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">วันที่ {index + 1}</h4>
                        {bookingDays.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBookingDay(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            วันที่
                          </label>
                          <input
                            type="date"
                            value={day.date}
                            onChange={(e) => updateBookingDay(index, 'date', e.target.value)}
                            min={formatForInput(new Date())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ช่วงเวลา
                          </label>
                          <select
                            value={day.timeSlot}
                            onChange={(e) => updateBookingDay(index, 'timeSlot', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option 
                              value="morning" 
                              disabled={!isTimeSlotAvailableForDate(day.date, 'morning')}
                            >
                              เช้า (08:30-12:00) {!isTimeSlotAvailableForDate(day.date, 'morning') ? '- จองแล้ว' : ''}
                            </option>
                            <option 
                              value="afternoon" 
                              disabled={!isTimeSlotAvailableForDate(day.date, 'afternoon')}
                            >
                              บ่าย (13:00-17:00) {!isTimeSlotAvailableForDate(day.date, 'afternoon') ? '- จองแล้ว' : ''}
                            </option>
                            <option 
                              value="full_day" 
                              disabled={!isTimeSlotAvailableForDate(day.date, 'full_day')}
                            >
                              เต็มวัน (08:30-17:00) {!isTimeSlotAvailableForDate(day.date, 'full_day') ? '- จองแล้ว' : ''}
                            </option>
                          </select>
                        </div>
                      </div>
                      
                      {isDateBooked && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>ข้อมูลการจอง:</strong> วันนี้มีการจองไปแล้วในช่วงเวลา{' '}
                            {bookedSlots.map(slot => {
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
                  );
                })}
              </div>
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

            {String(needBreak) === 'true' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หน่วยงานผู้จัดเบรค *
                  </label>
                  <select
                    {...register('breakOrganizer')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">เลือกหน่วยงานผู้จัดเบรค</option>
                    <option value="ฝปบ.">ฝปบ.</option>
                    <option value="กบษ.">กบษ.</option>
                    <option value="กปบ.">กปบ.</option>
                    <option value="กสฟ.">กสฟ.</option>
                  </select>
                  {errors.breakOrganizer && (
                    <p className="mt-1 text-sm text-red-600">{errors.breakOrganizer.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียดอาหารที่ต้องการ
                  </label>
                  <textarea
                    {...register('breakDetails')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น พักเที่ยง 12:00-13:00, ขนมและเครื่องดื่ม"
                  />
                </div>
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
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                จองห้องประชุม ({bookingDays.length} วัน)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}