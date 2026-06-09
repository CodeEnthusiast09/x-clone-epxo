import { useInfiniteQuery } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 1 }) =>
      clientRequest.notifications.list(pageParam as number),
    getNextPageParam: (last) => {
      const meta = last.data.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
