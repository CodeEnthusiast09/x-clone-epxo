import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/interfaces/user.interface';
import { clientRequest } from '@/services/client';

export function useToggleFollow(user: User) {
  const queryClient = useQueryClient();
  const isFollowing = !!user.isFollowedByCurrentUser;

  return useMutation({
    mutationFn: () =>
      isFollowing
        ? clientRequest.users.unfollow(user.username)
        : clientRequest.users.follow(user.username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user.username] });
    },
  });
}
