import { AttendanceSummary } from '../types/models';

export const mockAttendanceSummary: Record<string, AttendanceSummary> = {
  's1': {
    studentId: 's1',
    totalDays: 50,
    presentDays: 46,
    absentDays: 4,
    percentage: 92,
  },
  's2': {
    studentId: 's2',
    totalDays: 50,
    presentDays: 48,
    absentDays: 2,
    percentage: 96,
  },
};
