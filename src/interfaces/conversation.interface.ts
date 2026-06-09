import type { User } from './user.interface';

export interface Conversation {
  id: string;
  participant1Id: string;
  participant1: User;
  participant2Id: string;
  participant2: User;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  body: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationView extends Conversation {
  lastMessage: Message | null;
  unreadCount: number;
}
