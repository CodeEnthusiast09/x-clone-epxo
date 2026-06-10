import '../global.css';

import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CLERK_PUBLISHABLE_KEY } from '@/constants';
import { usePushNotifications } from '@/hooks/common/usePushNotifications';
import { useSync } from '@/hooks/services/auth/useSync';
import { queryClient } from '@/lib/query-client';
import { tokenCache } from '@/lib/token-cache';
import { setTokenGetter } from '@/services/client/client-request-gateway';
import { useAppStore } from '@/store/auth-store';

function AuthGuard() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const syncMutation = useSync();

  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, segments, router]);

  // Auto-sync on cold start. Retries every 3s while the JWT is still warm
  // (e.g. first request takes ~10s for Clerk JWKS fetch on a cold backend).
  useEffect(() => {
    if (!isSignedIn || !!currentUser || syncMutation.isPending) return;
    if (syncMutation.isError) {
      const id = setTimeout(() => syncMutation.reset(), 3000);
      return () => clearTimeout(id);
    }
    syncMutation.mutate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, currentUser, syncMutation.isPending, syncMutation.isError]);

  usePushNotifications(!!isSignedIn);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
      <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
      <Stack.Screen name="profile/[username]" />
      <Stack.Screen name="chat/[conversationId]" />
      <Stack.Screen name="sso-callback" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AuthGuard />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
