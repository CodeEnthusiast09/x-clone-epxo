import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PostCard } from '@/components/post-card';
import { useProfile, useToggleFollow } from '@/hooks/services/users';
import { useUserPosts } from '@/hooks/services/posts';
import { useAppStore } from '@/store/auth-store';
import type { Post } from '@/interfaces/post.interface';
import type { User } from '@/interfaces/user.interface';

interface Props {
  username: string;
}

function ProfileHeader({ user, isOwnProfile }: { user: User; isOwnProfile: boolean }) {
  const router = useRouter();
  const toggleFollow = useToggleFollow(user);
  const isFollowing = !!user.isFollowedByCurrentUser;
  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.username;

  return (
    <View>
      {/* Banner */}
      <View className="h-32 w-full bg-gray-200">
        {!!user.bannerImage && (
          <Image source={{ uri: user.bannerImage }} className="h-full w-full" resizeMode="cover" />
        )}
      </View>

      {/* Avatar + action button row */}
      <View className="flex-row items-end justify-between px-4 pb-3">
        <View className="-mt-10">
          {user.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              className="h-20 w-20 rounded-full border-4 border-white bg-gray-200"
            />
          ) : (
            <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gray-300">
              <Text className="text-2xl font-bold text-gray-600">
                {(user.firstName[0] ?? user.username[0] ?? '').toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {isOwnProfile ? (
          <Pressable
            className="rounded-full border border-gray-300 px-4 py-1.5"
            onPress={() => router.push('/edit-profile')}
          >
            <Text className="text-sm font-semibold text-black">Edit profile</Text>
          </Pressable>
        ) : (
          <Pressable
            className={`rounded-full px-5 py-1.5 ${
              isFollowing ? 'border border-gray-300' : 'bg-black'
            }`}
            onPress={() => toggleFollow.mutate()}
            disabled={toggleFollow.isPending}
          >
            <Text className={`text-sm font-semibold ${isFollowing ? 'text-black' : 'text-white'}`}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Name / username / bio / location */}
      <View className="px-4 pb-3">
        <Text className="text-xl font-bold text-black">{displayName}</Text>
        <Text className="text-sm text-gray-500">@{user.username}</Text>

        {!!user.bio && (
          <Text className="mt-2 text-sm leading-5 text-black">{user.bio}</Text>
        )}
        {!!user.location && (
          <Text className="mt-1 text-sm text-gray-500">📍 {user.location}</Text>
        )}

        {/* Followers / Following */}
        <View className="mt-3 flex-row gap-4">
          <Text className="text-sm text-black">
            <Text className="font-bold">{user.followingCount ?? 0}</Text>
            <Text className="text-gray-500"> Following</Text>
          </Text>
          <Text className="text-sm text-black">
            <Text className="font-bold">{user.followersCount ?? 0}</Text>
            <Text className="text-gray-500"> Followers</Text>
          </Text>
        </View>
      </View>

      {/* Posts header */}
      <View className="border-b border-gray-200 px-4 pb-2">
        <Text className="text-sm font-semibold text-black">Posts</Text>
        <View className="mt-1 h-0.5 w-12 rounded-full bg-blue-500" />
      </View>
    </View>
  );
}

export function ProfileScreen({ username }: Props) {
  const currentUser = useAppStore((s) => s.currentUser);
  const isOwnProfile = currentUser?.username === username;

  const { data: profileData, isLoading: profileLoading, isError: profileError } = useProfile(username);

  const {
    data,
    isLoading: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useUserPosts(username);

  const posts: Post[] = data?.pages.flatMap((p) => p.data.data ?? []) ?? [];

  if (profileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (profileError || !profileData) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-base text-gray-500">User not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={
          <ProfileHeader user={profileData} isOwnProfile={isOwnProfile} />
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          postsLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="small" color="#000" />
            </View>
          ) : (
            <View className="items-center px-8 pt-12">
              <Text className="text-center text-base text-gray-400">No posts yet.</Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#000" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
