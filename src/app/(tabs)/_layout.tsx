import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  focused,
}: {
  name: { active: IconName; inactive: IconName };
  focused: boolean;
}) {
  return <Ionicons name={focused ? name.active : name.inactive} size={24} color="black" />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#000',
        tabBarStyle: { borderTopColor: '#e5e7eb' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={{ active: 'home', inactive: 'home-outline' }} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={{ active: 'search', inactive: 'search-outline' }} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={{ active: 'notifications', inactive: 'notifications-outline' }}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={{ active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' }}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={{ active: 'person', inactive: 'person-outline' }} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
