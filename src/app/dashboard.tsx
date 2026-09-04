import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

type Role = 'student' | 'parent' | 'staff';

export default function Dashboard() {
  const router = useRouter();

  const params = useLocalSearchParams();

  const role =
    (params.role as Role) || 'student';

  // =====================================================
  // ANIMATIONS
  // =====================================================

  const headerAnim = useRef(
    new Animated.Value(0)
  ).current;

  const cardsAnim = useRef(
    new Animated.Value(0)
  ).current;

  const contentAnim = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(headerAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),

      Animated.spring(cardsAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),

      Animated.spring(contentAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // =====================================================
  // ROLE INFORMATION
  // =====================================================

  const getRoleInfo = () => {
    switch (role) {
      case 'student':
        return {
          icon: '🎓',
          title: 'Student Dashboard',
          subtitle: 'Track your learning and school activities',
          name: 'Student',
        };

      case 'parent':
        return {
          icon: '👨‍👩‍👧',
          title: 'Parent Dashboard',
          subtitle: 'Monitor your child’s academic progress',
          name: 'Parent',
        };

      case 'staff':
        return {
          icon: '👨‍🏫',
          title: 'Teacher Dashboard',
          subtitle: 'Manage students, attendance and marks',
          name: 'Teacher',
        };

      default:
        return {
          icon: '🎓',
          title: 'Student Dashboard',
          subtitle: 'Track your learning and school activities',
          name: 'Student',
        };
    }
  };

  const roleInfo = getRoleInfo();

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    router.replace('/');
  };

  // =====================================================
  // ANIMATION STYLE
  // =====================================================

  const slideUp = (animation: Animated.Value) => ({
    opacity: animation,

    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
    ],
  });

  // =====================================================
  // STUDENT DASHBOARD
  // =====================================================

  const StudentDashboard = () => {
    return (
      <>
        <Animated.View
          style={slideUp(contentAnim)}
        >
          <Text style={styles.sectionTitle}>
            My Overview
          </Text>
        </Animated.View>

        <View style={styles.statsGrid}>

          <DashboardCard
            icon="📚"
            value="6"
            label="Subjects"
            delay={0}
          />

          <DashboardCard
            icon="📊"
            value="82%"
            label="Average Marks"
            delay={100}
          />

          <DashboardCard
            icon="✅"
            value="92%"
            label="Attendance"
            delay={200}
          />

          <DashboardCard
            icon="🏆"
            value="5"
            label="Achievements"
            delay={300}
          />

        </View>

        <Animated.View
          style={slideUp(contentAnim)}
        >
          <Text style={styles.sectionTitle}>
            Quick Access
          </Text>

          <View style={styles.actionGrid}>

            <ActionButton
              icon="📚"
              title="My Subjects"
            />

            <ActionButton
              icon="📅"
              title="My Timetable"
            />

            <ActionButton
              icon="📝"
              title="My Marks"
            />

            <ActionButton
              icon="✅"
              title="Attendance"
            />

            <ActionButton
              icon="📢"
              title="Announcements"
            />

            <ActionButton
              icon="📄"
              title="Assignments"
            />

          </View>
        </Animated.View>

        <Animated.View
          style={slideUp(contentAnim)}
        >
          <View style={styles.noticeCard}>

            <Text style={styles.noticeTitle}>
              📢 Latest Notice
            </Text>

            <Text style={styles.noticeText}>
              Mathematics assignment is due
              this Friday.
            </Text>

          </View>
        </Animated.View>
      </>
    );
  };

  // =====================================================
  // PARENT DASHBOARD
  // =====================================================

  const ParentDashboard = () => {
    return (
      <>
        <Animated.View
          style={slideUp(contentAnim)}
        >
          <Text style={styles.sectionTitle}>
            Child Overview
          </Text>
        </Animated.View>

        <View style={styles.childCard}>

          <View style={styles.childAvatar}>
            <Text style={styles.childAvatarText}>
              🎓
            </Text>
          </View>

          <View style={styles.childInfo}>

            <Text style={styles.childName}>
              Rahul Kumar
            </Text>

            <Text style={styles.childClass}>
              Class 10 • Section A
            </Text>

          </View>

          <Text style={styles.activeText}>
            Active
          </Text>

        </View>

        <View style={styles.statsGrid}>

          <DashboardCard
            icon="📊"
            value="82%"
            label="Average Marks"
            delay={0}
          />

          <DashboardCard
            icon="✅"
            value="94%"
            label="Attendance"
            delay={100}
          />

          <DashboardCard
            icon="📚"
            value="8"
            label="Subjects"
            delay={200}
          />

          <DashboardCard
            icon="🏆"
            value="4"
            label="Achievements"
            delay={300}
          />

        </View>

        <Animated.View
          style={slideUp(contentAnim)}
        >
          <Text style={styles.sectionTitle}>
            Parent Services
          </Text>

          <View style={styles.actionGrid}>

            <ActionButton
              icon="📊"
              title="Academic Progress"
            />

            <ActionButton
              icon="✅"
              title="Attendance"
            />

            <ActionButton
              icon="💰"
              title="Fee Details"
            />

            <ActionButton
              icon="📅"
              title="School Calendar"
            />

            <ActionButton
              icon="📢"
              title="Announcements"
            />

            <ActionButton
              icon="💬"
              title="Teacher Messages"
            />

          </View>
        </Animated.View>

        <Animated.View
          style={slideUp(contentAnim)}
        >
          <View style={styles.noticeCard}>

            <Text style={styles.noticeTitle}>
              🔔 Parent Notification
            </Text>

            <Text style={styles.noticeText}>
              Parent-teacher meeting scheduled
              for Saturday.
            </Text>

          </View>
        </Animated.View>
      </>
    );
  };

  // =====================================================
  // TEACHER DASHBOARD
  // =====================================================

  const TeacherDashboard = () => {
    return (
      <>
        <Animated.View
          style={slideUp(contentAnim)}
        >
          <Text style={styles.sectionTitle}>
            Teaching Overview
          </Text>
        </Animated.View>

        <View style={styles.statsGrid}>

          <DashboardCard
            icon="👨‍🎓"
            value="120"
            label="Students"
            delay={0}
          />

          <DashboardCard
            icon="📚"
            value="5"
            label="Classes"
            delay={100}
          />

          <DashboardCard
            icon="✅"
            value="92%"
            label="Attendance"
            delay={200}
          />

          <DashboardCard
            icon="📝"
            value="18"
            label="Pending Marks"
            delay={300}
          />

        </View>

        <Animated.View
          style={slideUp(contentAnim)}
        >
          <Text style={styles.sectionTitle}>
            Teacher Tools
          </Text>

          <View style={styles.actionGrid}>

            <ActionButton
              icon="👨‍🎓"
              title="Students"
            />

            <ActionButton
              icon="✅"
              title="Attendance"
            />

            <ActionButton
              icon="📝"
              title="Enter Marks"
            />

            <ActionButton
              icon="📚"
              title="Subjects"
            />

            <ActionButton
              icon="📅"
              title="Timetable"
            />

            <ActionButton
              icon="📢"
              title="Announcements"
            />

          </View>
        </Animated.View>

        <Animated.View
          style={slideUp(contentAnim)}
        >
          <View style={styles.noticeCard}>

            <Text style={styles.noticeTitle}>
              📋 Today's Tasks
            </Text>

            <Text style={styles.noticeText}>
              • Mark attendance for Class 10
            </Text>

            <Text style={styles.noticeText}>
              • Update Mathematics marks
            </Text>

            <Text style={styles.noticeText}>
              • Review student assignments
            </Text>

          </View>
        </Animated.View>
      </>
    );
  };

  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <Animated.View
        style={[
          styles.header,
          slideUp(headerAnim),
        ]}
      >

        <View>

          <Text style={styles.smallText}>
            Smart School Management
          </Text>

          <Text style={styles.title}>
            {roleInfo.icon}{' '}
            {roleInfo.title}
          </Text>

          <Text style={styles.subtitle}>
            {roleInfo.subtitle}
          </Text>

        </View>

        <Pressable
          style={styles.profileButton}
        >
          <Text style={styles.profileText}>
            {roleInfo.name}
          </Text>
        </Pressable>

      </Animated.View>

      {/* CONTENT */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        {/* ROLE BASED CONTENT */}

        {role === 'student' && (
          <StudentDashboard />
        )}

        {role === 'parent' && (
          <ParentDashboard />
        )}

        {role === 'staff' && (
          <TeacherDashboard />
        )}

        {/* LOGOUT */}

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >

          <Text style={styles.logoutText}>
            🚪 Logout
          </Text>

        </Pressable>

      </ScrollView>

    </View>
  );
}

