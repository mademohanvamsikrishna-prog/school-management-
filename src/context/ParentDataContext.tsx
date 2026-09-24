import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export type ChildKey = 'ananya' | 'rahul';

export interface ChildProfile {
  key: ChildKey;
  id: string;
  name: string;
  className: string;
  gradeLevel: number;
  rollNumber: string;
  avatarInit: string;
  avatarBg: string;
  attendanceRate: number;
  attendanceTrend: string;
  overallGrade: string;
  gradeTrend: string;
  pendingFees: string;
  feeDueDate: string;
}

export interface TimetableSlot {
  id: string;
  time: string;
  period: number;
  subject: string;
  teacher: string;
  room: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  isBreak?: boolean;
  color?: string;
  badgeBg?: string;
  topics?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  date: string;
  category: 'Academic' | 'Event' | 'Holiday' | 'Fees';
  summary: string;
  fullMessage: string;
  read: boolean;
  attachmentName?: string;
}

export interface HomeworkItem {
  id: string;
  childKey: ChildKey;
  subject: string;
  title: string;
  dueDate: string;
  assignedDate: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  description: string;
  teacher: string;
  submissionInfo?: string;
  attachment?: string;
  color: string;
}

export interface ChatMessageBubble {
  id: string;
  sender: 'teacher' | 'parent';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface TeacherConversation {
  id: string;
  childKey: ChildKey;
  teacherName: string;
  teacherRole: string;
  teacherAvatar: string;
  avatarColor: string;
  timeAgo: string;
  unread: boolean;
  messages: ChatMessageBubble[];
}

interface ParentDataContextValue {
  selectedChildKey: ChildKey;
  setSelectedChildKey: (key: ChildKey) => void;
  selectedChild: ChildProfile;
  childrenProfiles: ChildProfile[];
  timetable: TimetableSlot[];
  announcements: AnnouncementItem[];
  homework: HomeworkItem[];
  conversations: TeacherConversation[];
  activeWeekOffset: number;
  setActiveWeekOffset: (offset: number) => void;
  markAnnouncementRead: (id: string) => void;
  markAllAnnouncementsRead: () => void;
  submitHomeworkItem: (id: string, notes?: string) => void;
  sendTeacherMessage: (convId: string, text: string) => void;
  markConversationRead: (convId: string) => void;
  unreadMessagesCount: number;
  unreadAnnouncementsCount: number;
  pendingHomeworkCount: number;
  upcomingEventsCount: number;
}

const CHILDREN_PROFILES: ChildProfile[] = [
  {
    key: 'ananya',
    id: 'child-ananya-7b',
    name: 'Ananya Gupta',
    className: 'Class 7 - B',
    gradeLevel: 7,
    rollNumber: '14',
    avatarInit: 'A',
    avatarBg: '#F97316',
    attendanceRate: 94,
    attendanceTrend: '+5%',
    overallGrade: 'A+',
    gradeTrend: '+2.4%',
    pendingFees: '₹5,000',
    feeDueDate: '15 Oct 2026',
  },
  {
    key: 'rahul',
    id: 'child-rahul-10a',
    name: 'Rahul Sharma',
    className: 'Class 10 - A',
    gradeLevel: 10,
    rollNumber: '28',
    avatarInit: 'R',
    avatarBg: '#EC4899',
    attendanceRate: 98,
    attendanceTrend: '+2%',
    overallGrade: 'A',
    gradeTrend: '+1.8%',
    pendingFees: '₹0',
    feeDueDate: 'Paid',
  },
];

// ─── Realistic Timetable Grid Data for Class 7-B (Ananya) ───────────────────
const ANANYA_TIMETABLE: TimetableSlot[] = [
  // 8:30–9:20
  { id: 'a-m1', day: 'Monday', time: '8:30–9:20', period: 1, subject: 'Mathematics', teacher: 'Ms. Priya Desai', room: 'Room 204', color: '#2563EB', badgeBg: '#EFF6FF', topics: 'Algebraic Expressions - Exercise 5.2' },
  { id: 'a-t1', day: 'Tuesday', time: '8:30–9:20', period: 1, subject: 'Science', teacher: 'Dr. Ramesh Rao', room: 'Lab 2', color: '#10B981', badgeBg: '#DCFCE7', topics: 'Nutrition in Animals & Digestion' },
  { id: 'a-w1', day: 'Wednesday', time: '8:30–9:20', period: 1, subject: 'English', teacher: 'Mrs. S. Kapoor', room: 'Room 204', color: '#8B5CF6', badgeBg: '#F5F3FF', topics: 'Grammar - Direct & Indirect Speech' },
  { id: 'a-th1', day: 'Thursday', time: '8:30–9:20', period: 1, subject: 'Mathematics', teacher: 'Ms. Priya Desai', room: 'Room 204', color: '#2563EB', badgeBg: '#EFF6FF', topics: 'Linear Equations in One Variable' },
  { id: 'a-f1', day: 'Friday', time: '8:30–9:20', period: 1, subject: 'Science', teacher: 'Dr. Ramesh Rao', room: 'Lab 2', color: '#10B981', badgeBg: '#DCFCE7', topics: 'Acids, Bases and Salts Experiment' },

  // 9:20–10:10
  { id: 'a-m2', day: 'Monday', time: '9:20–10:10', period: 2, subject: 'English', teacher: 'Mrs. S. Kapoor', room: 'Room 204', color: '#8B5CF6', badgeBg: '#F5F3FF', topics: 'Literature: The Daffodils Poem' },
  { id: 'a-t2', day: 'Tuesday', time: '9:20–10:10', period: 2, subject: 'Mathematics', teacher: 'Ms. Priya Desai', room: 'Room 204', color: '#2563EB', badgeBg: '#EFF6FF', topics: 'Fractions and Decimals problem sets' },
  { id: 'a-w2', day: 'Wednesday', time: '9:20–10:10', period: 2, subject: 'Social Studies', teacher: 'Mr. Arvind Joshi', room: 'Room 204', color: '#F59E0B', badgeBg: '#FEF3C7', topics: 'Medieval Indian History - Cholas' },
  { id: 'a-th2', day: 'Thursday', time: '9:20–10:10', period: 2, subject: 'Science', teacher: 'Dr. Ramesh Rao', room: 'Room 204', color: '#10B981', badgeBg: '#DCFCE7', topics: 'Respiration in Organisms' },
  { id: 'a-f2', day: 'Friday', time: '9:20–10:10', period: 2, subject: 'English', teacher: 'Mrs. S. Kapoor', room: 'Room 204', color: '#8B5CF6', badgeBg: '#F5F3FF', topics: 'Creative Writing & Reading' },

  // 10:10–10:30 Break
  { id: 'a-m-brk', day: 'Monday', time: '10:10–10:30', period: 0, subject: 'Break', teacher: 'Supervised', room: 'Courtyard', isBreak: true },
  { id: 'a-t-brk', day: 'Tuesday', time: '10:10–10:30', period: 0, subject: 'Break', teacher: 'Supervised', room: 'Courtyard', isBreak: true },
  { id: 'a-w-brk', day: 'Wednesday', time: '10:10–10:30', period: 0, subject: 'Break', teacher: 'Supervised', room: 'Courtyard', isBreak: true },
  { id: 'a-th-brk', day: 'Thursday', time: '10:10–10:30', period: 0, subject: 'Break', teacher: 'Supervised', room: 'Courtyard', isBreak: true },
  { id: 'a-f-brk', day: 'Friday', time: '10:10–10:30', period: 0, subject: 'Break', teacher: 'Supervised', room: 'Courtyard', isBreak: true },

  // 10:30–11:20
  { id: 'a-m3', day: 'Monday', time: '10:30–11:20', period: 3, subject: 'Science', teacher: 'Dr. Ramesh Rao', room: 'Room 204', color: '#10B981', badgeBg: '#DCFCE7', topics: 'Heat and Temperature' },
  { id: 'a-t3', day: 'Tuesday', time: '10:30–11:20', period: 3, subject: 'Telugu', teacher: 'Mrs. Lalitha Devi', room: 'Room 204', color: '#EC4899', badgeBg: '#FDF2F8', topics: 'Telugu Literature & Prose' },
  { id: 'a-w3', day: 'Wednesday', time: '10:30–11:20', period: 3, subject: 'Mathematics', teacher: 'Ms. Priya Desai', room: 'Room 204', color: '#2563EB', badgeBg: '#EFF6FF', topics: 'Data Handling - Bar graphs' },
  { id: 'a-th3', day: 'Thursday', time: '10:30–11:20', period: 3, subject: 'English', teacher: 'Mrs. S. Kapoor', room: 'Room 204', color: '#8B5CF6', badgeBg: '#F5F3FF', topics: 'Reading Comprehension Practice' },
  { id: 'a-f3', day: 'Friday', time: '10:30–11:20', period: 3, subject: 'Social Studies', teacher: 'Mr. Arvind Joshi', room: 'Room 204', color: '#F59E0B', badgeBg: '#FEF3C7', topics: 'Civics - State Government Structure' },

  // 11:20–12:10
  { id: 'a-m4', day: 'Monday', time: '11:20–12:10', period: 4, subject: 'Social Studies', teacher: 'Mr. Arvind Joshi', room: 'Room 204', color: '#F59E0B', badgeBg: '#FEF3C7', topics: 'Our Environment - Geography' },
  { id: 'a-t4', day: 'Tuesday', time: '11:20–12:10', period: 4, subject: 'Computer', teacher: 'Mr. Rajesh Kumar', room: 'Computer Lab 1', color: '#0D9488', badgeBg: '#CCFBF1', topics: 'Python Basics & Flowcharts' },
  { id: 'a-w4', day: 'Wednesday', time: '11:20–12:10', period: 4, subject: 'Hindi', teacher: 'Mrs. Sunita Verma', room: 'Room 204', color: '#EA580C', badgeBg: '#FFEDD5', topics: 'Vasant Chapter 6 Vyakaran' },
  { id: 'a-th4', day: 'Thursday', time: '11:20–12:10', period: 4, subject: 'Telugu', teacher: 'Mrs. Lalitha Devi', room: 'Room 204', color: '#EC4899', badgeBg: '#FDF2F8', topics: 'Telugu Grammar & Sandhi' },
  { id: 'a-f4', day: 'Friday', time: '11:20–12:10', period: 4, subject: 'Mathematics', teacher: 'Ms. Priya Desai', room: 'Room 204', color: '#2563EB', badgeBg: '#EFF6FF', topics: 'Simple Equations Review' },

  // 12:10–1:00 Lunch
  { id: 'a-m-lnch', day: 'Monday', time: '12:10–1:00', period: 0, subject: 'Lunch', teacher: 'Supervised', room: 'Dining Hall', isBreak: true },
  { id: 'a-t-lnch', day: 'Tuesday', time: '12:10–1:00', period: 0, subject: 'Lunch', teacher: 'Supervised', room: 'Dining Hall', isBreak: true },
  { id: 'a-w-lnch', day: 'Wednesday', time: '12:10–1:00', period: 0, subject: 'Lunch', teacher: 'Supervised', room: 'Dining Hall', isBreak: true },
  { id: 'a-th-lnch', day: 'Thursday', time: '12:10–1:00', period: 0, subject: 'Lunch', teacher: 'Supervised', room: 'Dining Hall', isBreak: true },
  { id: 'a-f-lnch', day: 'Friday', time: '12:10–1:00', period: 0, subject: 'Lunch', teacher: 'Supervised', room: 'Dining Hall', isBreak: true },

  // 1:00–1:50
  { id: 'a-m5', day: 'Monday', time: '1:00–1:50', period: 5, subject: 'Computer', teacher: 'Mr. Rajesh Kumar', room: 'Computer Lab 1', color: '#0D9488', badgeBg: '#CCFBF1', topics: 'HTML & Web Page Structure' },
  { id: 'a-t5', day: 'Tuesday', time: '1:00–1:50', period: 5, subject: 'English', teacher: 'Mrs. S. Kapoor', room: 'Room 204', color: '#8B5CF6', badgeBg: '#F5F3FF', topics: 'Essay & Letter Writing Format' },
  { id: 'a-w5', day: 'Wednesday', time: '1:00–1:50', period: 5, subject: 'Science', teacher: 'Dr. Ramesh Rao', room: 'Room 204', color: '#10B981', badgeBg: '#DCFCE7', topics: 'Physical and Chemical Changes' },
  { id: 'a-th5', day: 'Thursday', time: '1:00–1:50', period: 5, subject: 'Computer', teacher: 'Mr. Rajesh Kumar', room: 'Computer Lab 1', color: '#0D9488', badgeBg: '#CCFBF1', topics: 'Scratch Animation Projects' },
  { id: 'a-f5', day: 'Friday', time: '1:00–1:50', period: 5, subject: 'Telugu', teacher: 'Mrs. Lalitha Devi', room: 'Room 204', color: '#EC4899', badgeBg: '#FDF2F8', topics: 'Telugu Poetry Recitation' },

  // 1:50–2:40
  { id: 'a-m6', day: 'Monday', time: '1:50–2:40', period: 6, subject: 'Telugu', teacher: 'Mrs. Lalitha Devi', room: 'Room 204', color: '#EC4899', badgeBg: '#FDF2F8', topics: 'Telugu Composition' },
  { id: 'a-t6', day: 'Tuesday', time: '1:50–2:40', period: 6, subject: 'Social Studies', teacher: 'Mr. Arvind Joshi', room: 'Room 204', color: '#F59E0B', badgeBg: '#FEF3C7', topics: 'Maps & Spatial Orientation' },
  { id: 'a-w6', day: 'Wednesday', time: '1:50–2:40', period: 6, subject: 'Computer', teacher: 'Mr. Rajesh Kumar', room: 'Computer Lab 1', color: '#0D9488', badgeBg: '#CCFBF1', topics: 'Internet Safety & Cyber Ethics' },
  { id: 'a-th6', day: 'Thursday', time: '1:50–2:40', period: 6, subject: 'Hindi', teacher: 'Mrs. Sunita Verma', room: 'Room 204', color: '#EA580C', badgeBg: '#FFEDD5', topics: 'Hindi Nibandh & Patra Lekhan' },
  { id: 'a-f6', day: 'Friday', time: '1:50–2:40', period: 6, subject: 'Physical Education', teacher: 'Coach Manoj', room: 'Sports Ground', color: '#3B82F6', badgeBg: '#EFF6FF', topics: 'Athletics & Badminton Drills' },
];

// ─── Realistic Timetable Grid Data for Class 10-A (Rahul) ───────────────────
const RAHUL_TIMETABLE: TimetableSlot[] = [
  // 8:30–9:20
  { id: 'r-m1', day: 'Monday', time: '8:30–9:20', period: 1, subject: 'Physics', teacher: 'Mr. S. Verma', room: 'Physics Lab', color: '#2563EB', badgeBg: '#EFF6FF', topics: 'Light: Reflection & Refraction' },
  { id: 'r-t1', day: 'Tuesday', time: '8:30–9:20', period: 1, subject: 'Chemistry', teacher: 'Dr. Arisudan', room: 'Chemistry Lab', color: '#10B981', badgeBg: '#DCFCE7', topics: 'Carbon & its Compounds' },
  { id: 'r-w1', day: 'Wednesday', time: '8:30–9:20', period: 1, subject: 'Mathematics', teacher: 'Mr. K. Narayanan', room: 'Room 302', color: '#8B5CF6', badgeBg: '#F5F3FF', topics: 'Quadratic Equations & AP' },
  { id: 'r-th1', day: 'Thursday', time: '8:30–9:20', period: 1, subject: 'Physics', teacher: 'Mr. S. Verma', room: 'Physics Lab', color: '#2563EB', badgeBg: '#EFF6FF', topics: 'Human Eye and Colourful World' },
  { id: 'r-f1', day: 'Friday', time: '8:30–9:20', period: 1, subject: 'Mathematics', teacher: 'Mr. K. Narayanan', room: 'Room 302', color: '#8B5CF6', badgeBg: '#F5F3FF', topics: 'Trigonometry Applications' },

  // 9:20–10:10
  { id: 'r-m2', day: 'Monday', time: '9:20–10:10', period: 2, subject: 'Chemistry', teacher: 'Dr. Arisudan', room: 'Chemistry Lab', color: '#10B981', badgeBg: '#DCFCE7', topics: 'Chemical Reactions & Equations' },
  { id: 'r-t2', day: 'Tuesday', time: '9:20–10:10', period: 2, subject: 'Mathematics', teacher: 'Mr. K. Narayanan', room: 'Room 302', color: '#8B5CF6', badgeBg: '#F5F3FF', topics: 'Coordinate Geometry Practicals' },
  { id: 'r-w2', day: 'Wednesday', time: '9:20–10:10', period: 2, subject: 'English Language', teacher: 'Mrs. Neha Sharma', room: 'Room 302', color: '#F59E0B', badgeBg: '#FEF3C7', topics: 'Literature - First Flight' },
  { id: 'r-th2', day: 'Thursday', time: '9:20–10:10', period: 2, subject: 'Biology', teacher: 'Dr. Meena Iyer', room: 'Bio Lab', color: '#10B981', badgeBg: '#DCFCE7', topics: 'Life Processes & Respiration' },
  { id: 'r-f2', day: 'Friday', time: '9:20–10:10', period: 2, subject: 'Computer Science', teacher: 'Mr. R. Singhania', room: 'Computer Lab 2', color: '#0D9488', badgeBg: '#CCFBF1', topics: 'Python OOP & SQL Queries' },

  // 10:10–10:30 Break
  { id: 'r-m-brk', day: 'Monday', time: '10:10–10:30', period: 0, subject: 'Break', teacher: 'Supervised', room: 'Courtyard', isBreak: true },
  { id: 'r-t-brk', day: 'Tuesday', time: '10:10–10:30', period: 0, subject: 'Break', teacher: 'Supervised', room: 'Courtyard', isBreak: true },
  { id: 'r-w-brk', day: 'Wednesday', time: '10:10–10:30', period: 0, subject: 'Break', teacher: 'Supervised', room: 'Courtyard', isBreak: true },
  { id: 'r-th-brk', day: 'Thursday', time: '10:10–10:30', period: 0, subject: 'Break', teacher: 'Supervised', room: 'Courtyard', isBreak: true },
  { id: 'r-f-brk', day: 'Friday', time: '10:10–10:30', period: 0, subject: 'Break', teacher: 'Supervised', room: 'Courtyard', isBreak: true },

  // 10:30–11:20
  { id: 'r-m3', day: 'Monday', time: '10:30–11:20', period: 3, subject: 'Mathematics', teacher: 'Mr. K. Narayanan', room: 'Room 302', color: '#8B5CF6', badgeBg: '#F5F3FF', topics: 'Triangles Theorems Proof' },
  { id: 'r-t3', day: 'Tuesday', time: '10:30–11:20', period: 3, subject: 'Social Science', teacher: 'Mrs. Kavita Reddy', room: 'Room 302', color: '#EA580C', badgeBg: '#FFEDD5', topics: 'Nationalism in India - History' },
  { id: 'r-w3', day: 'Wednesday', time: '10:30–11:20', period: 3, subject: 'Physics', teacher: 'Mr. S. Verma', room: 'Physics Lab', color: '#2563EB', badgeBg: '#EFF6FF', topics: 'Electricity & Ohm Law Numerical' },
  { id: 'r-th3', day: 'Thursday', time: '10:30–11:20', period: 3, subject: 'Chemistry', teacher: 'Dr. Arisudan', room: 'Chemistry Lab', color: '#10B981', badgeBg: '#DCFCE7', topics: 'Periodic Classification of Elements' },
  { id: 'r-f3', day: 'Friday', time: '10:30–11:20', period: 3, subject: 'Biology', teacher: 'Dr. Meena Iyer', room: 'Bio Lab', color: '#10B981', badgeBg: '#DCFCE7', topics: 'Control and Coordination in Humans' },

  // 11:20–12:10
  { id: 'r-m4', day: 'Monday', time: '11:20–12:10', period: 4, subject: 'Social Science', teacher: 'Mrs. Kavita Reddy', room: 'Room 302', color: '#EA580C', badgeBg: '#FFEDD5', topics: 'Federalism & Political Parties' },
  { id: 'r-t4', day: 'Tuesday', time: '11:20–12:10', period: 4, subject: 'English Literature', teacher: 'Mrs. Neha Sharma', room: 'Room 302', color: '#F59E0B', badgeBg: '#FEF3C7', topics: 'Footprints without Feet Analysis' },
  { id: 'r-w4', day: 'Wednesday', time: '11:20–12:10', period: 4, subject: 'Biology', teacher: 'Dr. Meena Iyer', room: 'Bio Lab', color: '#10B981', badgeBg: '#DCFCE7', topics: 'Heredity and Evolution Concepts' },
  { id: 'r-th4', day: 'Thursday', time: '11:20–12:10', period: 4, subject: 'Computer Science', teacher: 'Mr. R. Singhania', room: 'Computer Lab 2', color: '#0D9488', badgeBg: '#CCFBF1', topics: 'Database Management Systems' },
  { id: 'r-f4', day: 'Friday', time: '11:20–12:10', period: 4, subject: 'Social Science', teacher: 'Mrs. Kavita Reddy', room: 'Room 302', color: '#EA580C', badgeBg: '#FFEDD5', topics: 'Sectors of Indian Economy' },

  // 12:10–1:00 Lunch
  { id: 'r-m-lnch', day: 'Monday', time: '12:10–1:00', period: 0, subject: 'Lunch', teacher: 'Supervised', room: 'Dining Hall', isBreak: true },
  { id: 'r-t-lnch', day: 'Tuesday', time: '12:10–1:00', period: 0, subject: 'Lunch', teacher: 'Supervised', room: 'Dining Hall', isBreak: true },
  { id: 'r-w-lnch', day: 'Wednesday', time: '12:10–1:00', period: 0, subject: 'Lunch', teacher: 'Supervised', room: 'Dining Hall', isBreak: true },
  { id: 'r-th-lnch', day: 'Thursday', time: '12:10–1:00', period: 0, subject: 'Lunch', teacher: 'Supervised', room: 'Dining Hall', isBreak: true },
  { id: 'r-f-lnch', day: 'Friday', time: '12:10–1:00', period: 0, subject: 'Lunch', teacher: 'Supervised', room: 'Dining Hall', isBreak: true },

  // 1:00–1:50
  { id: 'r-m5', day: 'Monday', time: '1:00–1:50', period: 5, subject: 'Computer Science', teacher: 'Mr. R. Singhania', room: 'Computer Lab 2', color: '#0D9488', badgeBg: '#CCFBF1', topics: 'Networking Fundamentals & Protocols' },
  { id: 'r-t5', day: 'Tuesday', time: '1:00–1:50', period: 5, subject: 'Physics Lab', teacher: 'Mr. S. Verma', room: 'Physics Lab', color: '#2563EB', badgeBg: '#EFF6FF', topics: 'Focal Length Measurement Experiment' },
  { id: 'r-w5', day: 'Wednesday', time: '1:00–1:50', period: 5, subject: 'Chemistry Lab', teacher: 'Dr. Arisudan', room: 'Chemistry Lab', color: '#10B981', badgeBg: '#DCFCE7', topics: 'pH Testing and Acid-Base Titration' },
  { id: 'r-th5', day: 'Thursday', time: '1:00–1:50', period: 5, subject: 'Mathematics', teacher: 'Mr. K. Narayanan', room: 'Room 302', color: '#8B5CF6', badgeBg: '#F5F3FF', topics: 'Surface Areas & Volumes Formulas' },
  { id: 'r-f5', day: 'Friday', time: '1:00–1:50', period: 5, subject: 'English', teacher: 'Mrs. Neha Sharma', room: 'Room 302', color: '#F59E0B', badgeBg: '#FEF3C7', topics: 'Formal Letter Writing & Speech' },

  // 1:50–2:40
  { id: 'r-m6', day: 'Monday', time: '1:50–2:40', period: 6, subject: 'Hindi / Sanskrit', teacher: 'Mr. Anand Shastri', room: 'Room 302', color: '#EA580C', badgeBg: '#FFEDD5', topics: 'Kshitij Chapter 8 Kavyakhand' },
  { id: 'r-t6', day: 'Tuesday', time: '1:50–2:40', period: 6, subject: 'Social Science', teacher: 'Mrs. Kavita Reddy', room: 'Room 302', color: '#EA580C', badgeBg: '#FFEDD5', topics: 'Money and Credit - Economics' },
  { id: 'r-w6', day: 'Wednesday', time: '1:50–2:40', period: 6, subject: 'Hindi / Sanskrit', teacher: 'Mr. Anand Shastri', room: 'Room 302', color: '#EA580C', badgeBg: '#FFEDD5', topics: 'Vyakaran - Sandhi & Samas' },
  { id: 'r-th6', day: 'Thursday', time: '1:50–2:40', period: 6, subject: 'Physical Education', teacher: 'Coach Manoj', room: 'Sports Complex', color: '#3B82F6', badgeBg: '#EFF6FF', topics: 'Football Drills & Fitness Test' },
  { id: 'r-f6', day: 'Friday', time: '1:50–2:40', period: 6, subject: 'Library & Self Study', teacher: 'Mr. P. Sharma', room: 'Main Library', color: '#64748B', badgeBg: '#F1F5F9', topics: 'Board Exam Preparation Reading' },
];

// ─── Realistic Announcements Feed ───────────────────────────────────────────
const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Half Yearly Examination Timetable Released',
    date: '20 Sep 2026',
    category: 'Academic',
    summary: 'The half yearly examination timetable has been released. Parents are requested to review the schedule.',
    fullMessage: 'Dear Parents,\nThe Half Yearly Examination schedule for classes 1 to 12 has been officially published. Examinations will commence on October 12, 2026 and conclude on October 24, 2026. Detailed subject-wise syllabus and timings are available for download below. Please ensure your child is well-prepared and adheres to reporting timings.',
    read: false,
    attachmentName: 'Half_Yearly_Exam_Schedule_2026.pdf',
  },
  {
    id: 'ann-2',
    title: 'Parent-Teacher Meeting',
    date: '18 Sep 2026',
    category: 'Event',
    summary: 'Parent-Teacher Meeting will be conducted on September 28 from 10:00 AM to 12:00 PM.',
    fullMessage: 'Dear Parents,\nThe Term 1 Parent-Teacher Meeting (PTM) is scheduled for Saturday, September 28, 2026, between 10:00 AM and 12:00 PM in respective classrooms. You will have one-on-one interaction with class and subject teachers regarding academic progress and overall development.',
    read: false,
  },
  {
    id: 'ann-3',
    title: 'School Holiday Notice',
    date: '15 Sep 2026',
    category: 'Holiday',
    summary: 'School will remain closed on October 2 on account of Gandhi Jayanti.',
    fullMessage: 'Dear Parents & Students,\nPlease note that the school will remain closed on Friday, October 2, 2026 on account of Gandhi Jayanti. Regular classes will resume on Monday, October 5, 2026.',
    read: false,
  },
  {
    id: 'ann-4',
    title: 'Science Exhibition',
    date: '12 Sep 2026',
    category: 'Event',
    summary: 'Students are invited to participate in the annual Science Exhibition.',
    fullMessage: 'Dear Parents,\nThe Annual Inter-School Science Exhibition "Innovate 2026" will be held on October 22. Interested students from classes 6 to 12 can submit project abstracts to their respective Science teachers by September 30.',
    read: true,
    attachmentName: 'Science_Exhibition_Guidelines.pdf',
  },
  {
    id: 'ann-5',
    title: 'Fee Payment Reminder',
    date: '10 Sep 2026',
    category: 'Fees',
    summary: 'Parents are requested to complete pending fee payments before the due date.',
    fullMessage: 'Dear Parents,\nThis is a gentle reminder to settle the Term 2 tuition and transportation fees before October 15, 2026 to avoid any late fees. You can pay securely online via the Parent Portal Fee section or at the school accounts desk.',
    read: true,
  },
];

