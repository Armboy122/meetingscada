import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { BookingFormData, ApprovalData } from '../types';

export function useBookings(params?: { status?: string; roomId?: number }) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const response = await apiClient.getBookings(params);
      return response.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // refetch every minute
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const response = await apiClient.getBooking(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BookingFormData) => apiClient.createBooking(data),
    onSuccess: () => {
      // Invalidate all booking-related queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Also refetch immediately to update the UI
      queryClient.refetchQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingFormData }) => 
      apiClient.updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useApproveBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApprovalData }) => 
      apiClient.approveBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApprovalData }) => 
      apiClient.rejectBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useResetBookingToPending() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.resetBookingToPending(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}