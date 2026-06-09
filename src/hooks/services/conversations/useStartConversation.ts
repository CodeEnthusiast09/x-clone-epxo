import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const userRes = await clientRequest.users.getByUsername(username);
      const recipientId = userRes.data.data?.id;
      if (!recipientId) throw new Error('User not found');
      const convRes = await clientRequest.conversations.startOrGet(recipientId);
      if (!convRes.data.data) throw new Error('Failed to start conversation');
      return convRes.data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
