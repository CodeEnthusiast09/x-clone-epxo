import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppStore } from '@/store/auth-store';
import { ProfileScreen } from '@/screens/profile';

export default function ProfileTab() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/(auth)/sign-in');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return <ProfileScreen username={currentUser.username} />;
}
