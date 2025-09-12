import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '../lib/api';
import { useRooms } from './useRooms';
import { processDailyOverview } from '../lib/utils';
import type { BookingFormData, ApprovalData, Booking } from '../types';

interface BookingsParams {
  status?: string;
  roomId?: number;
  timeSlot?: string;
  searchName?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Helper function for frontend filtering
function filterBookingsOnFrontend(bookings: Booking[], params?: BookingsParams): Booking[] {
  if (!params || !bookings?.length) return bookings || [];

  return bookings.filter(booking => {
    // Status filter
    if (params.status && booking.status !== params.status) {
      return false;
    }

    // Room filter
    if (params.roomId && booking.roomId !== params.roomId) {
      return false;
    }

    // Time slot filter
    if (params.timeSlot && booking.timeSlot !== params.timeSlot) {
      return false;
    }

    // Search name filter (case-insensitive)
    if (params.searchName && !booking.bookerName?.toLowerCase().includes(params.searchName.toLowerCase())) {
      return false;
    }

    // Date range filter
    const bookingDate = booking.dates?.[0] || booking.createdAt;
    if (params.dateFrom && bookingDate < params.dateFrom) {
      return false;
    }
    
    if (params.dateTo && bookingDate > params.dateTo) {
      return false;
    }

    return true;
  });
}

export function useBookings(params?: BookingsParams) {
  return useQuery({
    queryKey: ['bookings', 'all'], // Remove params from query key since we fetch all data
    queryFn: async () => {
      const response = await apiClient.getBookings(); // Fetch all bookings without filters
      return response.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // refetch every minute
    select: (data) => filterBookingsOnFrontend(data, params), // Apply frontend filtering
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
    onMutate: async (bookingId) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['bookings'] });

      // Snapshot the previous value
      const previousBookings = queryClient.getQueriesData({ queryKey: ['bookings'] });

      // Optimistically update to the new value
      queryClient.setQueriesData<Booking[]>({ queryKey: ['bookings'] }, (old) => {
        if (!old) return old;
        return old.filter(booking => booking.id !== bookingId);
      });

      // Return a context object with the snapshotted value
      return { previousBookings };
    },
    onError: (_err, _bookingId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBookings) {
        context.previousBookings.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      // Invalidate and refetch bookings to get the latest data from server
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

// Custom hook for daily overview
export function useDailyBookings(date: string) {
  const { data: allBookings = [], isLoading, error } = useBookings({});
  const { data: rooms = [] } = useRooms();
  
  const dailyOverview = useMemo(() => {
    if (!allBookings.length || !date) return null;
    
    return processDailyOverview(allBookings, rooms, date);
  }, [allBookings, rooms, date]);

  return {
    data: dailyOverview,
    isLoading,
    error,
  };
}