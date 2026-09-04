export type UserRole = 'student' | 'teacher' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Student extends User {
  role: 'student';
  classId: string;
  className: string;
  section: string;
  rollNumber: string;
}

export interface Teacher extends User {
  role: 'teacher';
  department: string;
  isClassTeacher: boolean;
  classTeacherOf?: string;
}

export interface Parent extends User {
  role: 'parent';
  childrenIds: string[];
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'half-day';
  remarks?: string;
}

export interface AttendanceSummary {
  studentId: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomNumber: string;
}

export interface Exam {
  id: string;
  name: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'academic' | 'sports' | 'cultural' | 'holiday' | 'other';
  audience: UserRole[] | 'all';
}

export interface Mark {
  id: string;
  studentId: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  title: string;
  description: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
}

export interface Fee {
  id: string;
  studentId: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  authorId: string;
  authorName: string;
  targetAudience: UserRole[] | 'all';
  isImportant: boolean;
}
