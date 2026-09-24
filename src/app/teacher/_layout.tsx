import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { COLORS } from '../../constants/theme';
import { AuthGuard } from '../../components/guards/AuthGuard';
import { TeacherSidebar } from '../../components/teacher/TeacherSidebar';

export default function TeacherLayout() {
  const IS_WEB = Platform.OS === 'web';

  const tabs = (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: COLORS.textSecondary,
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
        name="students"
        options={{
          title: 'Students',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>🎓</Text>
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
        name="marks"
        options={{
          title: 'Marks',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>🏆</Text>
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

      {/* ── Hidden from tab bar — accessible via sidebar ── */}
      <Tabs.Screen name="classes"       options={{ href: null }} />
      <Tabs.Screen name="timetable"     options={{ href: null }} />
      <Tabs.Screen name="assignments"   options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="chat"          options={{ href: null }} />
      <Tabs.Screen name="tasks"         options={{ href: null }} />
      <Tabs.Screen name="settings"      options={{ href: null }} />
      <Tabs.Screen name="help"          options={{ href: null }} />
    </Tabs>
  );

  if (IS_WEB) {
    return (
      <AuthGuard allowedRoles={['teacher', 'staff', 'admin']}>
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#F0F4FF' }}>
          <TeacherSidebar />
          <View style={{ flex: 1, overflow: 'hidden' }}>
            {tabs}
          </View>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['teacher', 'staff', 'admin']}>
      {tabs}
    </AuthGuard>
  );
}
