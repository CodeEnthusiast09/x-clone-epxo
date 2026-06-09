import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { ProfileScreen } from '@/screens/profile';

export default function ProfileRoute() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();

  if (!username) return null;

  return (
    <View className="flex-1 bg-white">
      {/* Back header */}
      <View className="flex-row items-center gap-3 px-4 pb-2 pt-12">
        <Pressable onPress={() => router.back()} className="p-1">
          <Text className="text-base text-black">←</Text>
        </Pressable>
        <Text className="text-lg font-bold text-black">Profile</Text>
      </View>
      <ProfileScreen username={username} />
    </View>
  );
}
