import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNotifications, useMarkAllRead, useResetUnreadCount } from '@/hooks/services/notifications';
import { formatRelativeTime } from '@/utils/format-date';
import type { Notification } from '@/interfaces/notification.interface';

const isExpoGo = Constants.appOwnership === 'expo';

function getNotificationText(n: Notification): string {
  const name = `${n.actor.firstName} ${n.actor.lastName}`.trim() || n.actor.username;
  switch (n.type) {
    case 'like':    return `${name} liked your post`;
    case 'comment': return `${name} commented on your post`;
    case 'follow':  return `${name} started following you`;
    default:        return `${name} interacted with you`;
  }
}

function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'like':
      return <Feather name="heart" size={16} color="#E0245E" />;
    case 'comment':
      return <Feather name="message-circle" size={16} color="#1DA1F2" />;
    case 'follow':
      return <Feather name="user-plus" size={16} color="#17BF63" />;
    default:
      return <Feather name="bell" size={16} color="#657786" />;
  }
}

function NotificationItem({ item }: { item: Notification }) {
  const actor = item.actor;
  const router = useRouter();
  const initials = `${actor.firstName[0] ?? ''}${actor.lastName[0] ?? ''}`.toUpperCase();

  return (
    <Pressable
      className="border-b border-gray-100 bg-white active:bg-gray-50"
      onPress={() => router.push(`/profile/${actor.username}`)}
    >
      <View className="flex-row p-4">
        {/* Avatar with type icon overlay */}
        <View className="relative mr-3">
          {actor.profilePicture ? (
            <Image source={{ uri: actor.profilePicture }} className="h-12 w-12 rounded-full bg-gray-200" />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500">
              <Text className="text-base font-bold text-white">{initials}</Text>
            </View>
          )}
          <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-100">
            <NotificationIcon type={item.type} />
          </View>
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <View className="flex-1 mr-2">
              <Text className="text-gray-900 text-base leading-5">
                <Text className="font-semibold">{`${actor.firstName} ${actor.lastName}`.trim() || actor.username}</Text>
                <Text className="text-gray-500"> @{actor.username}</Text>
              </Text>
              <Text className="text-gray-700 text-sm mt-0.5">{getNotificationText(item)}</Text>
            </View>
          </View>
          <Text className="text-gray-400 text-xs">{formatRelativeTime(item.createdAt)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function NoNotificationsFound() {
  return (
    <View className="flex-1 items-center justify-center px-8" style={{ minHeight: 400 }}>
      <Feather name="bell" size={80} color="#E1E8ED" />
      <Text className="text-2xl font-semibold text-gray-500 mt-6 mb-3">No notifications yet</Text>
      <Text className="text-gray-400 text-center text-base leading-6 max-w-xs">
        When people like, comment, or follow you, you&apos;ll see it here.
      </Text>
    </View>
  );
}

export function NotificationsScreen() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useNotifications();

  const markAllRead = useMarkAllRead();
  const resetUnreadCount = useResetUnreadCount();

  useEffect(() => {
    markAllRead.mutate();
    resetUnreadCount();
    if (!isExpoGo) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Notifs = require('expo-notifications') as typeof import('expo-notifications');
      Notifs.setBadgeCountAsync(0).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items: Notification[] = data?.pages.flatMap((p) => p.data.data ?? []) ?? [];

  if (isError) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
          <Text className="text-xl font-bold text-gray-900">Notifications</Text>
          <Feather name="settings" size={24} color="#657786" />
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base text-gray-500">Something went wrong. Pull to refresh.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <Text className="text-xl font-bold text-gray-900">Notifications</Text>
        <Feather name="settings" size={24} color="#657786" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      ) : items.length === 0 ? (
        <NoNotificationsFound />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationItem item={item} />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1DA1F2" />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#1DA1F2" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
