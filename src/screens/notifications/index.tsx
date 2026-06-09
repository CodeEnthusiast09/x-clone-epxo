import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNotifications, useMarkAllRead } from '@/hooks/services/notifications';
import { formatRelativeTime } from '@/utils/format-date';
import type { Notification } from '@/interfaces/notification.interface';

function notificationText(n: Notification): string {
  const name = `${n.actor.firstName} ${n.actor.lastName}`.trim() || n.actor.username;
  switch (n.type) {
    case 'like':
      return `${name} liked your post`;
    case 'comment':
      return `${name} commented on your post`;
    case 'follow':
      return `${name} followed you`;
    default:
      return `${name} interacted with you`;
  }
}

function NotificationItem({ item }: { item: Notification }) {
  const actor = item.actor;
  const initials = `${actor.firstName[0] ?? ''}${actor.lastName[0] ?? ''}`.toUpperCase();

  return (
    <View className={`flex-row items-center gap-3 px-4 py-3 ${!item.read ? 'bg-blue-50' : 'bg-white'}`}>
      {/* Unread dot */}
      <View className="w-2 items-center">
        {!item.read && <View className="h-2 w-2 rounded-full bg-blue-500" />}
      </View>

      {/* Actor avatar */}
      {actor.profilePicture ? (
        <Image
          source={{ uri: actor.profilePicture }}
          className="h-10 w-10 rounded-full bg-gray-200"
        />
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-300">
          <Text className="text-sm font-semibold text-gray-700">{initials}</Text>
        </View>
      )}

      {/* Text + time */}
      <View className="flex-1">
        <Text className="text-sm text-black" numberOfLines={2}>
          {notificationText(item)}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-400">
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>

      {/* Type icon */}
      <Text className="text-lg">
        {item.type === 'like' ? '❤️' : item.type === 'comment' ? '💬' : '👤'}
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

  useEffect(() => {
    markAllRead.mutate();
    Notifications.setBadgeCountAsync(0).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items: Notification[] = data?.pages.flatMap((p) => p.data.data ?? []) ?? [];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-base text-gray-500">
          Something went wrong. Pull to refresh.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ItemSeparatorComponent={() => <View className="h-px bg-gray-100" />}
        ListEmptyComponent={
          <View className="items-center px-8 pt-20">
            <Text className="text-center text-base text-gray-400">No notifications yet.</Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#000" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
