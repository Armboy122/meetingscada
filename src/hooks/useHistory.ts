import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { HistoryResponse, HistorySummary, BookingHistoryResponse } from '../types/history';

interface HistoryFilters {
  limit?: number;
  offset?: number;
  action?: string;
  adminId?: number;
}

export const useHistory = (filters: HistoryFilters = {}) => {
  return useQuery<HistoryResponse | undefined>({
    queryKey: ['history', filters],
    queryFn: async () => {
      const response = await apiClient.getHistory(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useHistorySummary = () => {
  return useQuery<HistorySummary | undefined>({
    queryKey: ['history-summary'],
    queryFn: async () => {
      const response = await apiClient.getHistorySummary();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useBookingHistory = (bookingId: number) => {
  return useQuery<BookingHistoryResponse | undefined>({
    queryKey: ['booking-history', bookingId],
    queryFn: async () => {
      const response = await apiClient.getBookingHistory(bookingId);
      return response.data;
    },
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health-check'],
    queryFn: async () => {
      const response = await apiClient.healthCheck();
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
  });
} 