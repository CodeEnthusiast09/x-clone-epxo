import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { clientRequest } from '@/services/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { granted: alreadyGranted } = await Notifications.getPermissionsAsync();
  if (!alreadyGranted) {
    const { granted } = await Notifications.requestPermissionsAsync();
    if (!granted) return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

interface NotificationData {
  type?: string;
  actorUsername?: string;
  postId?: string;
}

export function usePushNotifications(enabled: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    let pushToken: string | null = null;

    registerForPushNotifications()
      .then((token) => {
        if (!token) return;
        pushToken = token;
        return clientRequest.notifications.registerPushToken(token);
      })
      .catch((err) => {
        console.warn('Push notification setup failed:', err);
      });

    // Shown while app is foregrounded — handled automatically by setNotificationHandler
    const foregroundSub = Notifications.addNotificationReceivedListener(() => {});

    // Tapped from background or killed state
    const tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationData;
      if (data.type === 'follow' && data.actorUsername) {
        router.push(`/profile/${data.actorUsername}`);
      } else {
        router.push('/(tabs)/notifications');
      }
    });

    return () => {
      foregroundSub.remove();
      tapSub.remove();
      if (pushToken) {
        clientRequest.notifications.unregisterPushToken(pushToken).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
