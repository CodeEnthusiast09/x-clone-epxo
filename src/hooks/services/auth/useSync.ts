import { useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/store/auth-store';
import { clientRequest } from '@/services/client';

export function useSync() {
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  return useMutation({
    mutationFn: () => clientRequest.auth.sync(),
    onSuccess: (res) => {
      if (res.data.data) {
        setCurrentUser(res.data.data);
      }
    },
  });
}
