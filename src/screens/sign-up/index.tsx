import { useSignUp } from '@clerk/clerk-expo';
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

type Step = 'form' | 'verify';

export function SignUpScreen() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const syncMutation = useSync();

  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!isLoaded) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Sign up failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        syncMutation.mutate();
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-center px-8">
          <Text className="mb-2 text-2xl font-bold text-black">Check your email</Text>
          <Text className="mb-8 text-sm text-gray-500">
            We sent a 6-digit code to {email}
          </Text>

          {!!error && (
            <View className="mb-4 rounded-lg bg-red-50 p-3">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          )}

          <TextInput
            className="mb-4 h-12 rounded-lg border border-gray-300 px-4 text-center text-xl tracking-widest text-black"
            placeholder="000000"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />

          <Pressable
            className="h-12 items-center justify-center rounded-full bg-black disabled:opacity-50"
            onPress={handleVerify}
            disabled={loading || code.length < 6}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-bold text-white">Verify email</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-8">
        <Text className="mb-8 text-center text-4xl font-bold text-black">𝕏</Text>
        <Text className="mb-6 text-2xl font-bold text-black">Create your account</Text>

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
          <TextInput
            className="h-12 rounded-lg border border-gray-300 px-4 text-base text-black"
            placeholder="Confirm password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <Pressable
          className="mb-6 h-12 items-center justify-center rounded-full bg-black disabled:opacity-50"
          onPress={handleSignUp}
          disabled={loading || !email || !password || !confirmPassword}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-bold text-white">Create account</Text>
          )}
        </Pressable>

        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-gray-500">Already have an account?</Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-sm font-semibold text-black">Sign in</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
