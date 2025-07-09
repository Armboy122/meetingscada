import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';

export function formatDate(date: string | Date, formatString: string = 'dd/MM/yyyy'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatString, { locale: th });
}

export function formatDateTime(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy HH:mm', { locale: th });
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