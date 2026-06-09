import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Post } from '@/interfaces/post.interface';
import { useToggleLike } from '@/hooks/services/posts/useToggleLike';
import { useDeletePost } from '@/hooks/services/posts/useDeletePost';
import { useAppStore } from '@/store/auth-store';
import { CommentsModal } from '@/components/comments-modal';
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
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const displayName = `${post.user.firstName} ${post.user.lastName}`.trim() || post.user.username;
  const toggleLike = useToggleLike(post);
  const deletePost = useDeletePost();
  const isLiked = !!post.isLikedByCurrentUser;
  const isOwn = currentUser?.id === post.userId;
  const [commentsOpen, setCommentsOpen] = useState(false);

  const goToProfile = () => router.push(`/profile/${post.user.username}`);

  const handleDelete = () => {
    Alert.alert('Delete post', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deletePost.mutate(post.id),
      },
    ]);
  };

  return (
    <View className="border-b border-gray-100 px-4 py-3">
      <View className="flex-row gap-3">
        <Pressable onPress={goToProfile}>
          <Avatar user={post.user} />
        </Pressable>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1 flex-1">
              <Pressable onPress={goToProfile}>
                <Text className="text-sm font-bold text-black" numberOfLines={1}>
                  {displayName}
                </Text>
              </Pressable>
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                @{post.user.username}
              </Text>
              <Text className="text-sm text-gray-500">·</Text>
              <Text className="text-sm text-gray-500">
                {formatRelativeTime(post.createdAt)}
              </Text>
            </View>

            {isOwn && (
              <Pressable onPress={handleDelete} hitSlop={8} disabled={deletePost.isPending}>
                <Text className="text-base text-gray-400">🗑️</Text>
              </Pressable>
            )}
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
            <Pressable
              className="flex-row items-center gap-1.5"
              onPress={() => setCommentsOpen(true)}
            >
              <Text className="text-xs text-gray-500">💬</Text>
              <Text className="text-xs text-gray-500">{post.commentsCount}</Text>
            </Pressable>
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

      <CommentsModal
        post={post}
        visible={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </View>
  );
}
