import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCreatePost } from '@/hooks/services/posts/useCreatePost';
import { useAppStore } from '@/store/auth-store';

const MAX_CHARS = 280;

export function ComposeScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const [content, setContent] = useState('');
  const createPost = useCreatePost();

  const remaining = MAX_CHARS - content.length;
  const canPost = content.trim().length > 0 && remaining >= 0 && !createPost.isPending;

  const handlePost = () => {
    if (!canPost) return;
    createPost.mutate(content.trim(), {
      onSuccess: () => router.back(),
    });
  };

  const initials = currentUser
    ? `${currentUser.firstName[0] ?? ''}${currentUser.lastName[0] ?? ''}`.toUpperCase()
    : '';

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-base text-gray-500">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handlePost}
          disabled={!canPost}
          className={`rounded-full bg-blue-500 px-5 py-1.5 ${!canPost ? 'opacity-40' : ''}`}
        >
          {createPost.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-sm font-bold text-white">Post</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 flex-row gap-3 px-4 pt-4">
          {/* Avatar */}
          {currentUser?.profilePicture ? (
            <Image
              source={{ uri: currentUser.profilePicture }}
              className="h-10 w-10 rounded-full bg-gray-200"
            />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-300">
              <Text className="text-sm font-semibold text-gray-700">{initials}</Text>
            </View>
          )}

          {/* Input */}
          <View className="flex-1">
            <TextInput
              className="text-base text-black"
              placeholder="What is happening?!"
              placeholderTextColor="#9ca3af"
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
              maxLength={MAX_CHARS + 1}
            />
          </View>
        </View>

        {/* Char counter */}
        <View className="flex-row justify-end border-t border-gray-100 px-4 py-2">
          <Text
            className={`text-sm ${
              remaining < 0
                ? 'text-red-500'
                : remaining <= 20
                  ? 'text-yellow-500'
                  : 'text-gray-400'
            }`}
          >
            {remaining}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
