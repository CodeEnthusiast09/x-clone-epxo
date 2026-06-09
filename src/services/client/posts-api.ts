import type { PaginatedResponse } from '@/interfaces/api-response.interface';
import type { Post } from '@/interfaces/post.interface';
import { clientRequestGateway } from './client-request-gateway';

const requestGateway = clientRequestGateway();

export const postsClientRequests = {
  list: (page = 1, limit = 20) =>
    requestGateway.get<PaginatedResponse<Post>>({
      url: `api/posts?page=${page}&limit=${limit}`,
    }),

  like: (postId: string) =>
    requestGateway.post({ url: `api/posts/${postId}/like` }),

  unlike: (postId: string) =>
    requestGateway.delete({ url: `api/posts/${postId}/like` }),
};
