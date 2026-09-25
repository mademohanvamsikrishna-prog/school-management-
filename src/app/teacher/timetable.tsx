/**
 * Teacher Timetable Screen
 *
 * Premium Modern School ERP Teacher Timetable Dashboard.
 * Matches reference design with soft glassmorphism, crisp cards,
 * full responsiveness (Desktop 3-column with fixed sidebar from TeacherLayout & right panel),
 * and dynamic calculations from backend APIs.
 *
 * APIs used:
 * - GET /api/v1/teacher/me/timetable
 * - GET /api/v1/teacher/me/classes
 * - GET /api/v1/events
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { api as apiClient } from '../../services/api';
import { LoadingScreen, ErrorScreen } from '../../components/ScreenStates';

// Subcomponents
import { TimetableTopHeader } from '../../components/teacher/timetable/TimetableTopHeader';
import { TimetableBanner } from '../../components/teacher/timetable/TimetableBanner';
import { TimetableSummaryCards } from '../../components/teacher/timetable/TimetableSummaryCards';
import { TimetableControlsBar, ClassOption } from '../../components/teacher/timetable/TimetableControlsBar';
import { TimetableGrid, TimetableEntryItem, PERIOD_SLOTS, DAYS_DEF } from '../../components/teacher/timetable/TimetableGrid';
import { TodaysSchedulePanel } from '../../components/teacher/timetable/TodaysSchedulePanel';
import { UpcomingEventsCard } from '../../components/teacher/timetable/UpcomingEventsCard';
import { QuickNotesCard } from '../../components/teacher/timetable/QuickNotesCard';
import { TimetableDetailModal } from '../../components/teacher/timetable/TimetableDetailModal';
import { EditTimetableModal } from '../../components/teacher/timetable/EditTimetableModal';

const IS_WEB = Platform.OS === 'web';

async function fetchTimetable() {
  return await apiClient.get<any[]>('/teacher/me/timetable');
}

async function fetchClasses() {
  return await apiClient.get<any[]>('/teacher/me/classes');
}

async function fetchEvents() {
  try {
    return await apiClient.get<any[]>('/events?upcoming_only=true');
  } catch (e) {
    return [];
  }
}

// Helper to calculate week date range string (e.g., "Sep 22 – Sep 26, 2026")
function getWeekRangeLabel(weekOffset: number): { label: string; currentDayNum: number } {
  const now = new Date();
  const currentDayNum = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon...7=Sun

  const mon = new Date(now);
  const diffToMon = (now.getDay() === 0 ? -6 : 1 - now.getDay()) + weekOffset * 7;
  mon.setDate(now.getDate() + diffToMon);

  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);

  const monMonth = mon.toLocaleDateString('en-US', { month: 'short' });
  const friMonth = fri.toLocaleDateString('en-US', { month: 'short' });

  const label =
    monMonth === friMonth
      ? `${monMonth} ${mon.getDate()} – ${fri.getDate()}, ${mon.getFullYear()}`
      : `${monMonth} ${mon.getDate()} – ${friMonth} ${fri.getDate()}, ${mon.getFullYear()}`;

  return { label, currentDayNum };
}

export default function TeacherTimetableScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState('2025 - 2026');

  // Modals state
  const [selectedEntryDetail, setSelectedEntryDetail] = useState<TimetableEntryItem | null>(null);
  const [editingEntry, setEditingEntry] = useState<TimetableEntryItem | null>(null);

  // API Data
  const {
    data: rawTimetable,
    loading: timetableLoading,
    error: timetableError,
    refetch: refetchTimetable,
  } = useApi(fetchTimetable);

  const { data: classesData, loading: classesLoading } = useApi(fetchClasses);
  const { data: eventsData } = useApi(fetchEvents);

  const classes: ClassOption[] = useMemo(() => classesData ?? [], [classesData]);

  // Local state for editable timetable entries
  const [customEntries, setCustomEntries] = useState<TimetableEntryItem[] | null>(null);

  const activeEntries: TimetableEntryItem[] = useMemo(() => {
    const list = customEntries ?? rawTimetable ?? [];
    if (!selectedClassId) return list;
    return list.filter((e) => e.class_id === selectedClassId);
  }, [rawTimetable, customEntries, selectedClassId]);

  // Week Date Info
  const { label: weekLabel, currentDayNum } = useMemo(
    () => getWeekRangeLabel(weekOffset),
    [weekOffset]
  );

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Today's Entries (for today's day of week: 1=Mon...6=Sat)
  const todayEntries = useMemo(() => {
    const todayNum = currentDayNum > 6 ? 1 : currentDayNum;
    return activeEntries.filter((e) => e.day_of_week === todayNum);
  }, [activeEntries, currentDayNum]);

  // Compute summary metrics dynamically (Part 6, 19, 20)
  const summaryData = useMemo(() => {
    const todayClassesCount = todayEntries.length;
    const totalPeriodsPerDay = 8;
    const freePeriodsCount = Math.max(0, totalPeriodsPerDay - todayClassesCount);
    const weeklyClassesCount = activeEntries.length;

    // Find next class today based on current time
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let nextSub: string | null = null;
    let nextTime: string | null = null;
    let nextRoom: string | null = null;

    // Sort today's entries by start time
    const sortedToday = [...todayEntries].sort((a, b) => a.start_time.localeCompare(b.start_time));

    for (const e of sortedToday) {
      const [h, m] = e.start_time.slice(0, 5).split(':').map(Number);
      const startMins = h * 60 + m;
      if (startMins > currentMins) {
        nextSub = e.subject_name;
        // Format time 12h
        const hour12 = h % 12 || 12;
        const ampm = h >= 12 ? 'PM' : 'AM';
        nextTime = `${hour12}:${m < 10 ? '0' : ''}${m} ${ampm}`;
        nextRoom = e.room_number ? `Room ${e.room_number}` : 'Room 101';
        break;
      }
    }

    return {
      todayClassesCount,
      totalPeriodsPerDay,
      freePeriodsCount,
      weeklyClassesCount,
      nextClassSubject: nextSub,
      nextClassTime: nextTime,
      nextClassRoom: nextRoom,
    };
  }, [todayEntries, activeEntries]);

  // Edit Timetable Handler
  const handleSaveEntryEdit = (updatedEntry: TimetableEntryItem) => {
    setCustomEntries((prev) => {
      const base = prev ?? rawTimetable ?? [];
      return base.map((e) => (e.id === updatedEntry.id ? updatedEntry : e));
    });
  };

  const handleRefresh = useCallback(() => {
    refetchTimetable();
  }, [refetchTimetable]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bodyWorkspace}>
        {/* Top Header */}
        <TimetableTopHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner Header */}
          <TimetableBanner />

          {/* Part 29: Error State */}
          {timetableError ? (
            <View style={styles.errorCard}>
              <Text style={{ fontSize: 36 }}>⚠️</Text>
              <Text style={styles.errorTitle}>Unable to load timetable</Text>
              <Text style={styles.errorSub}>
                Please check your network connection or server status.
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Controls: Week Nav, Today, Class Filter, Academic Year */}
              <TimetableControlsBar
                weekLabel={weekLabel}
                onPrevWeek={() => setWeekOffset((w) => w - 1)}
                onNextWeek={() => setWeekOffset((w) => w + 1)}
                onToday={() => setWeekOffset(0)}
                classes={classes}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                academicYear={academicYear}
                onSelectAcademicYear={setAcademicYear}
              />

              {/* Summary Cards */}
              <TimetableSummaryCards data={summaryData} />

              {/* Main Content Row: Grid + Right Side Panel */}
              <View style={[styles.layoutRow, !isDesktop && styles.layoutColumn]}>
                {/* Left Column: Weekly Timetable Matrix */}
                <View style={[styles.gridCol, !isDesktop && { width: '100%' }]}>
                  {timetableLoading || classesLoading ? (
                    <LoadingScreen message="Loading weekly timetable..." />
                  ) : activeEntries.length === 0 && (rawTimetable ?? []).length === 0 ? (
                    <View style={styles.emptyCard}>
                      <Text style={{ fontSize: 40 }}>🗓️</Text>
                      <Text style={styles.emptyTitle}>No timetable available</Text>
                      <Text style={styles.emptySub}>
                        No classes are scheduled for this period.
                      </Text>
                      <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
                        <Text style={styles.refreshBtnText}>Refresh Timetable</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TimetableGrid
                      entries={activeEntries}
                      currentDayNum={currentDayNum}
                      highlightToday={weekOffset === 0}
                      onCellClick={(entry) => setSelectedEntryDetail(entry)}
                      searchQuery={searchQuery}
                    />
                  )}
                </View>

                {/* Right Column: Today's Schedule, Events & Quick Notes (~340px) */}
                <View style={[styles.sideCol, !isDesktop && { width: '100%', maxWidth: '100%' }]}>
                  <TodaysSchedulePanel
                    todayEntries={todayEntries}
                    dateString={todayStr}
                  />

                  <UpcomingEventsCard />

                  <QuickNotesCard />
                </View>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Interactive Timetable Cell Detail Modal */}
      <TimetableDetailModal
        visible={selectedEntryDetail !== null}
        onClose={() => setSelectedEntryDetail(null)}
        entry={selectedEntryDetail}
        academicYear={academicYear}
        onOpenEdit={() => setEditingEntry(selectedEntryDetail)}
        canEdit={true}
      />

      {/* Interactive Edit Timetable Entry Modal */}
      <EditTimetableModal
        visible={editingEntry !== null}
        onClose={() => setEditingEntry(null)}
        entry={editingEntry}
        onSave={handleSaveEntryEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  bodyWorkspace: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  layoutRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  layoutColumn: {
    flexDirection: 'column',
  },
  gridCol: {
    flex: 1,
    minWidth: 0,
  },
  sideCol: {
    width: 340,
    maxWidth: 340,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 12,
    marginVertical: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991B1B',
  },
  errorSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  refreshBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
