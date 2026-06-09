export interface User {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  bannerImage: string;
  bio: string;
  location: string;
  followersCount?: number;
  followingCount?: number;
  isFollowedByCurrentUser?: boolean;
  followers?: User[];
  following?: User[];
  createdAt: string;
  updatedAt: string;
}
