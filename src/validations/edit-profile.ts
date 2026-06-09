import { z } from 'zod';

export const editProfileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  bio: z.string().max(160).optional(),
  location: z.string().max(100).optional(),
  bannerImage: z.string().max(2048).optional(),
  profilePicture: z.string().max(2048).optional(),
});
