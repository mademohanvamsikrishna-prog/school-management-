import { api } from './api';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  available_copies: number;
  total_copies: number;
  category_name?: string;
}

export interface BookIssue {
  id: string;
  copy_id: string;
  book_title: string;
  issued_date: string;
  due_date: string;
  returned_date?: string;
  status: string;
  fine_amount: number;
}

export const browseBooks = (search?: string, available_only = false): Promise<Book[]> => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (available_only) params.set('available_only', 'true');
  return api.get<Book[]>(`/library/books?${params.toString()}`);
};

export const getMyIssues = (): Promise<BookIssue[]> =>
  api.get<BookIssue[]>('/library/issues/mine');
