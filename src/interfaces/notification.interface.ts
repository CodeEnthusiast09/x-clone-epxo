import type { User } from './user.interface';

export type NotificationType = 'like' | 'comment' | 'follow';

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  actor: User;
  type: NotificationType;
  postId: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
