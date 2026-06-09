import { useQuery } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => clientRequest.search.search(q),
    select: (res) => res.data.data ?? { users: [], posts: [] },
    enabled: q.trim().length > 0,
  });
}
