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
  followers?: User[];
  following?: User[];
  createdAt: string;
  updatedAt: string;
}
