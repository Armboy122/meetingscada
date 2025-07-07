export interface HistoryItem {
  id: number;
  bookingId: number;
  bookingCode: string;
  bookerName: string;
  phoneNumber: string;
  meetingTitle: string;
  roomName: string;
  timeSlot: string;
  action: 'created' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  actionDate: string;
  adminId?: number;
  adminName?: string;
  adminUsername?: string;
  actionBy: 'user' | 'admin';
  currentStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

export interface BookingHistoryItem {
  id: number;
  action: 'created' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  actionDate: string;
  adminId?: number;
  adminName?: string;
  adminUsername?: string;
  actionBy: 'user' | 'admin';
}

export interface BookingHistoryResponse {
  bookingId: number;
  bookingCode: string;
  bookerName: string;
  currentStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
  history: BookingHistoryItem[];
}

export interface HistoryResponse {
  history: HistoryItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  filters: {
    action?: string;
    adminId?: number;
  };
}

export interface HistorySummary {
  actionSummary: Array<{
    action: string;
    count: number;
  }>;
  topAdmins: Array<{
    adminId: number;
    adminName: string;
    adminUsername: string;
    totalActions: number;
  }>;
  recentActivity: Array<{
    date: string;
    action: string;
    count: number;
  }>;
}

export interface HealthCheckResponse {
  version: string;
  timestamp: string;
}