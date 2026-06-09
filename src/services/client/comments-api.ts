import type { ApiResponse } from '@/interfaces/api-response.interface';
import type { Comment } from '@/interfaces/post.interface';
import { clientRequestGateway } from './client-request-gateway';

const requestGateway = clientRequestGateway();

export const commentsClientRequests = {
  list: (postId: string) =>
    requestGateway.get<ApiResponse<Comment[]>>({ url: `api/comments/post/${postId}` }),

  create: (postId: string, content: string) =>
    requestGateway.post<ApiResponse<Comment>>({
      url: `api/posts/${postId}/comments`,
      payload: { content },
    }),
};
