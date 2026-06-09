import { useQuery } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => clientRequest.conversations.list(),
    select: (res) => res.data.data ?? [],
  });
}
