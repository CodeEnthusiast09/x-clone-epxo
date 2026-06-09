import { useQuery } from '@tanstack/react-query';
import { clientRequest } from '@/services/client';

export function useProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => clientRequest.users.getByUsername(username),
    select: (res) => res.data.data,
    enabled: !!username,
  });
}
