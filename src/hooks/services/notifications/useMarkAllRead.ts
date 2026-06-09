import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clientRequest.notifications.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
