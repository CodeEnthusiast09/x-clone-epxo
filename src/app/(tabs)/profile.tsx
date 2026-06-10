import { ActivityIndicator, View } from 'react-native';
import { useAppStore } from '@/store/auth-store';
import { ProfileScreen } from '@/screens/profile';

export default function ProfileTab() {
  const currentUser = useAppStore((s) => s.currentUser);

  if (!currentUser) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return <ProfileScreen username={currentUser.username} />;
}
