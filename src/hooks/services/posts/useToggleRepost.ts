import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import type { PaginatedResponse } from '@/interfaces/api-response.interface';
import type { Post } from '@/interfaces/post.interface';
import { clientRequest } from '@/services/client';

type PostsCache = InfiniteData<AxiosResponse<PaginatedResponse<Post>>>;

function applyToggle(old: PostsCache | undefined, postId: string, isReposted: boolean) {
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
                isRepostedByCurrentUser: !isReposted,
                repostsCount: isReposted ? p.repostsCount - 1 : p.repostsCount + 1,
              }
            : p,
        ),
      },
    })),
  };
}

export function useToggleRepost(post: Post) {
  const queryClient = useQueryClient();
  const isReposted = !!post.isRepostedByCurrentUser;

  return useMutation({
    mutationFn: () =>
      isReposted
        ? clientRequest.posts.unrepost(post.id)
        : clientRequest.posts.repost(post.id),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const snapshots = queryClient.getQueriesData<PostsCache>({ queryKey: ['posts'] });

      queryClient.setQueriesData<PostsCache>({ queryKey: ['posts'] }, (old) =>
        applyToggle(old, post.id, isReposted),
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
