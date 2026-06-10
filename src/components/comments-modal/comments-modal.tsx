import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
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
import { useAppStore } from '@/store/auth-store';
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
    <View className="border-b border-gray-100 bg-white p-4">
      <View className="flex-row">
        {comment.user.profilePicture ? (
          <Image
            source={{ uri: comment.user.profilePicture }}
            className="h-10 w-10 rounded-full bg-gray-200 mr-3"
          />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-500 mr-3">
            <Text className="text-sm font-bold text-white">{initials}</Text>
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="font-bold text-gray-900 mr-1">{displayName}</Text>
            <Text className="text-gray-500 text-sm">@{comment.user.username}</Text>
          </View>
          <Text className="text-gray-900 text-base leading-5">{comment.content}</Text>
        </View>
      </View>
    </View>
  );
}

export function CommentsModal({ post, visible, onClose }: Props) {
  const [text, setText] = useState('');
  const { data: comments, isLoading } = useComments(post.id, visible);
  const createComment = useCreateComment(post.id);
  const currentUser = useAppStore((s) => s.currentUser);

  const postAuthor = `${post.user.firstName} ${post.user.lastName}`.trim() || post.user.username;
  const currentInitials =
    `${currentUser?.firstName[0] ?? ''}${currentUser?.lastName[0] ?? ''}`.toUpperCase();

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || createComment.isPending) return;
    Keyboard.dismiss();
    createComment.mutate(trimmed, { onSuccess: () => setText('') });
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
          <Pressable onPress={handleClose} hitSlop={8}>
            <Text className="text-lg text-blue-500">Close</Text>
          </Pressable>
          <Text className="text-lg font-semibold text-gray-900">Comments</Text>
          <View className="w-12" />
        </View>

        {/* Post preview */}
        <View className="border-b border-gray-100 bg-white p-4">
          <View className="flex-row">
            {post.user.profilePicture ? (
              <Image
                source={{ uri: post.user.profilePicture }}
                className="h-12 w-12 rounded-full bg-gray-200 mr-3"
              />
            ) : (
              <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500 mr-3">
                <Text className="text-base font-bold text-white">
                  {`${post.user.firstName[0] ?? ''}${post.user.lastName[0] ?? ''}`.toUpperCase()}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="font-bold text-gray-900 mr-1">{postAuthor}</Text>
                <Text className="text-gray-500 text-sm">@{post.user.username}</Text>
              </View>
              {!!post.content && (
                <Text className="text-gray-900 text-base leading-5 mb-2">{post.content}</Text>
              )}
              {!!post.image && (
                <Image
                  source={{ uri: post.image }}
                  className="w-full h-48 rounded-2xl"
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
        </View>

        {/* Comments list */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#1DA1F2" />
          </View>
        ) : (
          <FlatList
            data={comments ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CommentItem comment={item} />}
            keyboardShouldPersistTaps="handled"
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
        <View className="border-t border-gray-100 p-4">
          <View className="flex-row">
            {currentUser?.profilePicture ? (
              <Image
                source={{ uri: currentUser.profilePicture }}
                className="h-10 w-10 rounded-full bg-gray-200 mr-3"
              />
            ) : (
              <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-500 mr-3">
                <Text className="text-sm font-bold text-white">{currentInitials}</Text>
              </View>
            )}
            <View className="flex-1">
              <TextInput
                className="border border-gray-200 rounded-lg p-3 text-base mb-3 text-black"
                placeholder="Write a comment..."
                placeholderTextColor="#657786"
                value={text}
                onChangeText={setText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Pressable
                className={`px-4 py-2 rounded-lg self-start ${
                  text.trim() ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onPress={handleSubmit}
                disabled={createComment.isPending || !text.trim()}
              >
                {createComment.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className={`font-semibold ${text.trim() ? 'text-white' : 'text-gray-500'}`}>
                    Reply
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
