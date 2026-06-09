import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useComments } from '@/hooks/services/comments/useComments';
import { useCreateComment } from '@/hooks/services/comments/useCreateComment';
import type { Comment, Post } from '@/interfaces/post.interface';
import { formatRelativeTime } from '@/utils/format-date';

interface Props {
  post: Post;
  visible: boolean;
  onClose: () => void;
}

function CommentItem({ comment }: { comment: Comment }) {
  const displayName =
    `${comment.user.firstName} ${comment.user.lastName}`.trim() || comment.user.username;
  const initials =
    `${comment.user.firstName[0] ?? ''}${comment.user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <View className="flex-row gap-3 border-b border-gray-100 px-4 py-3">
      {comment.user.profilePicture ? (
        <Image
          source={{ uri: comment.user.profilePicture }}
          className="h-8 w-8 rounded-full bg-gray-200"
        />
      ) : (
        <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-300">
          <Text className="text-xs font-semibold text-gray-700">{initials}</Text>
        </View>
      )}
      <View className="flex-1">
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-bold text-black">{displayName}</Text>
          <Text className="text-xs text-gray-500">·</Text>
          <Text className="text-xs text-gray-500">{formatRelativeTime(comment.createdAt)}</Text>
        </View>
        <Text className="mt-0.5 text-sm leading-5 text-black">{comment.content}</Text>
      </View>
    </View>
  );
}

export function CommentsModal({ post, visible, onClose }: Props) {
  const [text, setText] = useState('');
  const { data: comments, isLoading } = useComments(post.id, visible);
  const createComment = useCreateComment(post.id);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || createComment.isPending) return;
    createComment.mutate(trimmed, {
      onSuccess: () => setText(''),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
          <Text className="text-base font-bold text-black">Comments</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text className="text-sm font-semibold text-blue-500">Done</Text>
          </Pressable>
        </View>

        {/* Post preview */}
        <View className="border-b border-gray-100 px-4 py-3">
          <Text className="text-sm font-semibold text-black">
            {`${post.user.firstName} ${post.user.lastName}`.trim() || post.user.username}
          </Text>
          {!!post.content && (
            <Text className="mt-1 text-sm leading-5 text-black">{post.content}</Text>
          )}
        </View>

        {/* Comments list */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#000" />
          </View>
        ) : (
          <FlatList
            data={comments ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CommentItem comment={item} />}
            ListEmptyComponent={
              <View className="items-center px-8 pt-12">
                <Text className="text-center text-sm text-gray-400">
                  No comments yet. Be the first!
                </Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View className="flex-row items-center gap-3 border-t border-gray-100 px-4 py-3">
          <TextInput
            className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm text-black"
            placeholder="Add a comment…"
            placeholderTextColor="#9ca3af"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSubmit}
            disabled={!text.trim() || createComment.isPending}
            className="disabled:opacity-40"
          >
            {createComment.isPending ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Text className="text-sm font-bold text-blue-500">Post</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
