import { useLocalSearchParams } from 'expo-router';
import { ProfileScreen } from '@/screens/profile';

export default function ProfileRoute() {
  const { username } = useLocalSearchParams<{ username: string }>();

  if (!username) return null;

  return <ProfileScreen username={username} />;
}
