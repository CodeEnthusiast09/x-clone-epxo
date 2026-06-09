import type { ApiResponse } from '@/interfaces/api-response.interface';
import type { User } from '@/interfaces/user.interface';
import type { editProfileSchema } from '@/validations/edit-profile';
import type { z } from 'zod';
import { clientRequestGateway } from './client-request-gateway';

const requestGateway = clientRequestGateway();

export const usersClientRequests = {
  getByUsername: (username: string) =>
    requestGateway.get<ApiResponse<User>>({ url: `api/users/${username}` }),

  updateMe: (payload: z.infer<typeof editProfileSchema>) =>
    requestGateway.patch<ApiResponse<User>>({ url: 'api/users/me', payload }),

  follow: (username: string) =>
    requestGateway.post<ApiResponse<null>>({ url: `api/users/${username}/follow` }),

  unfollow: (username: string) =>
    requestGateway.delete<ApiResponse<null>>({ url: `api/users/${username}/follow` }),
};
