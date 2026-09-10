import { api } from './api';

export interface Conversation {
  id: string;
  title?: string;
  type: string;
  participant_count: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const getMyConversations = (): Promise<Conversation[]> =>
  api.get<Conversation[]>('/chat/conversations');

export const createConversation = (
  participant_ids: string[],
  title?: string,
  type = 'direct',
): Promise<Conversation> =>
  api.post<Conversation>('/chat/conversations', { participant_ids, title, type });

export const getMessages = (
  conversationId: string,
  limit = 50,
  offset = 0,
): Promise<ChatMessage[]> =>
  api.get<ChatMessage[]>(
    `/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
  );

export const sendMessage = (conversationId: string, content: string): Promise<ChatMessage> =>
  api.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, { content });
