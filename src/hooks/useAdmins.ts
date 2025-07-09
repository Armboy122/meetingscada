import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export function useAdmins() {
  return useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const response = await apiClient.getAdmins();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAdmin(id: number) {
  return useQuery({
    queryKey: ['admin', id],
    queryFn: async () => {
      const response = await apiClient.getAdmin(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { username: string; password: string; fullName: string; email: string }) => 
      apiClient.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { username: string; fullName: string; email: string; isActive: boolean } }) => 
      apiClient.updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
} 