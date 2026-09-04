import { Fee } from '../types/models';

export const mockFees: Fee[] = [
  {
    id: 'f1',
    studentId: 's1',
    title: 'Tuition Fee - Term 1',
    amount: 15000,
    dueDate: '2023-08-15',
    status: 'paid',
    paidDate: '2023-08-10',
  },
  {
    id: 'f2',
    studentId: 's1',
    title: 'Tuition Fee - Term 2',
    amount: 15000,
    dueDate: '2023-12-15',
    status: 'pending',
  },
];
