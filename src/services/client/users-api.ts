import type { ApiResponse } from '@/interfaces/api-response.interface';
import type { User } from '@/interfaces/user.interface';
import { clientRequestGateway } from './client-request-gateway';

const requestGateway = clientRequestGateway();

export const usersClientRequests = {
  getByUsername: (username: string) =>
    requestGateway.get<ApiResponse<User>>({ url: `api/users/${username}` }),
};
