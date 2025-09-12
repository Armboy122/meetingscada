import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';

// ฟังก์ชันสำหรับ format วันที่ในรูปแบบ dd/MM/yyyy
export function formatDate(date: string | Date, formatString: string = 'dd/MM/yyyy'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatString, { locale: th });
}

// ฟังก์ชันสำหรับ format วันที่และเวลาในรูปแบบ dd/MM/yyyy HH:mm
export function formatDateTime(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy HH:mm', { locale: th });
}

// ฟังก์ชันสำหรับ format วันที่แบบยาวในภาษาไทย (เช่น "15 มกราคม 2567")
export function formatDateLong(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd MMMM yyyy', { locale: th });
}

// ฟังก์ชันสำหรับ format เฉพาะเดือนปี (เช่น "มกราคม 2567")
export function formatMonthYear(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'MMMM yyyy', { locale: th });
}

// ฟังก์ชันสำหรับแปลงเป็น ISO date string สำหรับ input[type="date"]
export function formatForInput(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'yyyy-MM-dd');
}

// ฟังก์ชันสำหรับแปลงเป็น format ที่ใช้ในระบบ (yyyy-MM-dd)
export function formatSystemDate(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'yyyy-MM-dd');
}

export function getTimeSlotLabel(timeSlot: string): string {
  switch (timeSlot) {
    case 'morning':
      return 'เช้า (08:30-12:00)';
    case 'afternoon':
      return 'บ่าย (13:00-17:00)';
    case 'full_day':
      return 'เต็มวัน (08:30-17:00)';
    default:
      return timeSlot;
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'รออนุมัติ';
    case 'approved':
      return 'อนุมัติแล้ว';
    case 'rejected':
      return 'ปฏิเสธ';
    case 'cancelled':
      return 'ยกเลิก';
    default:
      return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Daily Overview Utilities
import type { Booking, MeetingRoom, DailyMeeting, DailyStats, DailyOverviewData } from '../types';

export function convertBookingToDailyMeeting(booking: Booking, rooms: MeetingRoom[]): DailyMeeting {
  const room = rooms.find(r => r.id === booking.roomId);
  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    timeSlot: booking.timeSlot,
    roomName: booking.roomName || room?.roomName || `ห้อง ${booking.roomId}`,
    roomId: booking.roomId,
    capacity: room?.capacity,
    meetingTitle: booking.meetingTitle,
    bookerName: booking.bookerName,
    phoneNumber: booking.phoneNumber,
    needBreak: booking.needBreak,
    breakDetails: booking.breakDetails,
    breakOrganizer: booking.breakOrganizer,
    department: booking.department,
    status: booking.status,
    dates: booking.dates || [booking.createdAt],
    createdAt: booking.createdAt,
  };
}

export function filterBookingsForDate(bookings: Booking[], targetDate: string): Booking[] {
  return bookings.filter(booking => {
    if (booking.dates && booking.dates.length > 0) {
      return booking.dates.some(date => formatSystemDate(date) === targetDate);
    }
    return formatSystemDate(booking.createdAt) === targetDate;
  });
}

export function calculateDailyStats(meetings: DailyMeeting[], totalRooms: number): DailyStats {
  const uniqueRooms = new Set(meetings.map(m => m.roomId));
  
  return {
    totalMeetings: meetings.length,
    roomsInUse: uniqueRooms.size,
    totalRooms: totalRooms,
    totalAttendees: meetings.reduce((sum, meeting) => sum + (meeting.capacity || 0), 0),
    pendingApprovals: meetings.filter(m => m.status === 'pending').length,
    breakRequests: meetings.filter(m => m.needBreak).length,
  };
}

export function processDailyOverview(
  bookings: Booking[], 
  rooms: MeetingRoom[], 
  targetDate: string
): DailyOverviewData {
  const dayBookings = filterBookingsForDate(bookings, targetDate);
  const meetings = dayBookings.map(booking => convertBookingToDailyMeeting(booking, rooms));
  const stats = calculateDailyStats(meetings, rooms.filter(r => r.isActive).length);
  
  // Sort meetings by time slot and room name
  meetings.sort((a, b) => {
    const timeOrder = { morning: 1, afternoon: 2, full_day: 3 };
    if (timeOrder[a.timeSlot] !== timeOrder[b.timeSlot]) {
      return timeOrder[a.timeSlot] - timeOrder[b.timeSlot];
    }
    return a.roomName.localeCompare(b.roomName);
  });
  
  return {
    date: targetDate,
    meetings,
    stats,
  };
}