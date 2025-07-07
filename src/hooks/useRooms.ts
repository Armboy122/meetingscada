import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await apiClient.getRooms();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRoom(id: number) {
  return useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const response = await apiClient.getRoom(id);
      return response.data;
    },
    enabled: !!id,
  });
}