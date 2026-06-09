import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

interface CreatePostVars {
  content: string;
  image?: string;
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, image }: CreatePostVars) =>
      clientRequest.posts.create(content, image),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