// ─── Realistic Homework Dataset ─────────────────────────────────────────────
const INITIAL_HOMEWORK: HomeworkItem[] = [
  // Ananya's Homework (Class 7-B)
  {
    id: 'hw-a1',
    childKey: 'ananya',
    subject: 'Mathematics',
    title: 'Algebra Worksheet',
    dueDate: '26 Sep 2026',
    assignedDate: '22 Sep 2026',
    status: 'Pending',
    description: 'Complete exercises 1–20 from Chapter 5 (Algebraic Expressions) in your notebook.',
    teacher: 'Ms. Priya Desai',
    attachment: 'Algebra_Worksheet_Ch5.pdf',
    submissionInfo: 'Submit physical notebook in class or upload scanned photo here.',
    color: '#2563EB',
  },
  {
    id: 'hw-a2',
    childKey: 'ananya',
    subject: 'Science',
    title: 'Human Digestive System',
    dueDate: '27 Sep 2026',
    assignedDate: '23 Sep 2026',
    status: 'Pending',
    description: 'Prepare a neatly labelled diagram of the human digestive system with organ functions on an A4 sheet.',
    teacher: 'Dr. Ramesh Rao',
    attachment: 'Digestive_System_Rubric.pdf',
    submissionInfo: 'Chart/Sheet submission on Monday morning.',
    color: '#10B981',
  },
  {
    id: 'hw-a3',
    childKey: 'ananya',
    subject: 'English',
    title: 'Essay Writing',
    dueDate: '25 Sep 2026',
    assignedDate: '20 Sep 2026',
    status: 'Overdue',
    description: 'Write a 500-word descriptive essay on "My Favorite Book" following the standard 5-paragraph structure.',
    teacher: 'Mrs. S. Kapoor',
    submissionInfo: 'Pending submission. Immediate submission required.',
    color: '#EF4444',
  },
  {
    id: 'hw-a4',
    childKey: 'ananya',
    subject: 'Social Studies',
    title: 'Indian Constitution',
    dueDate: '30 Sep 2026',
    assignedDate: '23 Sep 2026',
    status: 'Pending',
    description: 'Read Chapter 7 (Understanding the Constitution) and answer questions 1–10 in the workbook.',
    teacher: 'Mr. Arvind Joshi',
    attachment: 'Civics_Ch7_Study_Guide.pdf',
    submissionInfo: 'Workbook check in Tuesday period 4.',
    color: '#F59E0B',
  },
  {
    id: 'hw-a5',
    childKey: 'ananya',
    subject: 'Telugu',
    title: 'Poem Recitation',
    dueDate: '28 Sep 2026',
    assignedDate: '21 Sep 2026',
    status: 'Completed',
    description: 'Prepare the assigned poem for recitation with proper pronunciation and intonation.',
    teacher: 'Mrs. Lalitha Devi',
    submissionInfo: 'Verified and marked completed in oral test.',
    color: '#10B981',
  },

  // Rahul's Homework (Class 10-A)
  {
    id: 'hw-r1',
    childKey: 'rahul',
    subject: 'Physics',
    title: 'Ray Optics Numerical Problems',
    dueDate: '26 Sep 2026',
    assignedDate: '22 Sep 2026',
    status: 'Pending',
    description: 'Solve sample paper questions 1 to 15 from Chapter 9 on mirror formula and magnification.',
    teacher: 'Mr. S. Verma',
    attachment: 'Physics_Optics_Problems.pdf',
    submissionInfo: 'Submit in Physics Assignment File.',
    color: '#2563EB',
  },
  {
    id: 'hw-r2',
    childKey: 'rahul',
    subject: 'Chemistry',
    title: 'Organic Reactions Worksheet',
    dueDate: '27 Sep 2026',
    assignedDate: '23 Sep 2026',
    status: 'Pending',
    description: 'Prepare reaction pathways and nomenclature for alcohol and aldehyde conversions.',
    teacher: 'Dr. Arisudan',
    attachment: 'Chemistry_Reaction_Chart.pdf',
    submissionInfo: 'Submit completed worksheet in Chemistry lab.',
    color: '#10B981',
  },
  {
    id: 'hw-r3',
    childKey: 'rahul',
    subject: 'Mathematics',
    title: 'Quadratic Equations Assignment',
    dueDate: '24 Sep 2026',
    assignedDate: '19 Sep 2026',
    status: 'Overdue',
    description: 'Complete NCERT exercise 4.3 and past 5 years board examination questions on discriminant.',
    teacher: 'Mr. K. Narayanan',
    submissionInfo: 'Overdue. Please submit to subject teacher.',
    color: '#EF4444',
  },
  {
    id: 'hw-r4',
    childKey: 'rahul',
    subject: 'English',
    title: 'Literature Analysis — The Tempest',
    dueDate: '29 Sep 2026',
    assignedDate: '21 Sep 2026',
    status: 'Completed',
    description: 'Write a critical character arc analysis of Prospero in Act 3 with supporting quotes.',
    teacher: 'Mrs. Neha Sharma',
    submissionInfo: 'Graded: A+ (9.5/10) with positive remarks.',
    color: '#10B981',
  },
];

