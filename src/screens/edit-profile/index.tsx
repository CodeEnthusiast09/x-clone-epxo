import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useEditProfile } from '@/hooks/services/users';
import { useAppStore } from '@/store/auth-store';
import { clientRequest } from '@/services/client';
import { uploadToCloudinary } from '@/utils/cloudinary-upload';

export function EditProfileScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const editProfile = useEditProfile();

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '');
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [location, setLocation] = useState(currentUser?.location ?? '');
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [localBannerUri, setLocalBannerUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName);
      setBio(currentUser.bio ?? '');
      setLocation(currentUser.location ?? '');
    }
  }, [currentUser]);

  const textDirty =
    firstName !== (currentUser?.firstName ?? '') ||
    lastName !== (currentUser?.lastName ?? '') ||
    bio !== (currentUser?.bio ?? '') ||
    location !== (currentUser?.location ?? '');

  const isDirty = textDirty || !!localAvatarUri || !!localBannerUri;
  const isBusy = uploading || editProfile.isPending;

  const pickImage = async (aspect: [number, number]) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to your photo library.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      quality: 0.85,
    });
    return result.canceled ? null : (result.assets[0]?.uri ?? null);
  };

  const handleSave = async () => {
    if (!isDirty || isBusy) return;
    setUploading(true);

    try {
      let profilePicture: string | undefined;
      let bannerImage: string | undefined;

      if (localAvatarUri) {
        const sigRes = await clientRequest.upload.getAvatarSignature();
        const sig = sigRes.data.data;
        if (!sig) throw new Error('Failed to get avatar signature');
        profilePicture = await uploadToCloudinary(localAvatarUri, sig);
      }

      if (localBannerUri) {
        const sigRes = await clientRequest.upload.getBannerSignature();
        const sig = sigRes.data.data;
        if (!sig) throw new Error('Failed to get banner signature');
        bannerImage = await uploadToCloudinary(localBannerUri, sig);
      }

      editProfile.mutate(
        {
          firstName,
          lastName,
          bio,
          location,
          ...(profilePicture ? { profilePicture } : {}),
          ...(bannerImage ? { bannerImage } : {}),
        },
        { onSuccess: () => router.back() },
      );
    } catch {
      Alert.alert('Upload failed', 'Could not upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const avatarUri = localAvatarUri ?? currentUser?.profilePicture;
  const bannerUri = localBannerUri ?? currentUser?.bannerImage;
  const initials =
    `${currentUser?.firstName[0] ?? ''}${currentUser?.lastName[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-base text-blue-500">Cancel</Text>
        </Pressable>
        <Text className="text-base font-bold text-gray-900">Edit Profile</Text>
        <Pressable
          onPress={() => void handleSave()}
          disabled={!isDirty || isBusy}
        >
          {isBusy ? (
            <ActivityIndicator size="small" color="#1DA1F2" />
          ) : (
            <Text className={`text-base font-semibold ${isDirty ? 'text-blue-500' : 'text-gray-300'}`}>
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          {/* Banner */}
          <Pressable
            onPress={async () => {
              const uri = await pickImage([3, 1]);
              if (uri) setLocalBannerUri(uri);
            }}
          >
            <View className="h-32 w-full bg-gray-200">
              {!!bannerUri && (
                <Image source={{ uri: bannerUri }} className="h-full w-full" resizeMode="cover" />
              )}
              <View className="absolute inset-0 items-center justify-center bg-black/30">
                <Feather name="camera" size={24} color="white" />
              </View>
            </View>
          </Pressable>

          {/* Avatar */}
          <View className="px-4">
            <Pressable
              className="-mt-10 self-start"
              onPress={async () => {
                const uri = await pickImage([1, 1]);
                if (uri) setLocalAvatarUri(uri);
              }}
            >
              <View className="relative">
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    className="h-20 w-20 rounded-full border-4 border-white bg-gray-200"
                  />
                ) : (
                  <View className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-blue-500">
                    <Text className="text-2xl font-bold text-white">{initials}</Text>
                  </View>
                )}
                <View className="absolute inset-0 items-center justify-center rounded-full bg-black/30">
                  <Feather name="camera" size={18} color="white" />
                </View>
              </View>
            </Pressable>
          </View>

          {/* Fields */}
          <View className="px-4 pt-6">
            <Field label="First Name" value={firstName} onChangeText={setFirstName} maxLength={100} />
            <Field label="Last Name" value={lastName} onChangeText={setLastName} maxLength={100} />
            <Field label="Bio" value={bio} onChangeText={setBio} maxLength={160} multiline />
            <Field label="Location" value={location} onChangeText={setLocation} maxLength={100} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  maxLength,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  maxLength: number;
  multiline?: boolean;
}) {
  return (
    <View className="mb-6">
      <Text className="text-xs text-gray-400 mb-1">{label}</Text>
      <TextInput
        className={`text-sm text-black border-b border-gray-300 pb-2 ${multiline ? 'min-h-16' : ''}`}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'auto'}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}
