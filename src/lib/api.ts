import type { APIResponse, MeetingRoom, Booking, BookingFormData, ApprovalData, Admin } from '../types';
import type { HistoryResponse, HistorySummary, BookingHistoryResponse } from '../types/history';

// ใช้ proxy ในระหว่างการพัฒนา และ Cloudflare Workers URL ใน production
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://cfw-bun-hono-drizzle.apiarm.workers.dev';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    // ตรวจสอบ token จากทั้ง localStorage และ sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const requestOptions: RequestInit = {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    };

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, requestOptions);

        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
          // ลบ token จากทั้งสอง storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('adminData');
          localStorage.removeItem('loginTimestamp');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('adminData');
          sessionStorage.removeItem('loginTimestamp');
          window.location.href = '/';
          throw new Error('กรุณาเข้าสู่ระบบใหม่');
        }

        // Retry on 503 Service Unavailable
        if (response.status === 503 && i < retries - 1) {
          console.log(`Retrying request (${i + 1}/${retries}) after 503 error...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // exponential backoff
          continue;
        }

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // Fall back to generic error message if JSON parsing fails
          }
          
          throw new Error(errorMessage);
        }

        return response.json();
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        
        // Retry on network errors
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.log(`Retrying request (${i + 1}/${retries}) after network error...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // exponential backoff
          continue;
        }
        
        throw error;
      }
    }

    throw new Error('Maximum retries exceeded');
  }

  // Health Check API
  async healthCheck(): Promise<APIResponse<{ version: string; timestamp: string }>> {
    return this.request<{ version: string; timestamp: string }>('/');
  }

  // Authentication API
  async login(username: string, password: string): Promise<APIResponse<{ token: string; admin: Admin }>> {
    return this.request<{ token: string; admin: Admin }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getCurrentUser(): Promise<APIResponse<Admin>> {
    return this.request<Admin>('/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<APIResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Rooms API (GET endpoints are public, others require auth)
  async getRooms(): Promise<APIResponse<MeetingRoom[]>> {
    return this.request<MeetingRoom[]>('/rooms');
  }

  async getRoom(id: number): Promise<APIResponse<MeetingRoom>> {
    return this.request<MeetingRoom>(`/rooms/${id}`);
  }

  async createRoom(data: { roomName: string; capacity: number }): Promise<APIResponse<MeetingRoom>> {
    return this.request<MeetingRoom>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRoom(id: number, data: { roomName: string; capacity: number; isActive: boolean }): Promise<APIResponse<MeetingRoom>> {
    return this.request<MeetingRoom>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(id: number): Promise<APIResponse<void>> {
    return this.request<void>(`/rooms/${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings API (public access for creating, auth required for management)
  // Updated to fetch all bookings without backend filtering - filtering now done on frontend
  async getBookings(): Promise<APIResponse<Booking[]>> {
    return this.request<Booking[]>('/bookings');
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

  // Approval API (requires auth)
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

  // Reset booking status to pending
  async resetBookingToPending(id: number): Promise<APIResponse<Booking>> {
    return this.request<Booking>(`/bookings/${id}/reset`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async getBookingStatus(id: number): Promise<APIResponse<Booking>> {
    return this.request<Booking>(`/bookings/${id}/status`);
  }

  // Admins API (requires auth)
  async getAdmins(): Promise<APIResponse<Admin[]>> {
    return this.request<Admin[]>('/admins');
  }

  async getAdmin(id: number): Promise<APIResponse<Admin>> {
    return this.request<Admin>(`/admins/${id}`);
  }

  async createAdmin(data: { username: string; password: string; fullName: string; email: string }): Promise<APIResponse<Admin>> {
    return this.request<Admin>('/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdmin(id: number, data: { username: string; fullName: string; email: string; isActive: boolean }): Promise<APIResponse<Admin>> {
    return this.request<Admin>(`/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdmin(id: number): Promise<APIResponse<void>> {
    return this.request<void>(`/admins/${id}`, {
      method: 'DELETE',
    });
  }

  // History API (requires auth)
  async getBookingHistory(id: number): Promise<APIResponse<BookingHistoryResponse>> {
    return this.request<BookingHistoryResponse>(`/bookings/${id}/history`);
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