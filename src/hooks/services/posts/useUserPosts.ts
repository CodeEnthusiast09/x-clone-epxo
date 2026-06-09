import { useInfiniteQuery } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useUserPosts(username: string) {
  return useInfiniteQuery({
    queryKey: ['posts', 'user', username],
    queryFn: ({ pageParam = 1 }) => clientRequest.posts.listByUsername(username, pageParam as number),
    getNextPageParam: (last) => {
      const meta = last.data.meta;
      if (!meta) return undefined;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!username,
  });
}
