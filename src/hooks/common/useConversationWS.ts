import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useRef, useState } from 'react';
import { API_URL } from '@/constants';
import type { Message } from '@/interfaces/conversation.interface';

function toWsUrl(url: string): string {
  return url.replace(/^http/, 'ws');
}

// React Native extends the WebSocket constructor to accept a headers option.
// This is not in the standard lib — cast through unknown to avoid `any`.
type RNWebSocketConstructor = new (
  url: string,
  protocols?: string | string[],
  options?: { headers?: Record<string, string> }
) => WebSocket;

export function useConversationWS(conversationId: string) {
  const { getToken } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [wsMessages, setWsMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function connect() {
      try {
        const token = await getToken();
        if (!mounted || !token) return;

        const url = `${toWsUrl(API_URL)}/api/conversations/${conversationId}/ws`;
        const Ctor = WebSocket as unknown as RNWebSocketConstructor;
        const ws = new Ctor(url, undefined, {
          headers: { Authorization: `Bearer ${token}` },
        });
        wsRef.current = ws;

        ws.onopen = () => {
          if (mounted) setIsConnected(true);
        };

        ws.onclose = () => {
          if (mounted) setIsConnected(false);
        };

        ws.onerror = () => {
          if (mounted) setIsConnected(false);
        };

        ws.onmessage = (e) => {
          if (!mounted) return;
          try {
            const event = JSON.parse(e.data as string) as { type: string; data: unknown };
            if (event.type === 'message') {
              setWsMessages((prev) => [...prev, event.data as Message]);
            }
          } catch {
            // ignore malformed frames
          }
        };
      } catch {
        // getToken rejected — session unavailable
      }
    }

    void connect();

    return () => {
      mounted = false;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [conversationId, getToken]);

  function sendMessage(body: string): void {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ body }));
    }
  }

  return { wsMessages, sendMessage, isConnected };
}
