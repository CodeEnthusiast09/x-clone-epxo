import type { Post } from './post.interface';
import type { User } from './user.interface';

export interface SearchResults {
  users: User[];
  posts: Post[];
}
