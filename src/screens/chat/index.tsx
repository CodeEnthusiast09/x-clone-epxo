import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import type { Message } from '@/interfaces/conversation.interface';
import { useConversationWS } from '@/hooks/common/useConversationWS';
import { useMessages } from '@/hooks/services/conversations/useMessages';
import { clientRequest } from '@/services/client';
import { useAppStore } from '@/store/auth-store';
import { formatRelativeTime } from '@/utils/format-date';

interface Props {
  conversationId: string;
  otherName: string;
  otherUsername: string;
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <View className={`mb-1 ${isOwn ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-xs rounded-2xl px-4 py-3 ${isOwn ? 'bg-blue-500' : 'bg-gray-100'}`}
      >
        <Text className={`text-base ${isOwn ? 'text-white' : 'text-gray-900'}`}>
          {message.body}
        </Text>
      </View>
      <Text className="text-xs text-gray-400 mt-1 mx-1">
        {formatRelativeTime(message.createdAt)}
      </Text>
    </View>
  );
}

export function ChatScreen({ conversationId, otherName, otherUsername }: Props) {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);

  const { data: historyMessages = [], isLoading } = useMessages(conversationId);
  const { wsMessages, sendMessage, isConnected } = useConversationWS(conversationId);

  useEffect(() => {
    void clientRequest.conversations.markRead(conversationId).catch(() => {});
  }, [conversationId]);

  const historyIds = new Set(historyMessages.map((m) => m.id));
  const allMessages = [
    ...historyMessages,
    ...wsMessages.filter((m) => !historyIds.has(m.id)),
  ];

  useEffect(() => {
    if (historyMessages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: false });
    }
  }, [historyMessages.length]);

  useEffect(() => {
    if (wsMessages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [wsMessages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !isConnected) return;
    sendMessage(text);
    setInput('');
  };

  const initials = otherName
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Feather name="arrow-left" size={24} color="#1DA1F2" />
        </Pressable>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-500 mr-3">
          <Text className="text-sm font-bold text-white">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900">{otherName}</Text>
          {!!otherUsername && (
            <Text className="text-gray-500 text-sm">@{otherUsername}</Text>
          )}
        </View>
        {!isConnected && <ActivityIndicator size="small" color="#9ca3af" />}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#1DA1F2" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            className="flex-1 px-4"
            data={allMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble message={item} isOwn={item.senderId === currentUser?.id} />
            )}
            contentContainerStyle={{ paddingVertical: 12 }}
            ListHeaderComponent={
              <Text className="text-center text-gray-400 text-sm mb-4">
                This is the beginning of your conversation with {otherName}
              </Text>
            }
            ListEmptyComponent={null}
          />
        )}

        {/* Input bar */}
        <View className="flex-row items-center border-t border-gray-100 px-4 py-3">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3 mr-3">
            <TextInput
              className="flex-1 text-base text-black"
              placeholder="Start a message..."
              placeholderTextColor="#657786"
              value={input}
              onChangeText={setInput}
              multiline
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || !isConnected}
            className={`h-10 w-10 items-center justify-center rounded-full ${
              input.trim() && isConnected ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <Feather name="send" size={18} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
