import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import type { Post } from '@/interfaces/post.interface';
import type { User } from '@/interfaces/user.interface';
import { PostCard } from '@/components/post-card';
import { useDebounce } from '@/hooks/common/useDebounce';
import { useSearch } from '@/hooks/services/search/useSearch';

const TRENDING_TOPICS = [
  { topic: '#ReactNative', tweets: '125K' },
  { topic: '#TypeScript', tweets: '89K' },
  { topic: '#WebDevelopment', tweets: '234K' },
  { topic: '#AI', tweets: '567K' },
  { topic: '#TechNews', tweets: '98K' },
];

type SearchTab = 'top' | 'latest' | 'people' | 'media';

const TABS: { key: SearchTab; label: string }[] = [
  { key: 'top', label: 'Top' },
  { key: 'latest', label: 'Latest' },
  { key: 'people', label: 'People' },
  { key: 'media', label: 'Media' },
];

type SearchEntry = { type: 'user'; item: User } | { type: 'post'; item: Post };

function UserRow({ user }: { user: User }) {
  const router = useRouter();
  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.username;
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <Pressable
      className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-3"
      onPress={() => router.push(`/profile/${user.username}`)}
    >
      {user.profilePicture ? (
        <Image source={{ uri: user.profilePicture }} className="h-12 w-12 rounded-full bg-gray-200" />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500">
          <Text className="text-base font-bold text-white">{initials}</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="font-bold text-gray-900">{displayName}</Text>
        <Text className="text-gray-500 text-sm">@{user.username}</Text>
        {!!user.bio && (
          <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>{user.bio}</Text>
        )}
      </View>
    </Pressable>
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
      {/* Search bar */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            className="flex-1 ml-3 text-base text-black"
            placeholder="Search Twitter"
            placeholderTextColor="#657786"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {!!query && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Feather name="x" size={18} color="#657786" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Trending (no query) */}
      {!hasQuery ? (
        <ScrollView className="flex-1">
          <View className="p-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Trending for you</Text>
            {TRENDING_TOPICS.map((item, index) => (
              <TouchableOpacity key={index} className="py-3 border-b border-gray-100">
                <Text className="text-gray-500 text-sm">Trending in Technology</Text>
                <Text className="font-bold text-gray-900 text-lg">{item.topic}</Text>
                <Text className="text-gray-500 text-sm">{item.tweets} Tweets</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <>
          {/* Tabs */}
          <View className="flex-row border-b border-gray-100">
            {TABS.map((tab) => (
              <Pressable
                key={tab.key}
                className="relative flex-1 items-center py-3"
                onPress={() => setActiveTab(tab.key)}
              >
                <Text className={`text-sm font-semibold ${activeTab === tab.key ? 'text-black' : 'text-gray-400'}`}>
                  {tab.label}
                </Text>
                {activeTab === tab.key && (
                  <View className="absolute bottom-0 h-1 w-8 rounded-full bg-blue-500" />
                )}
              </Pressable>
            ))}
          </View>

          {/* Results */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#1DA1F2" />
            </View>
          ) : activeTab === 'top' ? (
            <FlatList
              data={topData}
              keyExtractor={(entry) => entry.item.id}
              renderItem={({ item: entry }) =>
                entry.type === 'user' ? <UserRow user={entry.item} /> : <PostCard post={entry.item} />
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
        </>
      )}
    </SafeAreaView>
  );
}
