import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import type { PaginatedResponse } from '@/interfaces/api-response.interface';
import type { Post } from '@/interfaces/post.interface';
import { clientRequest } from '@/services/client';

type PostsCache = InfiniteData<AxiosResponse<PaginatedResponse<Post>>>;

function applyToggle(old: PostsCache | undefined, postId: string, isLiked: boolean) {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        data: page.data.data?.map((p) =>
          p.id === postId
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
}

export function useToggleLike(post: Post) {
  const queryClient = useQueryClient();
  const isLiked = !!post.isLikedByCurrentUser;

  return useMutation({
    mutationFn: () =>
      isLiked ? clientRequest.posts.unlike(post.id) : clientRequest.posts.like(post.id),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot every matching cache (feed + all user-post lists)
      const snapshots = queryClient.getQueriesData<PostsCache>({ queryKey: ['posts'] });

      // Apply optimistic update to all of them
      queryClient.setQueriesData<PostsCache>({ queryKey: ['posts'] }, (old) =>
        applyToggle(old, post.id, isLiked),
      );

      return { snapshots };
    },

    onError: (_err, _vars, context) => {
      for (const [key, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
  });
}
