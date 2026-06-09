import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => clientRequest.posts.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
