import { useAuth, useSignUp, useSSO } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Toast } from '@/components/toast';
import { useSync } from '@/hooks/services';

const shadowStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
};

type Step = 'form' | 'verify';

export function SignUpScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();
  const syncMutation = useSync();

  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState('');

  const afterAuth = () => {
    syncMutation.mutate();
  };

  const handleSignUp = async () => {
    if (!isLoaded) return;
    if (isSignedIn) { router.replace('/(tabs)'); return; }
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
        afterAuth();
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

  const handleOAuth = async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (isSignedIn) { router.replace('/(tabs)'); return; }
    setSsoLoading(true);
    setError('');
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        afterAuth();
      }
    } catch (err: unknown) {
      const provider = strategy === 'oauth_google' ? 'Google' : 'Apple';
      const msg =
        err instanceof Error ? err.message : `${provider} sign up failed. Please try again.`;
      setError(msg);
    } finally {
      setSsoLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <View className="flex-1">
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior="padding"
        >
          <View className="flex-1 justify-center px-8">
            <Text className="mb-2 text-2xl font-bold text-black">Check your email</Text>
            <Text className="mb-8 text-sm text-gray-500">
              We sent a 6-digit code to {email}
            </Text>

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
              onPress={() => void handleVerify()}
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
        <Toast message={error} visible={!!error} onHide={() => setError('')} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior="padding"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 32,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Demo image */}
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('../../../assets/images/auth1.png')}
            style={{ width: '100%', height: 240, marginBottom: 32 }}
            resizeMode="contain"
          />

          <View style={{ gap: 12 }}>
            {/* Google */}
            <Pressable
              className="flex-row items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3"
              style={shadowStyle}
              onPress={() => void handleOAuth('oauth_google')}
              disabled={ssoLoading || loading}
            >
              {ssoLoading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <>
                  <Image
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    source={require('../../../assets/images/google.png')}
                    style={{ width: 24, height: 24, marginRight: 12 }}
                    resizeMode="contain"
                  />
                  <Text className="text-base font-medium text-black">Continue with Google</Text>
                </>
              )}
            </Pressable>

            {/* Apple */}
            <Pressable
              className="flex-row items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3"
              style={shadowStyle}
              onPress={() => void handleOAuth('oauth_apple')}
              disabled={ssoLoading || loading}
            >
              {ssoLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Image
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    source={require('../../../assets/images/apple.png')}
                    style={{ width: 24, height: 24, marginRight: 12 }}
                    resizeMode="contain"
                  />
                  <Text className="text-base font-medium text-black">Continue with Apple</Text>
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View className="my-1 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-gray-200" />
              <Text className="text-sm text-gray-400">or</Text>
              <View className="h-px flex-1 bg-gray-200" />
            </View>

            {/* Email / password / confirm */}
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

            <Pressable
              className="h-12 items-center justify-center rounded-full bg-black disabled:opacity-50"
              onPress={() => void handleSignUp()}
              disabled={loading || ssoLoading || !email || !password || !confirmPassword}
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

            <Text className="px-2 text-center text-xs leading-4 text-gray-500">
              By signing up, you agree to our{' '}
              <Text className="text-blue-500">Terms</Text>
              {', '}
              <Text className="text-blue-500">Privacy Policy</Text>
              {', and '}
              <Text className="text-blue-500">Cookie Use</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast message={error} visible={!!error} onHide={() => setError('')} />
    </View>
  );
}
