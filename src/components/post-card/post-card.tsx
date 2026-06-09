import { Image, Pressable, Text, View } from 'react-native';
import type { Post } from '@/interfaces/post.interface';
import { useToggleLike } from '@/hooks/services/posts/useToggleLike';
import { formatRelativeTime } from '@/utils/format-date';

interface Props {
  post: Post;
}

function Avatar({ user }: { user: Post['user'] }) {
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  if (user.profilePicture) {
    return (
      <Image
        source={{ uri: user.profilePicture }}
        className="h-10 w-10 rounded-full bg-gray-200"
      />
    );
  }

  return (
    <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-300">
      <Text className="text-sm font-semibold text-gray-700">{initials}</Text>
    </View>
  );
}

export function PostCard({ post }: Props) {
  const displayName = `${post.user.firstName} ${post.user.lastName}`.trim() || post.user.username;
  const toggleLike = useToggleLike(post);
  const isLiked = !!post.isLikedByCurrentUser;

  return (
    <View className="border-b border-gray-100 px-4 py-3">
      <View className="flex-row gap-3">
        <Avatar user={post.user} />

        <View className="flex-1">
          <View className="flex-row items-center gap-1">
            <Text className="text-sm font-bold text-black" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="text-sm text-gray-500" numberOfLines={1}>
              @{post.user.username}
            </Text>
            <Text className="text-sm text-gray-500">·</Text>
            <Text className="text-sm text-gray-500">
              {formatRelativeTime(post.createdAt)}
            </Text>
          </View>

          {!!post.content && (
            <Text className="mt-0.5 text-sm leading-5 text-black">{post.content}</Text>
          )}

          {!!post.image && (
            <Image
              source={{ uri: post.image }}
              className="mt-2 h-52 w-full rounded-2xl bg-gray-100"
              resizeMode="cover"
            />
          )}

          <View className="mt-3 flex-row gap-6">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs text-gray-500">💬</Text>
              <Text className="text-xs text-gray-500">{post.commentsCount}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs text-gray-500">🔁</Text>
              <Text className="text-xs text-gray-500">0</Text>
            </View>
            <Pressable
              className="flex-row items-center gap-1.5"
              onPress={() => toggleLike.mutate()}
              disabled={toggleLike.isPending}
            >
              <Text className="text-xs">{isLiked ? '❤️' : '🤍'}</Text>
              <Text className={`text-xs ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                {post.likesCount}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
