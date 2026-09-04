import { Assignment } from '../types/models';

export const mockAssignments: Assignment[] = [
  {
    id: 'a1',
    classId: 'c10A',
    subjectId: 'sub1',
    subjectName: 'Mathematics',
    teacherId: 't1',
    title: 'Algebra Equations',
    description: 'Solve exercises 1 to 20 from Chapter 5.',
    issueDate: '2023-10-25',
    dueDate: '2023-10-28',
    status: 'pending',
  },
  {
    id: 'a2',
    classId: 'c10A',
    subjectId: 'sub2',
    subjectName: 'Science',
    teacherId: 't2',
    title: 'Physics Lab Report',
    description: 'Submit the lab report for the pendulum experiment.',
    issueDate: '2023-10-24',
    dueDate: '2023-10-27',
    status: 'submitted',
  },
];
