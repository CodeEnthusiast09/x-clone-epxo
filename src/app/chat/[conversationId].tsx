import { useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '@/screens/chat';

export default function ChatRoute() {
  const { conversationId, name, username } = useLocalSearchParams<{
    conversationId: string;
    name?: string;
    username?: string;
  }>();

  return (
    <ChatScreen
      conversationId={conversationId}
      otherName={name ?? 'Chat'}
      otherUsername={username ?? ''}
    />
  );
}
