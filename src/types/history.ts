export interface HistoryItem {
  id: number;
  bookingId: number;
  adminId: number;
  action: 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  createdAt: string;
  booking?: {
    bookingCode: string;
    bookerName: string;
    roomName: string;
  };
  admin?: {
    fullName: string;
  };
}

export interface HistoryResponse {
  data: HistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface HistorySummary {
  actionSummary: Array<{
    action: string;
    count: number;
  }>;
  topAdmins: Array<{
    adminId: number;
    adminName: string;
    totalActions: number;
  }>;
  recentActivity: Array<{
    date: string;
    action: string;
    count: number;
  }>;
}