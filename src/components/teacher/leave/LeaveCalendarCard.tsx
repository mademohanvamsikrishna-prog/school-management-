import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export interface CalendarLeaveEvent {
  id: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  leaveType: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'My Request' | string;
  reason?: string;
}

interface LeaveCalendarCardProps {
  events: CalendarLeaveEvent[];
  onDateClick?: (dateStr: string, eventsOnDate: CalendarLeaveEvent[]) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const LeaveCalendarCard: React.FC<LeaveCalendarCardProps> = ({
  events,
  onDateClick,
}) => {
  // Current view date state (defaults to October 2026)
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date(2026, 9, 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-10');

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  // Build grid of days
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const now = new Date();
    const isThisMonth = now.getFullYear() === year && now.getMonth() === month;

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = isThisMonth && now.getDate() === day;
      cells.push({
        dayNumber: day,
        dateString: dateStr,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Next month padding to fill complete weeks (up to multiple of 7)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return cells;
  }, [year, month]);

  // Helper to get events matching a date
  const getEventsForDate = (dateStr: string) => {
    return events.filter((e) => {
      if (e.date === dateStr) return true;
      if (e.endDate && e.date <= dateStr && e.endDate >= dateStr) return true;
      return false;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '#10B981'; // Green
      case 'pending':
      case 'awaiting review':
        return '#F59E0B'; // Yellow
      case 'rejected':
        return '#EF4444'; // Red
      case 'my request':
      default:
        return '#3B82F6'; // Blue
    }
  };

  const selectedEvents = useMemo(() => {
    return getEventsForDate(selectedDateStr);
  }, [selectedDateStr, events]);

  return (
    <View style={styles.cardContainer}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerIconWrap}>
          <Text style={{ fontSize: 18 }}>📅</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Leave Calendar</Text>
          <Text style={styles.headerSubtitle}>View your leave requests and status</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Month Navigation Toolbar */}
      <View style={styles.monthNavRow}>
        <TouchableOpacity
          style={styles.navArrowBtn}
          onPress={handlePrevMonth}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.monthLabel}>
          {MONTH_NAMES[month]} {year}
        </Text>

        <TouchableOpacity
          style={styles.navArrowBtn}
          onPress={handleNextMonth}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday Names Header */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((w, idx) => (
          <View key={w} style={styles.weekdayCol}>
            <Text
              style={[
                styles.weekdayText,
                (idx === 0 || idx === 6) && styles.weekendText,
              ]}
            >
              {w}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Days Grid */}
      <View style={styles.gridWrapper}>
        {calendarGrid.map((cell, idx) => {
          const isSelected = cell.dateString === selectedDateStr;
          const dayEvents = getEventsForDate(cell.dateString);
          const hasEvents = dayEvents.length > 0;

          return (
            <TouchableOpacity
              key={`${cell.dateString}-${idx}`}
              style={[
                styles.dayCell,
                !cell.isCurrentMonth && styles.dayCellOtherMonth,
                isSelected && styles.dayCellSelected,
              ]}
              onPress={() => {
                setSelectedDateStr(cell.dateString);
                onDateClick?.(cell.dateString, dayEvents);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dayNumber,
                  !cell.isCurrentMonth && styles.dayNumberOtherMonth,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                {cell.dayNumber}
              </Text>

              {/* Status Indicator Dots */}
              <View style={styles.dotsRow}>
                {dayEvents.slice(0, 3).map((e, dotIdx) => (
                  <View
                    key={`${e.id}-${dotIdx}`}
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(e.status) },
                    ]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Date Mini Banner if event exists */}
      {selectedEvents.length > 0 && (
        <View style={styles.selectedEventInfo}>
          <Text style={styles.selectedEventDate}>
            {selectedDateStr}:
          </Text>
          <View style={{ flex: 1, gap: 2 }}>
            {selectedEvents.map((evt) => (
              <View key={evt.id} style={styles.selectedEventItem}>
                <View
                  style={[
                    styles.miniBadge,
                    { backgroundColor: getStatusColor(evt.status) + '22' },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniBadgeText,
                      { color: getStatusColor(evt.status) },
                    ]}
                  >
                    {evt.status}
                  </Text>
                </View>
                <Text style={styles.selectedEventLabel} numberOfLines={1}>
                  {evt.leaveType} {evt.reason ? `• ${evt.reason}` : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Legend Footer */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendLabel}>Approved</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendLabel}>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendLabel}>Rejected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendLabel}>My Request</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navArrowText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  weekendText: {
    color: '#94A3B8',
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1.15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
    padding: 2,
  },
  dayCellOtherMonth: {
    opacity: 0.35,
  },
  dayCellSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  dayNumberOtherMonth: {
    color: '#94A3B8',
  },
  dayNumberSelected: {
    color: '#2563EB',
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
    height: 6,
    alignItems: 'center',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  selectedEventInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedEventDate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  selectedEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  selectedEventLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
});
