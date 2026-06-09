import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEditProfile } from '@/hooks/services/users';
import { useAppStore } from '@/store/auth-store';

export function EditProfileScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const editProfile = useEditProfile();

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '');
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [location, setLocation] = useState(currentUser?.location ?? '');

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName);
      setBio(currentUser.bio ?? '');
      setLocation(currentUser.location ?? '');
    }
  }, [currentUser]);

  const isDirty =
    firstName !== (currentUser?.firstName ?? '') ||
    lastName !== (currentUser?.lastName ?? '') ||
    bio !== (currentUser?.bio ?? '') ||
    location !== (currentUser?.location ?? '');

  const handleSave = () => {
    if (!isDirty || editProfile.isPending) return;
    editProfile.mutate(
      { firstName, lastName, bio, location },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-base text-gray-500">Cancel</Text>
        </Pressable>
        <Text className="text-base font-bold text-black">Edit profile</Text>
        <Pressable
          onPress={handleSave}
          disabled={!isDirty || editProfile.isPending}
          className={`rounded-full bg-black px-4 py-1.5 ${!isDirty || editProfile.isPending ? 'opacity-40' : ''}`}
        >
          {editProfile.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-sm font-bold text-white">Save</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
          <Field label="First name" value={firstName} onChangeText={setFirstName} maxLength={100} />
          <Field label="Last name" value={lastName} onChangeText={setLastName} maxLength={100} />
          <Field label="Bio" value={bio} onChangeText={setBio} maxLength={160} multiline />
          <Field label="Location" value={location} onChangeText={setLocation} maxLength={100} />
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
    <View className="mb-5">
      <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </Text>
      <TextInput
        className={`rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-black ${multiline ? 'min-h-20' : ''}`}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'auto'}
        placeholderTextColor="#9ca3af"
      />
      <Text className="mt-1 text-right text-xs text-gray-400">
        {value.length}/{maxLength}
      </Text>
    </View>
  );
}
