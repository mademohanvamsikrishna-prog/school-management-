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
      {/* ── Visible tab-bar screens (mobile only) ── */}
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
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>📊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          title: 'Exams',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>✍️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: 'Fees',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>💳</Text>
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

      {/* ── Hidden from tab bar — accessible via sidebar / links ── */}
      <Tabs.Screen name="index"          options={{ href: null }} />
      <Tabs.Screen name="add"            options={{ href: null }} />
      <Tabs.Screen name="academics"      options={{ href: null }} />
      <Tabs.Screen name="events"         options={{ href: null }} />
      <Tabs.Screen name="chat"           options={{ href: null }} />
      <Tabs.Screen name="library"        options={{ href: null }} />
      <Tabs.Screen name="transport"      options={{ href: null }} />
      <Tabs.Screen name="foodcourt"      options={{ href: null }} />
      <Tabs.Screen name="timetable"      options={{ href: null }} />
      <Tabs.Screen name="homework"       options={{ href: null }} />
      <Tabs.Screen name="assignments"    options={{ href: null }} />
      <Tabs.Screen name="study-materials" options={{ href: null }} />
      <Tabs.Screen name="online-classes" options={{ href: null }} />
      <Tabs.Screen name="results"        options={{ href: null }} />
      <Tabs.Screen name="notifications"  options={{ href: null }} />
      <Tabs.Screen name="leave"          options={{ href: null }} />
      <Tabs.Screen name="certificates"   options={{ href: null }} />
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
