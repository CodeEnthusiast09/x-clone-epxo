import { useQuery } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => clientRequest.conversations.listMessages(conversationId),
    select: (res) => res.data.data ?? [],
    enabled: !!conversationId,
  });
}
