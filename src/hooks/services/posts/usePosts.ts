import { useInfiniteQuery } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => clientRequest.posts.list(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data.meta;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
  });
}
