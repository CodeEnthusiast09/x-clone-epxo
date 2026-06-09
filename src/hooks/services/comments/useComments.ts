import { useQuery } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useComments(postId: string, enabled = true) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => clientRequest.comments.list(postId),
    select: (res) => res.data.data ?? [],
    enabled: enabled && !!postId,
  });
}
