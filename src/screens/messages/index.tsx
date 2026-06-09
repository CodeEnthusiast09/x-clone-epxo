import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { ConversationView } from '@/interfaces/conversation.interface';
import type { User } from '@/interfaces/user.interface';
import { useConversations } from '@/hooks/services/conversations/useConversations';
import { useStartConversation } from '@/hooks/services/conversations/useStartConversation';
import { useAppStore } from '@/store/auth-store';

function Avatar({ user }: { user: User }) {
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

function formatPreviewTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ConversationRow({
  item,
  currentUserId,
  onPress,
}: {
  item: ConversationView;
  currentUserId: string;
  onPress: () => void;
}) {
  const other = item.participant1Id === currentUserId ? item.participant2 : item.participant1;
  const displayName = `${other.firstName} ${other.lastName}`.trim() || other.username;

  return (
    <Pressable className="flex-row items-center gap-3 px-4 py-3" onPress={onPress}>
      <Avatar user={other} />
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold text-black">{displayName}</Text>
          {item.lastMessage && (
            <Text className="text-xs text-gray-400">
              {formatPreviewTime(item.lastMessage.createdAt)}
            </Text>
          )}
        </View>
        <View className="mt-0.5 flex-row items-center justify-between">
          <Text className="flex-1 text-sm text-gray-500" numberOfLines={1}>
            {item.lastMessage?.body ?? 'No messages yet'}
          </Text>
          {item.unreadCount > 0 && (
            <View className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-blue-500">
              <Text className="text-xs font-bold text-white">
                {item.unreadCount > 9 ? '9+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function MessagesScreen() {
  const currentUser = useAppStore((s) => s.currentUser);
  const { data: conversations = [], isLoading, refetch, isRefetching } = useConversations();
  const startConversation = useStartConversation();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [startError, setStartError] = useState('');

  if (!currentUser) return null;

  const handleConversationPress = (conv: ConversationView) => {
    const other =
      conv.participant1Id === currentUser.id ? conv.participant2 : conv.participant1;
    const name = `${other.firstName} ${other.lastName}`.trim() || other.username;
    router.push(
      `/chat/${conv.id}?name=${encodeURIComponent(name)}&username=${encodeURIComponent(other.username)}`,
    );
  };

  const handleStartChat = () => {
    const raw = recipientUsername.trim().replace(/^@/, '');
    if (!raw) return;
    setStartError('');
    startConversation.mutate(raw, {
      onSuccess: (conv) => {
        setShowModal(false);
        setRecipientUsername('');
        const other =
          conv.participant1Id === currentUser.id ? conv.participant2 : conv.participant1;
        const name = `${other.firstName} ${other.lastName}`.trim() || other.username;
        router.push(
          `/chat/${conv.id}?name=${encodeURIComponent(name)}&username=${encodeURIComponent(other.username)}`,
        );
      },
      onError: (e) => {
        setStartError(e instanceof Error ? e.message : 'Something went wrong');
      },
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setRecipientUsername('');
    setStartError('');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <Text className="text-xl font-bold text-black">Messages</Text>
        <Pressable onPress={() => setShowModal(true)} className="p-1">
          <Text className="text-2xl">✏️</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationRow
              item={item}
              currentUserId={currentUser.id}
              onPress={() => handleConversationPress(item)}
            />
          )}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View className="items-center pt-20">
              <Text className="text-base text-gray-400">No conversations yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <Pressable onPress={handleCloseModal}>
              <Text className="text-base text-gray-500">Cancel</Text>
            </Pressable>
            <Text className="text-base font-bold text-black">New message</Text>
            <Pressable
              onPress={handleStartChat}
              disabled={!recipientUsername.trim() || startConversation.isPending}
              className={`rounded-full bg-black px-4 py-1.5 ${
                !recipientUsername.trim() || startConversation.isPending ? 'opacity-40' : ''
              }`}
            >
              <Text className="text-sm font-bold text-white">
                {startConversation.isPending ? '...' : 'Next'}
              </Text>
            </Pressable>
          </View>

          <View className="px-4 pt-4">
            <TextInput
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-black"
              placeholder="@username"
              placeholderTextColor="#9ca3af"
              value={recipientUsername}
              onChangeText={(t) => {
                setRecipientUsername(t);
                setStartError('');
              }}
              autoCapitalize="none"
              autoFocus
            />
            {!!startError && (
              <Text className="mt-2 text-sm text-red-500">{startError}</Text>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
