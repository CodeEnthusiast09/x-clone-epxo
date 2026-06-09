import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { usePosts } from '@/hooks/services';
import { PostCard } from '@/components/post-card';
import type { Post } from '@/interfaces/post.interface';

export function HomeScreen() {
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

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-base text-gray-500">
          Something went wrong. Pull to refresh.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-white"
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} />}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.4}
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
            <ActivityIndicator size="small" color="#000" />
          </View>
        ) : null
      }
    />
  );
}
