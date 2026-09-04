import { Teacher } from '../types/models';

export const teachers: Teacher[] = [
  {
    id: 't1',
    name: 'Priya Desai',
    email: 'priya.d@school.edu',
    role: 'teacher',
    department: 'Mathematics',
    isClassTeacher: true,
    classTeacherOf: 'c10A',
    avatarUrl: 'https://i.pravatar.cc/150?u=priya',
  },
];
