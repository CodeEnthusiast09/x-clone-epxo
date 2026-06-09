import type { ApiResponse, PaginatedResponse } from '@/interfaces/api-response.interface';
import type { Post } from '@/interfaces/post.interface';
import { clientRequestGateway } from './client-request-gateway';

const requestGateway = clientRequestGateway();

export const postsClientRequests = {
  list: (page = 1, limit = 20) =>
    requestGateway.get<PaginatedResponse<Post>>({
      url: `api/posts?page=${page}&limit=${limit}`,
    }),

  create: (content: string) =>
    requestGateway.post<ApiResponse<Post>>({
      url: 'api/posts',
      payload: { content },
    }),

  like: (postId: string) =>
    requestGateway.post({ url: `api/posts/${postId}/likes` }),

  unlike: (postId: string) =>
    requestGateway.delete({ url: `api/posts/${postId}/likes` }),

  listByUsername: (username: string, page = 1, limit = 20) =>
    requestGateway.get<PaginatedResponse<Post>>({
      url: `api/users/${username}/posts?page=${page}&limit=${limit}`,
    }),
};
