export interface MeetingRoom {
  id: number;
  roomName: string;
  capacity: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  id: number;
  bookingCode: string;
  bookerName: string;
  phoneNumber: string;
  meetingTitle: string;
  roomId: number;
  roomName?: string; // เพิ่ม field จาก backend
  room?: MeetingRoom;
  timeSlot: 'morning' | 'afternoon' | 'full_day';
  needBreak: boolean;
  breakDetails?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  dates?: string[]; // แก้ไขเป็น array ของ string แทน BookingDate[]
}

export interface BookingDate {
  id: number;
  bookingId: number;
  bookingDate: string;
  createdAt: string;
}

export interface BookingHistory {
  id: number;
  bookingId: number;
  adminId: number;
  action: 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  createdAt: string;
}

export interface Admin {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export type TimeSlot = 'morning' | 'afternoon' | 'full_day';

export interface BookingFormData {
  bookerName: string;
  phoneNumber: string;
  meetingTitle: string;
  roomId: number;
  timeSlot: TimeSlot;
  needBreak: boolean;
  breakDetails?: string;
  dates: string[];
}

export interface ApprovalData {
  adminId: number;
  reason?: string;
}