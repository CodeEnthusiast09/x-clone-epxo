import type { User } from './user.interface';

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  image: string;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser?: boolean;
  likes?: User[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  postId: string;
  content: string;
  likes?: User[];
  createdAt: string;
  updatedAt: string;
}
