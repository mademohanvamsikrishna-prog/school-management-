import { Event } from '../types/models';

export const mockEvents: Event[] = [
  {
    id: 'ev1',
    title: 'Annual Sports Day',
    description: 'Join us for the Annual Sports Day 2023.',
    date: '2023-12-10',
    time: '08:00',
    location: 'School Ground',
    type: 'sports',
    audience: 'all',
  },
  {
    id: 'ev2',
    title: 'Science Exhibition',
    description: 'Students from all classes will showcase their science projects.',
    date: '2023-11-25',
    time: '10:00',
    location: 'Main Auditorium',
    type: 'academic',
    audience: 'all',
  },
];
