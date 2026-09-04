import { Mark } from '../types/models';

export const mockMarks: Mark[] = [
  {
    id: 'm1',
    studentId: 's1',
    examId: 'e0',
    subjectId: 'sub1',
    subjectName: 'Mathematics',
    marksObtained: 87,
    maxMarks: 100,
    grade: 'A',
  },
  {
    id: 'm2',
    studentId: 's1',
    examId: 'e0',
    subjectId: 'sub2',
    subjectName: 'Science',
    marksObtained: 91,
    maxMarks: 100,
    grade: 'A+',
  },
  {
    id: 'm3',
    studentId: 's1',
    examId: 'e0',
    subjectId: 'sub3',
    subjectName: 'English',
    marksObtained: 84,
    maxMarks: 100,
    grade: 'B+',
  },
];