// =====================================================
// DASHBOARD CARD
// =====================================================

function DashboardCard({
  icon,
  value,
  label,
  delay,
}: {
  icon: string;
  value: string;
  label: string;
  delay: number;
}) {
  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const scale = useRef(
    new Animated.Value(0.8)
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),

        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity,

          transform: [
            {
              scale,
            },
          ],
        },
      ]}
    >

      <Text style={styles.statIcon}>
        {icon}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>

    </Animated.View>
  );
}

// =====================================================
// ACTION BUTTON
// =====================================================

function ActionButton({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  const scale = useRef(
    new Animated.Value(1)
  ).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.actionWrapper,
        {
          transform: [
            {
              scale,
            },
          ],
        },
      ]}
    >

      <Pressable
        style={styles.actionButton}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >

        <Text style={styles.actionIcon}>
          {icon}
        </Text>

        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text style={styles.arrow}>
          →
        </Text>

      </Pressable>

    </Animated.View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    backgroundColor: '#0f4c81',

    paddingHorizontal: 35,
    paddingTop: 45,
    paddingBottom: 30,

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',
  },

  smallText: {
    color: '#bfdbfe',

    fontSize: 12,

    fontWeight: '600',

    marginBottom: 5,
  },

  title: {
    color: '#ffffff',

    fontSize: 28,

    fontWeight: '900',
  },

  subtitle: {
    color: '#dbeafe',

    fontSize: 14,

    marginTop: 7,
  },

  profileButton: {
    backgroundColor: '#ffffff',

    paddingHorizontal: 18,

    paddingVertical: 10,

    borderRadius: 22,
  },

  profileText: {
    color: '#0f4c81',

    fontSize: 13,

    fontWeight: '800',
  },

  // ===================================================
  // CONTENT
  // ===================================================

  content: {
    padding: 25,

    paddingBottom: 50,
  },

  sectionTitle: {
    color: '#111827',

    fontSize: 20,

    fontWeight: '900',

    marginBottom: 15,

    marginTop: 10,
  },

  // ===================================================
  // STATS
  // ===================================================

  statsGrid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 14,

    marginBottom: 25,
  },

  statCard: {
    backgroundColor: '#ffffff',

    borderRadius: 18,

    padding: 20,

    width: '23%',

    minWidth: 150,

    minHeight: 145,

    justifyContent: 'center',

    shadowColor: '#000000',

    shadowOpacity: 0.07,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  statIcon: {
    fontSize: 27,

    marginBottom: 10,
  },

  statValue: {
    color: '#2563eb',

    fontSize: 26,

    fontWeight: '900',
  },

  statLabel: {
    color: '#6b7280',

    fontSize: 12,

    fontWeight: '600',

    marginTop: 3,
  },

  // ===================================================
  // ACTIONS
  // ===================================================

  actionGrid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 13,

    marginBottom: 25,
  },

  actionWrapper: {
    width: '31%',

    minWidth: 180,
  },

  actionButton: {
    backgroundColor: '#ffffff',

    borderRadius: 16,

    padding: 18,

    minHeight: 90,

    justifyContent: 'center',

    position: 'relative',

    shadowColor: '#000000',

    shadowOpacity: 0.06,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  actionIcon: {
    fontSize: 25,

    marginBottom: 7,
  },

  actionTitle: {
    color: '#1f2937',

    fontSize: 13,

    fontWeight: '800',
  },

  arrow: {
    position: 'absolute',

    right: 15,

    bottom: 15,

    color: '#2563eb',

    fontSize: 18,

    fontWeight: '900',
  },

  // ===================================================
  // NOTICE
  // ===================================================

  noticeCard: {
    backgroundColor: '#eff6ff',

    borderRadius: 18,

    padding: 20,

    marginBottom: 25,

    borderWidth: 1,

    borderColor: '#dbeafe',
  },

  noticeTitle: {
    color: '#1e40af',

    fontSize: 15,

    fontWeight: '900',

    marginBottom: 8,
  },

  noticeText: {
    color: '#475569',

    fontSize: 13,

    lineHeight: 21,

    marginBottom: 3,
  },

  // ===================================================
  // PARENT CHILD CARD
  // ===================================================

  childCard: {
    backgroundColor: '#ffffff',

    borderRadius: 18,

    padding: 18,

    marginBottom: 20,

    flexDirection: 'row',

    alignItems: 'center',

    shadowColor: '#000000',

    shadowOpacity: 0.07,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  childAvatar: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: '#eff6ff',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 14,
  },

  childAvatarText: {
    fontSize: 27,
  },

  childInfo: {
    flex: 1,
  },

  childName: {
    color: '#111827',

    fontSize: 16,

    fontWeight: '900',
  },

  childClass: {
    color: '#6b7280',

    fontSize: 12,

    marginTop: 4,
  },

  activeText: {
    color: '#16a34a',

    fontSize: 12,

    fontWeight: '900',

    backgroundColor: '#dcfce7',

    paddingHorizontal: 10,

    paddingVertical: 5,

    borderRadius: 12,
  },

  // ===================================================
  // LOGOUT
  // ===================================================

  logoutButton: {
    backgroundColor: '#dc2626',

    height: 52,

    borderRadius: 13,

    justifyContent: 'center',

    alignItems: 'center',

    marginTop: 15,
  },

  logoutText: {
    color: '#ffffff',

    fontSize: 14,

    fontWeight: '900',
  },
});