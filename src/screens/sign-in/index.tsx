import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSync } from '@/hooks/services';

WebBrowser.maybeCompleteAuthSession();

export function SignInScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const syncMutation = useSync();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const afterAuth = () => {
    syncMutation.mutate();
  };

  const handleSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        afterAuth();
      } else {
        setError('Sign in could not be completed. Please try again.');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow();
      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        afterAuth();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Google sign in failed. Please try again.';
      setError(msg);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-8">
        <Text className="mb-8 text-center text-4xl font-bold text-black">𝕏</Text>

        <Text className="mb-6 text-2xl font-bold text-black">Sign in to X</Text>

        {!!error && (
          <View className="mb-4 rounded-lg bg-red-50 p-3">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        )}

        <View className="mb-4 gap-3">
          <TextInput
            className="h-12 rounded-lg border border-gray-300 px-4 text-base text-black"
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="h-12 rounded-lg border border-gray-300 px-4 text-base text-black"
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <Pressable
          className="mb-4 h-12 items-center justify-center rounded-full bg-black disabled:opacity-50"
          onPress={handleSignIn}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-bold text-white">Sign in</Text>
          )}
        </Pressable>

        <View className="mb-4 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-gray-200" />
          <Text className="text-sm text-gray-400">or</Text>
          <View className="h-px flex-1 bg-gray-200" />
        </View>

        <Pressable
          className="mb-6 h-12 flex-row items-center justify-center gap-2 rounded-full border border-gray-300"
          onPress={handleGoogleSignIn}
        >
          <Text className="text-base font-semibold text-black">Continue with Google</Text>
        </Pressable>

        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-gray-500">Don't have an account?</Text>
          <Pressable onPress={() => router.push('/(auth)/sign-up')}>
            <Text className="text-sm font-semibold text-black">Sign up</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
