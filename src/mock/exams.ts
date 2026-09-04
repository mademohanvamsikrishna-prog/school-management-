import { Exam } from '../types/models';

export const mockExams: Exam[] = [
  {
    id: 'e1',
    name: 'Mid-Term Examination',
    classId: 'c10A',
    subjectId: 'sub1',
    subjectName: 'Mathematics',
    date: '2023-11-15',
    startTime: '09:00',
    endTime: '12:00',
    maxMarks: 100,
    status: 'upcoming',
  },
  {
    id: 'e2',
    name: 'Mid-Term Examination',
    classId: 'c10A',
    subjectId: 'sub2',
    subjectName: 'Science',
    date: '2023-11-17',
    startTime: '09:00',
    endTime: '12:00',
    maxMarks: 100,
    status: 'upcoming',
  },
];
