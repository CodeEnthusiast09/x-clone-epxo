import { useAuth } from '@clerk/clerk-expo';
import { View, Text, Pressable } from 'react-native';
import { useAppStore } from '@/store/auth-store';

export default function ProfileTab() {
  const { signOut } = useAuth();
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const handleSignOut = async () => {
    setCurrentUser(null);
    await signOut();
  };

  return (
    <View className="flex-1 bg-white px-4 pt-12">
      {currentUser ? (
        <>
          <Text className="text-xl font-bold text-black">
            {currentUser.firstName} {currentUser.lastName}
          </Text>
          <Text className="mt-1 text-sm text-gray-500">@{currentUser.username}</Text>
        </>
      ) : (
        <Text className="text-base text-gray-400">Profile coming soon</Text>
      )}

      <Pressable
        className="mt-6 h-10 w-28 items-center justify-center rounded-full border border-gray-300"
        onPress={handleSignOut}
      >
        <Text className="text-sm font-semibold text-black">Sign out</Text>
      </Pressable>
    </View>
  );
}