// ─── Realistic Teacher Conversations ─────────────────────────────────────────
const INITIAL_CONVERSATIONS: TeacherConversation[] = [
  // Ananya's Conversations
  {
    id: 'conv-a1',
    childKey: 'ananya',
    teacherName: 'Ms. Priya Desai',
    teacherRole: 'Science Teacher · Class 7-B',
    teacherAvatar: 'P',
    avatarColor: '#2563EB',
    timeAgo: '2 hours ago',
    unread: true,
    messages: [
      {
        id: 'm1',
        sender: 'teacher',
        senderName: 'Ms. Priya Desai',
        content: 'Good evening Mr. Vikram. I wanted to share a quick update about Ananya\'s progress in Science.',
        timestamp: '5:10 PM',
      },
      {
        id: 'm2',
        sender: 'teacher',
        senderName: 'Ms. Priya Desai',
        content: 'Ananya is doing very well in theoretical concepts and scored 95% in the recent unit test! Please encourage her to participate more actively in classroom lab demonstrations.',
        timestamp: '5:12 PM',
      },
      {
        id: 'm3',
        sender: 'parent',
        senderName: 'Vikram Sharma',
        content: 'Thank you for the update Ms. Desai! I will definitely talk to her tonight and encourage her to ask more questions during lab work.',
        timestamp: '5:24 PM',
      },
      {
        id: 'm4',
        sender: 'teacher',
        senderName: 'Ms. Priya Desai',
        content: 'Wonderful! She has great potential. Have a good evening.',
        timestamp: '5:30 PM',
      },
    ],
  },
  {
    id: 'conv-a2',
    childKey: 'ananya',
    teacherName: 'Mr. Ravi Kumar',
    teacherRole: 'Mathematics Teacher · Class 7-B',
    teacherAvatar: 'R',
    avatarColor: '#10B981',
    timeAgo: 'Yesterday',
    unread: true,
    messages: [
      {
        id: 'm201',
        sender: 'teacher',
        senderName: 'Mr. Ravi Kumar',
        content: 'Hello Mr. Sharma, please make sure Ananya completes the Chapter 5 Algebra worksheet before Friday.',
        timestamp: 'Yesterday 3:45 PM',
      },
      {
        id: 'm202',
        sender: 'parent',
        senderName: 'Vikram Sharma',
        content: 'Noted sir, she has completed 15 questions and will finish the rest today.',
        timestamp: 'Yesterday 6:00 PM',
      },
      {
        id: 'm203',
        sender: 'teacher',
        senderName: 'Mr. Ravi Kumar',
        content: 'Great, thanks for following up.',
        timestamp: 'Yesterday 6:15 PM',
      },
    ],
  },
  {
    id: 'conv-a3',
    childKey: 'ananya',
    teacherName: 'Ms. Neha Sharma',
    teacherRole: 'Class Teacher · Class 7-B',
    teacherAvatar: 'N',
    avatarColor: '#8B5CF6',
    timeAgo: '3 days ago',
    unread: false,
    messages: [
      {
        id: 'm301',
        sender: 'teacher',
        senderName: 'Ms. Neha Sharma',
        content: 'Reminder: Parent-Teacher Meeting is scheduled for September 28 from 10:00 AM to 12:00 PM. Looking forward to meeting you.',
        timestamp: '21 Sep 11:30 AM',
      },
      {
        id: 'm302',
        sender: 'parent',
        senderName: 'Vikram Sharma',
        content: 'Thank you Ms. Neha, I have added it to my calendar and will be present at 10:30 AM.',
        timestamp: '21 Sep 1:15 PM',
      },
    ],
  },

  // Rahul's Conversations
  {
    id: 'conv-r1',
    childKey: 'rahul',
    teacherName: 'Mr. S. Verma',
    teacherRole: 'Physics Teacher · Class 10-A',
    teacherAvatar: 'V',
    avatarColor: '#2563EB',
    timeAgo: 'Yesterday',
    unread: true,
    messages: [
      {
        id: 'mr1',
        sender: 'teacher',
        senderName: 'Mr. S. Verma',
        content: 'Dear Mr. Sharma, Rahul performed exceptionally well in the mechanics unit test (24/25). Keep encouraging his focus on numerical problem solving.',
        timestamp: 'Yesterday 4:20 PM',
      },
      {
        id: 'mr2',
        sender: 'parent',
        senderName: 'Vikram Sharma',
        content: 'Thank you Mr. Verma! He enjoys your classes thoroughly.',
        timestamp: 'Yesterday 6:30 PM',
      },
    ],
  },
  {
    id: 'conv-r2',
    childKey: 'rahul',
    teacherName: 'Mrs. Kavita Reddy',
    teacherRole: 'Class 10 Class Teacher',
    teacherAvatar: 'K',
    avatarColor: '#EC4899',
    timeAgo: '2 days ago',
    unread: true,
    messages: [
      {
        id: 'mr201',
        sender: 'teacher',
        senderName: 'Mrs. Kavita Reddy',
        content: 'Please verify Rahul\'s Board Examination Candidate registration slip and sign the duplicate copy by this Friday.',
        timestamp: '22 Sep 10:00 AM',
      },
    ],
  },
  {
    id: 'conv-r3',
    childKey: 'rahul',
    teacherName: 'Dr. Arisudan',
    teacherRole: 'Chemistry Teacher · Class 10-A',
    teacherAvatar: 'A',
    avatarColor: '#10B981',
    timeAgo: '4 days ago',
    unread: false,
    messages: [
      {
        id: 'mr301',
        sender: 'teacher',
        senderName: 'Dr. Arisudan',
        content: 'Chemistry laboratory records need to be submitted for Term 1 practical evaluation.',
        timestamp: '20 Sep 2:00 PM',
      },
    ],
  },
];

