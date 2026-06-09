import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => clientRequest.comments.create(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
