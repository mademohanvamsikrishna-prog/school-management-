import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ClassDistributionItem {
  className: string;
  count: number;
  percentage: number;
}

interface GenderDistributionItem {
  gender: string;
  count: number;
  percentage: number;
}

interface RecentAdmissionItem {
  id: string;
  name: string;
  className: string;
  date: string;
  avatarUrl?: string;
}

interface StudentsRightAnalyticsProps {
  totalStudents: number;
  classDistributions: ClassDistributionItem[];
  genderDistributions: GenderDistributionItem[];
  recentAdmissions: RecentAdmissionItem[];
  onViewAllAdmissions: () => void;
}

export const StudentsRightAnalytics: React.FC<StudentsRightAnalyticsProps> = ({
  totalStudents,
  classDistributions,
  genderDistributions,
  recentAdmissions,
  onViewAllAdmissions,
}) => {
  const CLASS_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];
  const maxClassCount = Math.max(...classDistributions.map((c) => c.count), 1);

  return (
    <View style={styles.container}>
      {/* 1. STUDENTS BY CLASS */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeaderTitle}>STUDENTS BY CLASS</Text>
        </View>

        <View style={styles.donutCenter}>
          <View style={styles.donutCircleOuter}>
            <View style={styles.donutCircleInner}>
              <Text style={styles.donutValueText}>{totalStudents}</Text>
              <Text style={styles.donutLabelText}>Students</Text>
            </View>
          </View>
        </View>

        <View style={styles.legendList}>
          {classDistributions.map((item, idx) => {
            const color = CLASS_COLORS[idx % CLASS_COLORS.length];
            return (
              <View key={item.className} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendLabel}>{item.className}</Text>
                <Text style={styles.legendVal}>
                  {item.count} ({item.percentage.toFixed(0)}%)
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 2. GENDER DISTRIBUTION */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>GENDER DISTRIBUTION</Text>
        <View style={styles.distList}>
          {genderDistributions.map((g) => {
            const barWidth = `${Math.min(100, Math.max(0, g.percentage))}%` as `${number}%`;
            return (
              <View key={g.gender} style={styles.distItem}>
                <View style={styles.genderBox}>
                  <Text style={styles.genderBoxText}>{g.gender.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.genderMetaRow}>
                    <Text style={styles.genderName}>{g.gender}</Text>
                    <Text style={styles.genderAvg}>{g.count} ({g.percentage.toFixed(0)}%)</Text>
                  </View>
                  <View style={styles.distTrack}>
                    <View style={[styles.distBar, { width: barWidth }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* 3. RECENT ADMISSIONS */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeaderTitle}>RECENT ADMISSIONS</Text>
          <TouchableOpacity onPress={onViewAllAdmissions}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentList}>
          {recentAdmissions.slice(0, 4).map((item) => (
            <View key={item.id} style={styles.recentItem}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {item.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.recentName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.recentSub}>
                  {item.className} • {item.date}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 4. CLASS-WISE STRENGTH */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>CLASS-WISE STRENGTH</Text>
        <View style={styles.strengthList}>
          {classDistributions.map((c, idx) => {
            const pct = (c.count / maxClassCount) * 100;
            const barWidth = `${Math.min(100, Math.max(0, pct))}%` as `${number}%`;
            const color = CLASS_COLORS[idx % CLASS_COLORS.length];

            return (
              <View key={c.className} style={styles.strengthItem}>
                <View style={styles.strengthMetaRow}>
                  <Text style={styles.strengthName}>{c.className}</Text>
                  <Text style={styles.strengthCount}>{c.count} Students</Text>
                </View>
                <View style={styles.strengthTrack}>
                  <View style={[styles.strengthBar, { width: barWidth, backgroundColor: color }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
    marginBottom: 16,
  },
  donutCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  donutCircleOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCircleInner: {
    alignItems: 'center',
  },
  donutValueText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  donutLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  legendList: {
    gap: 8,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  legendVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  distList: {
    gap: 12,
  },
  distItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  genderBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBoxText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  genderMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  genderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  genderAvg: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  distTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distBar: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  recentList: {
    gap: 10,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  recentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  recentSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  strengthList: {
    gap: 12,
  },
  strengthItem: {
    gap: 4,
  },
  strengthMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  strengthName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  strengthCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  strengthTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 4,
  },
});