const ParentDataContext = createContext<ParentDataContextValue>({} as any);

export function ParentDataProvider({ children }: { children: ReactNode }) {
  const [selectedChildKey, setSelectedChildKey] = useState<ChildKey>('ananya');
  const [activeWeekOffset, setActiveWeekOffset] = useState<number>(0);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [homework, setHomework] = useState<HomeworkItem[]>(INITIAL_HOMEWORK);
  const [conversations, setConversations] = useState<TeacherConversation[]>(INITIAL_CONVERSATIONS);

  const selectedChild = useMemo(() => {
    return CHILDREN_PROFILES.find((c) => c.key === selectedChildKey) || CHILDREN_PROFILES[0];
  }, [selectedChildKey]);

  const timetable = useMemo(() => {
    return selectedChildKey === 'ananya' ? ANANYA_TIMETABLE : RAHUL_TIMETABLE;
  }, [selectedChildKey]);

  const filteredHomework = useMemo(() => {
    return homework.filter((h) => h.childKey === selectedChildKey);
  }, [homework, selectedChildKey]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => c.childKey === selectedChildKey);
  }, [conversations, selectedChildKey]);

  const unreadMessagesCount = useMemo(() => {
    return filteredConversations.filter((c) => c.unread).length;
  }, [filteredConversations]);

  const unreadAnnouncementsCount = useMemo(() => {
    return announcements.filter((a) => !a.read).length;
  }, [announcements]);

  const pendingHomeworkCount = useMemo(() => {
    return filteredHomework.filter((h) => h.status === 'Pending' || h.status === 'Overdue').length;
  }, [filteredHomework]);

  const markAnnouncementRead = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllAnnouncementsRead = () => {
    setAnnouncements((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const submitHomeworkItem = (id: string, notes?: string) => {
    setHomework((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Completed',
              submissionInfo: `Submitted online on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}. ${notes ? `Notes: "${notes}"` : ''}`,
            }
          : item
      )
    );
  };

  const sendTeacherMessage = (convId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessageBubble = {
      id: 'msg-' + Date.now(),
      sender: 'parent',
      senderName: 'Vikram Sharma',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === convId) {
          return {
            ...conv,
            unread: false,
            timeAgo: 'Just now',
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );
  };

  const markConversationRead = (convId: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === convId ? { ...conv, unread: false } : conv))
    );
  };

  return (
    <ParentDataContext.Provider
      value={{
        selectedChildKey,
        setSelectedChildKey,
        selectedChild,
        childrenProfiles: CHILDREN_PROFILES,
        timetable,
        announcements,
        homework: filteredHomework,
        conversations: filteredConversations,
        activeWeekOffset,
        setActiveWeekOffset,
        markAnnouncementRead,
        markAllAnnouncementsRead,
        submitHomeworkItem,
        sendTeacherMessage,
        markConversationRead,
        unreadMessagesCount,
        unreadAnnouncementsCount,
        pendingHomeworkCount,
        upcomingEventsCount: 3,
      }}
    >
      {children}
    </ParentDataContext.Provider>
  );
}

export function useParentData(): ParentDataContextValue {
  const context = useContext(ParentDataContext);
  if (!context) {
    throw new Error('useParentData must be used within a ParentDataProvider');
  }
  return context;
}
