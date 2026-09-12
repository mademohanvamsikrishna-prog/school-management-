import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { COLORS } from '../../constants/theme';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { StudentSidebar } from '../../components/students/StudentSidebar';

export default function StudentLayout() {
  const IS_WEB = Platform.OS === 'web';

  const tabs = (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        // On web the sidebar handles navigation — hide the bottom bar entirely.
        tabBarStyle: IS_WEB
          ? { display: 'none' }
          : {
              backgroundColor: COLORS.card,
              borderTopColor: COLORS.border,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="academics"
        options={{
          title: 'Academics',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>📚</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>📅</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>💬</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>👤</Text>
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="add"   options={{ href: null }} />
    </Tabs>
  );

  if (IS_WEB) {
    return (
      <AuthGuard allowedRoles={['student', 'admin']}>
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#F1F5F9' }}>
          {/* Persistent sidebar — visible on every student page on web */}
          <StudentSidebar />
          {/* Page content fills the rest */}
          <View style={{ flex: 1, overflow: 'hidden' }}>
            {tabs}
          </View>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['student', 'admin']}>
      {tabs}
    </AuthGuard>
  );
}
