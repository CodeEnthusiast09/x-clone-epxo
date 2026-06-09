import type { ApiResponse } from '@/interfaces/api-response.interface';
import type { User } from '@/interfaces/user.interface';
import { clientRequestGateway } from './client-request-gateway';

const requestGateway = clientRequestGateway();

export const authClientRequests = {
  sync: () =>
    requestGateway.post<ApiResponse<User>>({ url: 'api/auth/sync' }),
};
