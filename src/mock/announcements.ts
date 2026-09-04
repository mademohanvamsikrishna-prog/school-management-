import { Announcement } from '../types/models';

export const mockAnnouncements: Announcement[] = [
  {
    id: 'an1',
    title: 'School Reopening Date',
    content: 'The school will reopen on 1st November after the Diwali break.',
    date: '2023-10-20',
    authorId: 'admin1',
    authorName: 'Principal Office',
    targetAudience: 'all',
    isImportant: true,
  },
  {
    id: 'an2',
    title: 'Fee Payment Reminder',
    content: 'Please clear all pending fee dues by 15th December to avoid late fines.',
    date: '2023-10-22',
    authorId: 'admin2',
    authorName: 'Accounts Dept',
    targetAudience: ['parent'],
    isImportant: false,
  },
];
