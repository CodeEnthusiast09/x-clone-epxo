import type { ApiResponse, PaginatedResponse } from '@/interfaces/api-response.interface';
import type { Notification } from '@/interfaces/notification.interface';
import { clientRequestGateway } from './client-request-gateway';

const requestGateway = clientRequestGateway();

export const notificationsClientRequests = {
  list: (page = 1, limit = 20) =>
    requestGateway.get<PaginatedResponse<Notification>>({
      url: `api/notifications?page=${page}&limit=${limit}`,
    }),

  unreadCount: () =>
    requestGateway.get<ApiResponse<{ count: number }>>({ url: 'api/notifications/unread-count' }),

  markAllRead: () =>
    requestGateway.patch<ApiResponse<null>>({ url: 'api/notifications/read', payload: {} }),

  registerPushToken: (token: string) =>
    requestGateway.post<ApiResponse<null>>({ url: 'api/push-token', payload: { token } }),

  unregisterPushToken: (token: string) =>
    requestGateway.delete<ApiResponse<null>>({ url: 'api/push-token', config: { data: { token } } }),
};
