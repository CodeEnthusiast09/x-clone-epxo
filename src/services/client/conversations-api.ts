import type { ApiResponse, PaginatedResponse } from '@/interfaces/api-response.interface';
import type { Conversation, ConversationView, Message } from '@/interfaces/conversation.interface';
import { clientRequestGateway } from './client-request-gateway';

const requestGateway = clientRequestGateway();

export const conversationsClientRequests = {
  list: () =>
    requestGateway.get<ApiResponse<ConversationView[]>>({ url: 'api/conversations' }),

  startOrGet: (recipientId: string) =>
    requestGateway.post<ApiResponse<Conversation>>({
      url: 'api/conversations',
      payload: { recipientId },
    }),

  listMessages: (conversationId: string, page = 1, limit = 50) =>
    requestGateway.get<PaginatedResponse<Message>>({
      url: `api/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
    }),

  markRead: (conversationId: string) =>
    requestGateway.patch<ApiResponse<{ markedRead: number }>>({
      url: `api/conversations/${conversationId}/read`,
    }),

  delete: (conversationId: string) =>
    requestGateway.delete<ApiResponse<null>>({
      url: `api/conversations/${conversationId}`,
    }),
};
