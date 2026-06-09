import { authClientRequests } from './auth-api';
import { commentsClientRequests } from './comments-api';
import { conversationsClientRequests } from './conversations-api';
import { notificationsClientRequests } from './notifications-api';
import { postsClientRequests } from './posts-api';
import { searchClientRequests } from './search-api';
import { uploadClientRequests } from './upload-api';
import { usersClientRequests } from './users-api';

export const clientRequest = {
  auth: authClientRequests,
  comments: commentsClientRequests,
  conversations: conversationsClientRequests,
  notifications: notificationsClientRequests,
  posts: postsClientRequests,
  search: searchClientRequests,
  upload: uploadClientRequests,
  users: usersClientRequests,
};
