import type { ApiResponse, PaginatedResponse } from '@/interfaces/api-response.interface';
import type { Notification } from '@/interfaces/notification.interface';
import { clientRequestGateway } from './client-request-gateway';

const requestGateway = clientRequestGateway();

export const notificationsClientRequests = {
  list: (page = 1, limit = 20) =>
    requestGateway.get<PaginatedResponse<Notification>>({
      url: `api/notifications?page=${page}&limit=${limit}`,
    }),

  markAllRead: () =>
    requestGateway.patch<ApiResponse<null>>({ url: 'api/notifications/read', payload: {} }),
};
