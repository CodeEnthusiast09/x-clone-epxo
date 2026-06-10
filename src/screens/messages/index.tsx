import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import type { ConversationView } from '@/interfaces/conversation.interface';
import type { User } from '@/interfaces/user.interface';
import { useConversations } from '@/hooks/services/conversations/useConversations';
import { useStartConversation } from '@/hooks/services/conversations/useStartConversation';
import { useAppStore } from '@/store/auth-store';

function Avatar({ user }: { user: User }) {
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  if (user.profilePicture) {
    return <Image source={{ uri: user.profilePicture }} className="h-12 w-12 rounded-full bg-gray-200" />;
  }
  return (
    <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500">
      <Text className="text-base font-bold text-white">{initials}</Text>
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
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
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
    <Pressable
      className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
      onPress={onPress}
    >
      <Avatar user={other} />
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-1">
            <Text className="font-semibold text-gray-900">{displayName}</Text>
            <Text className="text-gray-500 text-sm ml-1">@{other.username}</Text>
          </View>
          {item.lastMessage && (
            <Text className="text-gray-500 text-sm">{formatPreviewTime(item.lastMessage.createdAt)}</Text>
          )}
        </View>
        <View className="flex-row items-center justify-between">
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
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [startError, setStartError] = useState('');

  if (!currentUser) return null;

  const filtered = searchText.trim()
    ? conversations.filter((c) => {
        const other = c.participant1Id === currentUser.id ? c.participant2 : c.participant1;
        const name = `${other.firstName} ${other.lastName}`.trim() || other.username;
        return (
          name.toLowerCase().includes(searchText.toLowerCase()) ||
          other.username.toLowerCase().includes(searchText.toLowerCase())
        );
      })
    : conversations;

  const handleConversationPress = (conv: ConversationView) => {
    const other = conv.participant1Id === currentUser.id ? conv.participant2 : conv.participant1;
    const name = `${other.firstName} ${other.lastName}`.trim() || other.username;
    router.push(`/chat/${conv.id}?name=${encodeURIComponent(name)}&username=${encodeURIComponent(other.username)}`);
  };

  const handleStartChat = () => {
    const raw = recipientUsername.trim().replace(/^@/, '');
    if (!raw) return;
    setStartError('');
    startConversation.mutate(raw, {
      onSuccess: (conv) => {
        setShowModal(false);
        setRecipientUsername('');
        const other = conv.participant1Id === currentUser.id ? conv.participant2 : conv.participant1;
        const name = `${other.firstName} ${other.lastName}`.trim() || other.username;
        router.push(`/chat/${conv.id}?name=${encodeURIComponent(name)}&username=${encodeURIComponent(other.username)}`);
      },
      onError: (e) => setStartError(e instanceof Error ? e.message : 'Something went wrong'),
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setRecipientUsername('');
    setStartError('');
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <Text className="text-xl font-bold text-gray-900">Messages</Text>
        <Pressable onPress={() => setShowModal(true)} hitSlop={8}>
          <Feather name="edit" size={24} color="#1DA1F2" />
        </Pressable>
      </View>

      {/* Search bar */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            className="flex-1 ml-3 text-base text-black"
            placeholder="Search for people and groups"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      ) : (
        <FlatList
          className="flex-1"
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationRow
              item={item}
              currentUserId={currentUser.id}
              onPress={() => handleConversationPress(item)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1DA1F2" />
          }
          contentContainerStyle={{ paddingBottom: 48 + insets.bottom }}
          ListEmptyComponent={
            <View className="items-center pt-20">
              <Text className="text-base text-gray-400">No conversations yet</Text>
            </View>
          }
        />
      )}

      {/* Hint */}
      <View className="border-t border-gray-100 bg-gray-50 px-4 py-2">
        <Text className="text-xs text-gray-500 text-center">Tap to open • Long press to delete</Text>
      </View>

      {/* New message modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <Pressable onPress={handleCloseModal}>
              <Text className="text-base text-blue-500">Cancel</Text>
            </Pressable>
            <Text className="text-base font-bold text-black">New message</Text>
            <Pressable
              onPress={handleStartChat}
              disabled={!recipientUsername.trim() || startConversation.isPending}
              className={`rounded-full bg-black px-4 py-1.5 ${!recipientUsername.trim() || startConversation.isPending ? 'opacity-40' : ''}`}
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
              onChangeText={(t) => { setRecipientUsername(t); setStartError(''); }}
              autoCapitalize="none"
              autoFocus
            />
            {!!startError && <Text className="mt-2 text-sm text-red-500">{startError}</Text>}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
