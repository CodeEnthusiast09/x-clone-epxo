import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import type { PaginatedResponse } from '@/interfaces/api-response.interface';
import type { Post } from '@/interfaces/post.interface';
import { clientRequest } from '@/services/client';

type PostsCache = InfiniteData<AxiosResponse<PaginatedResponse<Post>>>;

export function useToggleLike(post: Post) {
  const queryClient = useQueryClient();
  const isLiked = !!post.isLikedByCurrentUser;

  return useMutation({
    mutationFn: () =>
      isLiked ? clientRequest.posts.unlike(post.id) : clientRequest.posts.like(post.id),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previous = queryClient.getQueryData<PostsCache>(['posts']);

      queryClient.setQueryData<PostsCache>(['posts'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data.data?.map((p) =>
                p.id === post.id
                  ? {
                      ...p,
                      isLikedByCurrentUser: !isLiked,
                      likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
                    }
                  : p,
              ),
            },
          })),
        };
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['posts'], context.previous);
      }
    },
  });
}
