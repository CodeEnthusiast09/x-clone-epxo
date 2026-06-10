import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';
import type { ConversationView } from '@/interfaces/conversation.interface';

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      clientRequest.conversations.delete(conversationId),
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      const previous = queryClient.getQueryData<ConversationView[]>(['conversations']);
      queryClient.setQueryData<ConversationView[]>(['conversations'], (old) =>
        old?.filter((c) => c.id !== conversationId) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['conversations'], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
