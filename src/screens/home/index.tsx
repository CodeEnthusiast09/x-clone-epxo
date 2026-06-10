import { ActivityIndicator, Alert, FlatList, Image, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { PostCard } from '@/components/post-card';
import { usePosts } from '@/hooks/services';
import { useAppStore } from '@/store/auth-store';
import type { Post } from '@/interfaces/post.interface';

export function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const currentUser = useAppStore((s) => s.currentUser);
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = usePosts();

  const posts: Post[] = data?.pages.flatMap((p) => p.data.data ?? []) ?? [];

  const handleSignOut = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  const initials = currentUser
    ? `${currentUser.firstName[0] ?? ''}${currentUser.lastName[0] ?? ''}`.toUpperCase()
    : '';

  const header = (
    <>
      {/* Navbar */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
        <Text className="text-xl font-bold text-gray-900">Home</Text>
        <Pressable onPress={handleSignOut} hitSlop={8}>
          <Feather name="log-out" size={22} color="#E0245E" />
        </Pressable>
      </View>

      {/* Inline compose teaser */}
      <Pressable
        className="flex-row items-center border-b border-gray-100 p-4"
        onPress={() => router.push('/compose')}
      >
        {currentUser?.profilePicture ? (
          <Image
            source={{ uri: currentUser.profilePicture }}
            className="h-12 w-12 rounded-full bg-gray-200 mr-3"
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500 mr-3">
            <Text className="text-base font-bold text-white">{initials}</Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-lg text-gray-400">What's happening?</Text>
          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row gap-4">
              <Feather name="image" size={20} color="#1DA1F2" />
              <Feather name="camera" size={20} color="#1DA1F2" />
            </View>
            <View className="rounded-full bg-gray-200 px-5 py-1.5">
              <Text className="text-sm font-semibold text-gray-500">Post</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </>
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-white">
        {header}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-white">
        {header}
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base text-gray-500">
            Something went wrong. Pull to refresh.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1DA1F2" />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="items-center px-8 pt-20">
            <Text className="text-center text-base text-gray-400">
              No posts yet. Be the first to post!
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#1DA1F2" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
