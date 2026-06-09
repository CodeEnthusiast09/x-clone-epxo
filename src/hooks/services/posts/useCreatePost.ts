import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => clientRequest.posts.create(content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
