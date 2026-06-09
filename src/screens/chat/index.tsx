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
import type { Message } from '@/interfaces/conversation.interface';
import { useConversationWS } from '@/hooks/common/useConversationWS';
import { useMessages } from '@/hooks/services/conversations/useMessages';
import { clientRequest } from '@/services/client';
import { useAppStore } from '@/store/auth-store';

interface Props {
  conversationId: string;
  otherName: string;
  otherUsername: string;
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <View className={`mb-2 ${isOwn ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-xs rounded-2xl px-4 py-2.5 ${
          isOwn ? 'bg-blue-500' : 'bg-gray-100'
        }`}
      >
        <Text className={`text-sm ${isOwn ? 'text-white' : 'text-black'}`}>
          {message.body}
        </Text>
      </View>
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

  // Mark all incoming messages as read on mount
  useEffect(() => {
    void clientRequest.conversations.markRead(conversationId).catch(() => {});
  }, [conversationId]);

  // Deduplicate: WS may echo a message already in history on reconnect
  const historyIds = new Set(historyMessages.map((m) => m.id));
  const allMessages = [
    ...historyMessages,
    ...wsMessages.filter((m) => !historyIds.has(m.id)),
  ];

  // Scroll to bottom when history loads
  useEffect(() => {
    if (historyMessages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: false });
    }
  }, [historyMessages.length]);

  // Scroll to bottom when new WS message arrives
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-1">
          <Text className="text-xl text-black">←</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-base font-bold text-black">{otherName}</Text>
          {!!otherUsername && (
            <Text className="text-xs text-gray-500">@{otherUsername}</Text>
          )}
        </View>
        {!isConnected && (
          <ActivityIndicator size="small" color="#9ca3af" />
        )}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            className="flex-1 px-4"
            data={allMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isOwn={item.senderId === currentUser?.id}
              />
            )}
            contentContainerStyle={{ paddingVertical: 12 }}
            ListEmptyComponent={
              <View className="flex-1 items-center pt-12">
                <Text className="text-sm text-gray-400">
                  No messages yet. Say hello!
                </Text>
              </View>
            }
          />
        )}

        {/* Input bar */}
        <View className="flex-row items-end gap-2 border-t border-gray-100 px-4 py-2">
          <TextInput
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-black"
            placeholder="Start a new message"
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || !isConnected}
            className={`h-9 w-9 items-center justify-center rounded-full bg-blue-500 ${
              !input.trim() || !isConnected ? 'opacity-40' : ''
            }`}
          >
            <Text className="font-bold text-white">↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
