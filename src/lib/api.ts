import type { APIResponse, MeetingRoom, Booking, BookingFormData, ApprovalData } from '../types';
import type { HistoryItem, HistoryResponse, HistorySummary } from '../types/history';

const API_BASE_URL = '/api';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Rooms API
  async getRooms(): Promise<APIResponse<MeetingRoom[]>> {
    return this.request<MeetingRoom[]>('/rooms');
  }

  async getRoom(id: number): Promise<APIResponse<MeetingRoom>> {
    return this.request<MeetingRoom>(`/rooms/${id}`);
  }

  // Bookings API
  async getBookings(params?: {
    status?: string;
    roomId?: number;
  }): Promise<APIResponse<Booking[]>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.roomId) searchParams.append('roomId', params.roomId.toString());
    
    const query = searchParams.toString();
    const endpoint = query ? `/bookings?${query}` : '/bookings';
    
    return this.request<Booking[]>(endpoint);
  }

  async getBooking(id: number): Promise<APIResponse<Booking>> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async createBooking(data: BookingFormData): Promise<APIResponse<Booking>> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBooking(id: number, data: BookingFormData): Promise<APIResponse<Booking>> {
    return this.request<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBooking(id: number): Promise<APIResponse<void>> {
    return this.request<void>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  // Approval API
  async approveBooking(id: number, data: ApprovalData): Promise<APIResponse<Booking>> {
    return this.request<Booking>(`/bookings/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectBooking(id: number, data: ApprovalData): Promise<APIResponse<Booking>> {
    return this.request<Booking>(`/bookings/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookingStatus(id: number): Promise<APIResponse<Booking>> {
    return this.request<Booking>(`/bookings/${id}/status`);
  }

  // History API
  async getBookingHistory(id: number): Promise<APIResponse<HistoryItem[]>> {
    return this.request<HistoryItem[]>(`/${id}/history`);
  }

  async getHistory(params?: {
    limit?: number;
    offset?: number;
    action?: string;
    adminId?: number;
  }): Promise<APIResponse<HistoryResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.action) searchParams.append('action', params.action);
    if (params?.adminId) searchParams.append('adminId', params.adminId.toString());
    
    const query = searchParams.toString();
    const endpoint = query ? `/history?${query}` : '/history';
    
    return this.request<HistoryResponse>(endpoint);
  }

  async getHistorySummary(): Promise<APIResponse<HistorySummary>> {
    return this.request<HistorySummary>('/history/summary');
  }
}

export const apiClient = new APIClient(API_BASE_URL);