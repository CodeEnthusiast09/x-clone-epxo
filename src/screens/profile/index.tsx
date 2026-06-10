import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
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
      <View className="h-48 w-full bg-gray-200">
        {!!user.bannerImage && (
          <Image source={{ uri: user.bannerImage }} className="h-full w-full" resizeMode="cover" />
        )}
      </View>

      {/* Avatar + edit/follow button row */}
      <View className="flex-row justify-between items-end px-4 -mt-16 mb-4">
        {user.profilePicture ? (
          <Image
            source={{ uri: user.profilePicture }}
            className="h-32 w-32 rounded-full border-4 border-white bg-gray-200"
          />
        ) : (
          <View className="h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-blue-500">
            <Text className="text-4xl font-bold text-white">
              {(user.firstName[0] ?? user.username[0] ?? '').toUpperCase()}
            </Text>
          </View>
        )}

        {isOwnProfile ? (
          <Pressable
            className="rounded-full border border-gray-300 px-6 py-2"
            onPress={() => router.push('/edit-profile')}
          >
            <Text className="font-semibold text-gray-900">Edit profile</Text>
          </Pressable>
        ) : (
          <Pressable
            className={`rounded-full px-5 py-2 ${isFollowing ? 'border border-gray-300' : 'bg-black'}`}
            onPress={() => toggleFollow.mutate()}
            disabled={toggleFollow.isPending}
          >
            <Text className={`font-semibold ${isFollowing ? 'text-black' : 'text-white'}`}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Bio section */}
      <View className="px-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center mb-1">
          <Text className="text-xl font-bold text-gray-900 mr-1">{displayName}</Text>
          <Feather name="check-circle" size={20} color="#1DA1F2" />
        </View>
        <Text className="text-gray-500 mb-2">@{user.username}</Text>

        {!!user.bio && (
          <Text className="text-gray-900 mb-3">{user.bio}</Text>
        )}

        <View className="flex-row items-center mb-2">
          <Feather name="map-pin" size={16} color="#657786" />
          <Text className="text-gray-500 ml-2">{user.location || 'Earth'}</Text>
        </View>

        <View className="flex-row items-center mb-3">
          <Feather name="calendar" size={16} color="#657786" />
          <Text className="text-gray-500 ml-2">
            Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
          </Text>
        </View>

        <View className="flex-row gap-4">
          <Text className="text-gray-900">
            <Text className="font-bold">{user.followingCount ?? 0}</Text>
            <Text className="text-gray-500"> Following</Text>
          </Text>
          <Text className="text-gray-900">
            <Text className="font-bold">{user.followersCount ?? 0}</Text>
            <Text className="text-gray-500"> Followers</Text>
          </Text>
        </View>
      </View>

      {/* Posts label */}
      <View className="border-b border-gray-200 px-4 py-2">
        <Text className="text-sm font-semibold text-black">Posts</Text>
        <View className="mt-1 h-0.5 w-10 rounded-full bg-blue-500" />
      </View>
    </View>
  );
}

export function ProfileScreen({ username }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const displayName = profileData
    ? `${profileData.firstName} ${profileData.lastName}`.trim() || profileData.username
    : username;

  if (profileLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </SafeAreaView>
    );
  }

  if (profileError || !profileData) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-base text-gray-500">User not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <Pressable onPress={() => router.canGoBack() && router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color="#657786" />
        </Pressable>
        <View className="flex-1 mx-3">
          <Text className="text-lg font-bold text-gray-900">{displayName}</Text>
          <Text className="text-xs text-gray-500">{posts.length} Posts</Text>
        </View>
        <Feather name="more-horizontal" size={22} color="#657786" />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={
          <ProfileHeader user={profileData} isOwnProfile={isOwnProfile} />
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1DA1F2" />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
        ListEmptyComponent={
          postsLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="small" color="#1DA1F2" />
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
              <ActivityIndicator size="small" color="#1DA1F2" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
