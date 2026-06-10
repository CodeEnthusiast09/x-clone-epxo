import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useCreatePost } from '@/hooks/services/posts/useCreatePost';
import { clientRequest } from '@/services/client';
import { uploadToCloudinary } from '@/utils/cloudinary-upload';
import { useAppStore } from '@/store/auth-store';

const MAX_CHARS = 280;

export function ComposeScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const [content, setContent] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const createPost = useCreatePost();

  const remaining = MAX_CHARS - content.length;
  const isPosting = createPost.isPending || uploading;
  const canPost =
    (content.trim().length > 0 || !!localImageUri) && remaining >= 0 && !isPosting;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to your photo library to attach images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!canPost) return;
    setUploading(true);

    try {
      let imageUrl: string | undefined;

      if (localImageUri) {
        const sigRes = await clientRequest.upload.getPostSignature();
        const sig = sigRes.data.data;
        if (!sig) throw new Error('Failed to get upload signature');
        imageUrl = await uploadToCloudinary(localImageUri, sig);
      }

      createPost.mutate(
        { content: content.trim(), image: imageUrl },
        { onSuccess: () => router.back() },
      );
    } catch {
      Alert.alert('Upload failed', 'Could not upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const initials = currentUser
    ? `${currentUser.firstName[0] ?? ''}${currentUser.lastName[0] ?? ''}`.toUpperCase()
    : '';

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-base text-blue-500">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => void handlePost()}
          disabled={!canPost}
          className={`rounded-full bg-blue-500 px-5 py-1.5 ${!canPost ? 'opacity-40' : ''}`}
        >
          {isPosting ? (
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
            <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-500">
              <Text className="text-sm font-semibold text-white">{initials}</Text>
            </View>
          )}

          {/* Input + image preview */}
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

            {!!localImageUri && (
              <View className="relative mt-3">
                <Image
                  source={{ uri: localImageUri }}
                  className="h-48 w-full rounded-2xl bg-gray-100"
                  resizeMode="cover"
                />
                <Pressable
                  className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-black/60"
                  onPress={() => setLocalImageUri(null)}
                  hitSlop={8}
                >
                  <Text className="text-xs font-bold text-white">✕</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Toolbar + char counter */}
        <View className="flex-row items-center justify-between border-t border-gray-100 px-4 py-2">
          <View className="flex-row items-center gap-5">
            <Pressable
              onPress={() => void handlePickImage()}
              disabled={isPosting}
              hitSlop={8}
            >
              <Feather name="image" size={22} color="#1DA1F2" />
            </Pressable>
            <Feather name="camera" size={22} color="#1DA1F2" />
          </View>

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
