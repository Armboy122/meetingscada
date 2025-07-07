import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export function useBookingHistory(id: number) {
  return useQuery({
    queryKey: ['booking-history', id],
    queryFn: async () => {
      const response = await apiClient.getBookingHistory(id);
      return response.data || [];
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useHistory(params?: {
  limit?: number;
  offset?: number;
  action?: string;
  adminId?: number;
}) {
  return useQuery({
    queryKey: ['history', params],
    queryFn: async () => {
      const response = await apiClient.getHistory(params);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useHistorySummary() {
  return useQuery({
    queryKey: ['history-summary'],
    queryFn: async () => {
      const response = await apiClient.getHistorySummary();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

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