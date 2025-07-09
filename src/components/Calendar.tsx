import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBookings } from '../hooks/useBookings';
import { cn } from '../lib/utils';
import type { Booking } from '../types';

interface CalendarProps {
  selectedRoomId: number;
  onDateClick: (date: Date) => void;
  onBookingClick: (booking: Booking) => void;
}

export function Calendar({ selectedRoomId, onDateClick, onBookingClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: bookings = [] } = useBookings({ roomId: selectedRoomId });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // วันอาทิตย์เป็นต้นสัปดาห์
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    if (bookings && Array.isArray(bookings)) {
      // กรองเฉพาะการจองที่ approved และ pending (ไม่เอา rejected)
      const validBookings = bookings.filter((booking: Booking) => 
        booking.status === 'approved' || booking.status === 'pending'
      );
      
      validBookings.forEach((booking: Booking) => {
        // ใช้ dates array จาก Backend (เป็น string array)
        if (booking.dates && Array.isArray(booking.dates) && booking.dates.length > 0) {
          booking.dates.forEach((date) => {
            const dateKey = format(new Date(date), 'yyyy-MM-dd');
            if (!map.has(dateKey)) {
              map.set(dateKey, []);
            }
            map.get(dateKey)?.push(booking);
          });
        }
      });
    }
    return map;
  }, [bookings]);

  const getBookingsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return bookingsByDate.get(dateKey) || [];
  };

  // ตรวจสอบว่าช่วงเวลาไหนยังจองได้
  const getAvailableTimeSlots = (date: Date) => {
    const dayBookings = getBookingsForDate(date);
    
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



  const getRoomAvailabilityStatus = (date: Date) => {
    const dayBookings = getBookingsForDate(date);
    
    if (dayBookings.length === 0) {
      return 'available'; // ว่างทั้งวัน
    }

    const hasFullDay = dayBookings.some(booking => booking.timeSlot === 'full_day');
    if (hasFullDay) {
      return 'full'; // มีการจองเต็มวัน
    }

    const hasMorning = dayBookings.some(booking => booking.timeSlot === 'morning');
    const hasAfternoon = dayBookings.some(booking => booking.timeSlot === 'afternoon');
    
    if (hasMorning && hasAfternoon) {
      return 'full'; // มีการจองทั้งเช้าและบ่าย
    }

    return 'partial'; // มีการจองครึ่งวัน
  };

  const getAvailabilityColor = (date: Date) => {
    const status = getRoomAvailabilityStatus(date);
    
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300'; // เขียว - ว่างทั้งวัน
      case 'partial':
        return 'bg-yellow-100 border-yellow-300'; // เหลือง - จองครึ่งวัน
      case 'full':
        return 'bg-red-100 border-red-300'; // แดง - เต็ม
      default:
        return '';
    }
  };

  const renderBookingIndicator = (date: Date) => {
    const dayBookings = getBookingsForDate(date);
    const availableSlots = getAvailableTimeSlots(date);
    
    if (dayBookings.length === 0) {
      return (
        <div className="text-center text-green-600 font-bold text-xs md:text-sm">
          ว่าง
        </div>
      );
    }

    if (availableSlots.length === 0) {
      return (
        <div className="text-center text-red-600 font-bold text-xs md:text-sm">
          เต็ม
        </div>
      );
    }

    // แสดงรายละเอียดครึ่งวัน
    const bookedSlots = dayBookings.map(booking => booking.timeSlot);
    const hasMorning = bookedSlots.includes('morning');
    const hasAfternoon = bookedSlots.includes('afternoon');
    const hasFullDay = bookedSlots.includes('full_day');

    if (hasFullDay) {
      return (
        <div className="text-center text-red-600 font-bold text-xs md:text-sm">
          เต็มวัน
        </div>
      );
    }

    return (
      <div className="text-center text-xs md:text-sm">
        <div className={`font-bold ${hasMorning ? 'text-red-600' : 'text-green-600'}`}>
          {hasMorning ? '🔴 เช้า' : '🟢 เช้า'}
        </div>
        <div className={`font-bold ${hasAfternoon ? 'text-red-600' : 'text-green-600'}`}>
          {hasAfternoon ? '🔴 บ่าย' : '🟢 บ่าย'}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100/50 p-4 md:p-8">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-2xl font-semibold text-slate-800">
          {format(currentDate, 'MMMM yyyy', { locale: th })}
        </h2>
        <div className="flex space-x-1">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 md:p-3 rounded-xl hover:bg-purple-50 transition-colors duration-200 text-slate-600 hover:text-purple-600 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 md:p-3 rounded-xl hover:bg-purple-50 transition-colors duration-200 text-slate-600 hover:text-purple-600 active:scale-95"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3">
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
          <div key={day} className="py-2 md:py-3 px-1 text-center text-sm md:text-base font-black text-slate-800 bg-purple-100 rounded-lg border border-purple-200">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map(day => (
          <div
            key={day.toString()}
            className={cn(
              'aspect-square md:min-h-[130px] p-1 md:p-3 rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 border hover:shadow-lg active:scale-95 touch-manipulation flex flex-col',
              isSameMonth(day, currentDate) 
                ? `bg-white text-slate-900 hover:shadow-xl ${getAvailabilityColor(day)}` 
                : 'bg-gray-50 text-slate-500 opacity-60 hover:bg-gray-100 border-slate-300'
            )}
            onClick={() => {
              const availableSlots = getAvailableTimeSlots(day);
              const dayBookings = getBookingsForDate(day);
              
              if (availableSlots.length > 0) {
                // ถ้ายังมีช่วงเวลาว่าง ให้เปิดฟอร์มจองใหม่
                onDateClick(day);
              } else if (dayBookings.length > 0) {
                // ถ้าเต็มแล้ว ให้แสดงรายละเอียดการจองแรก
                onBookingClick(dayBookings[0]);
              } else {
                // ถ้าไม่มีการจอง ให้เปิดฟอร์มจอง
                onDateClick(day);
              }
            }}
          >
            <div className="text-xs md:text-sm font-light text-center mb-1">
              {format(day, 'd')}
            </div>
            <div className="flex-1 flex items-center justify-center">
              {renderBookingIndicator(day)}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm bg-white rounded-2xl p-3 sm:p-4 border border-purple-200 shadow-sm">
        <div className="flex items-center justify-center sm:justify-start">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
          <span className="text-slate-700 font-bold">🟢 ว่างทั้งวัน</span>
        </div>
        <div className="flex items-center justify-center sm:justify-start">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
          <span className="text-slate-700 font-bold">🟡 จองครึ่งวัน</span>
        </div>
        <div className="flex items-center justify-center sm:justify-start">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
          <span className="text-slate-700 font-bold">🔴 เต็ม</span>
        </div>
      </div>
    </div>
  );
}