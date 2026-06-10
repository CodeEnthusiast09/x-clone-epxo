import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await clientRequest.notifications.unreadCount();
      return res.data.data?.count ?? 0;
    },
    enabled,
    staleTime: 30_000,
  });
}

// Call this after marking all notifications read to reset the badge instantly.
export function useResetUnreadCount() {
  const queryClient = useQueryClient();
  return () => queryClient.setQueryData(['notifications', 'unread-count'], 0);
}
