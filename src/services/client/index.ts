import { authClientRequests } from './auth-api';
import { conversationsClientRequests } from './conversations-api';
import { postsClientRequests } from './posts-api';
import { searchClientRequests } from './search-api';
import { usersClientRequests } from './users-api';

export const clientRequest = {
  auth: authClientRequests,
  conversations: conversationsClientRequests,
  posts: postsClientRequests,
  search: searchClientRequests,
  users: usersClientRequests,
};
