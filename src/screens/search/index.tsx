import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Post } from '@/interfaces/post.interface';
import type { User } from '@/interfaces/user.interface';
import { PostCard } from '@/components/post-card';
import { useDebounce } from '@/hooks/common/useDebounce';
import { useSearch } from '@/hooks/services/search/useSearch';

type SearchTab = 'top' | 'latest' | 'people' | 'media';

const TABS: { key: SearchTab; label: string }[] = [
  { key: 'top', label: 'Top' },
  { key: 'latest', label: 'Latest' },
  { key: 'people', label: 'People' },
  { key: 'media', label: 'Media' },
];

type SearchEntry = { type: 'user'; item: User } | { type: 'post'; item: Post };

function UserRow({ user }: { user: User }) {
  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.username;
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <View className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-3">
      {user.profilePicture ? (
        <Image
          source={{ uri: user.profilePicture }}
          className="h-10 w-10 rounded-full bg-gray-200"
        />
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-300">
          <Text className="text-sm font-semibold text-gray-700">{initials}</Text>
        </View>
      )}
      <View>
        <Text className="text-sm font-bold text-black">{displayName}</Text>
        <Text className="text-sm text-gray-500">@{user.username}</Text>
        {!!user.bio && (
          <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
            {user.bio}
          </Text>
        )}
      </View>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View className="items-center pt-16">
      <Text className="text-base text-gray-400">{text}</Text>
    </View>
  );
}

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('top');
  const debouncedQuery = useDebounce(query, 400);

  const { data, isLoading } = useSearch(debouncedQuery);

  const users = data?.users ?? [];
  const posts = data?.posts ?? [];
  const mediaPosts = posts.filter((p) => !!p.image);

  const hasQuery = debouncedQuery.trim().length > 0;

  const topData: SearchEntry[] = [
    ...users.map((u) => ({ type: 'user' as const, item: u })),
    ...posts.map((p) => ({ type: 'post' as const, item: p })),
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search input */}
      <View className="px-4 pb-2 pt-3">
        <View className="flex-row items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
          <Text className="text-gray-400">🔍</Text>
          <TextInput
            className="flex-1 text-sm text-black"
            placeholder="Search X"
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {!!query && (
            <Pressable onPress={() => setQuery('')}>
              <Text className="text-gray-400">✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Tabs */}
      {hasQuery && (
        <View className="flex-row border-b border-gray-100">
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              className="relative flex-1 items-center py-3"
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === tab.key ? 'text-black' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </Text>
              {activeTab === tab.key && (
                <View className="absolute bottom-0 h-1 w-8 rounded-full bg-blue-500" />
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Results */}
      {!hasQuery ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-gray-400">Search for people or posts</Text>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : activeTab === 'top' ? (
        <FlatList
          data={topData}
          keyExtractor={(entry) => entry.item.id}
          renderItem={({ item: entry }) =>
            entry.type === 'user' ? (
              <UserRow user={entry.item} />
            ) : (
              <PostCard post={entry.item} />
            )
          }
          ListEmptyComponent={<EmptyState text="No results found" />}
        />
      ) : activeTab === 'latest' ? (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <PostCard post={item} />}
          ListEmptyComponent={<EmptyState text="No posts found" />}
        />
      ) : activeTab === 'people' ? (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => <UserRow user={item} />}
          ListEmptyComponent={<EmptyState text="No people found" />}
        />
      ) : (
        <FlatList
          data={mediaPosts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <PostCard post={item} />}
          ListEmptyComponent={<EmptyState text="No media posts found" />}
        />
      )}
    </SafeAreaView>
  );
}
