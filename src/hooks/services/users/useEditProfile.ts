import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { z } from 'zod';
import { useAppStore } from '@/store/auth-store';
import type { editProfileSchema } from '@/validations/edit-profile';
import { clientRequest } from '@/services/client';

export function useEditProfile() {
  const queryClient = useQueryClient();
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const currentUser = useAppStore((s) => s.currentUser);

  return useMutation({
    mutationFn: (data: z.infer<typeof editProfileSchema>) => clientRequest.users.updateMe(data),
    onSuccess: (res) => {
      const updated = res.data.data;
      if (updated) {
        setCurrentUser(updated);
        if (currentUser) {
          queryClient.invalidateQueries({ queryKey: ['profile', currentUser.username] });
        }
      }
    },
  });
}
