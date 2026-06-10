import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons';
import type { Post } from '@/interfaces/post.interface';
import { useToggleLike } from '@/hooks/services/posts/useToggleLike';
import { useToggleRepost } from '@/hooks/services/posts/useToggleRepost';
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
        className="h-12 w-12 rounded-full bg-gray-200"
      />
    );
  }

  return (
    <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500">
      <Text className="text-base font-bold text-white">{initials}</Text>
    </View>
  );
}

export function PostCard({ post }: Props) {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const displayName = `${post.user.firstName} ${post.user.lastName}`.trim() || post.user.username;
  const toggleLike = useToggleLike(post);
  const toggleRepost = useToggleRepost(post);
  const deletePost = useDeletePost();
  const isLiked = !!post.isLikedByCurrentUser;
  const isReposted = !!post.isRepostedByCurrentUser;
  const isOwn = currentUser?.id === post.userId;
  const [commentsOpen, setCommentsOpen] = useState(false);

  const goToProfile = () => router.push(`/profile/${post.user.username}`);

  const handleDelete = () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePost.mutate(post.id) },
    ]);
  };

  return (
    <View className="border-b border-gray-100 bg-white">
      <View className="flex-row p-4">
        <Pressable onPress={goToProfile} className="mr-3">
          <Avatar user={post.user} />
        </Pressable>

        <View className="flex-1">
          <View className="mb-1 flex-row items-center justify-between">
            <View className="flex-row flex-1 items-center flex-wrap">
              <Pressable onPress={goToProfile}>
                <Text className="font-bold text-gray-900 mr-1">{displayName}</Text>
              </Pressable>
              <Text className="text-gray-500 text-sm">
                @{post.user.username} · {formatRelativeTime(post.createdAt)}
              </Text>
            </View>
            {isOwn && (
              <Pressable onPress={handleDelete} hitSlop={8} disabled={deletePost.isPending}>
                <Feather name="trash" size={18} color="#657786" />
              </Pressable>
            )}
          </View>

          {!!post.content && (
            <Text className="text-gray-900 text-base leading-5 mb-2">{post.content}</Text>
          )}

          {!!post.image && (
            <Image
              source={{ uri: post.image }}
              className="w-full h-48 rounded-2xl mb-3 bg-gray-100"
              resizeMode="cover"
            />
          )}

          <View className="flex-row justify-between max-w-xs">
            <Pressable
              className="flex-row items-center gap-1.5"
              onPress={() => setCommentsOpen(true)}
            >
              <Feather name="message-circle" size={18} color="#657786" />
              <Text className="text-gray-500 text-sm">{post.commentsCount}</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-1.5"
              onPress={() => toggleRepost.mutate()}
              disabled={toggleRepost.isPending}
            >
              <Feather name="repeat" size={18} color={isReposted ? '#17BF63' : '#657786'} />
              <Text style={{ color: isReposted ? '#17BF63' : '#657786' }} className="text-sm">
                {post.repostsCount}
              </Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-1.5"
              onPress={() => toggleLike.mutate()}
              disabled={toggleLike.isPending}
            >
              {isLiked ? (
                <AntDesign name="heart" size={18} color="#E0245E" />
              ) : (
                <Feather name="heart" size={18} color="#657786" />
              )}
              <Text className={`text-sm ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                {post.likesCount}
              </Text>
            </Pressable>

            <Pressable hitSlop={8}>
              <Feather name="share" size={18} color="#657786" />
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
