import { authClientRequests } from './auth-api';
import { postsClientRequests } from './posts-api';

export const clientRequest = {
  auth: authClientRequests,
  posts: postsClientRequests,
};
