/**
 * Messages API functions
 */

import { apiClient, ApiError, getToken } from './config';

export interface MessageThread {
  id: string;
  type: string;
  practice_id?: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  message_count?: number;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_type: string;
  sender_name: string;
  content: string;
  attachments?: any;
  read: boolean;
  created_at: string;
  edited_at?: string;
}

export interface ThreadWithMessages extends MessageThread {
  messages: Message[];
  participants: any[];
}

/**
 * Get all message threads for authenticated user
 */
export async function getThreads(): Promise<MessageThread[]> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.get<MessageThread[]>(
      '/api/messages/threads',
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch message threads');
  }
}

/**
 * Get thread with all messages
 */
export async function getThread(threadId: string): Promise<ThreadWithMessages> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.get<ThreadWithMessages>(
      `/api/messages/threads/${threadId}`,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      throw new Error('Thread not found');
    }
    throw new Error(apiError.error || 'Failed to fetch thread');
  }
}

/**
 * Create new message thread
 */
export async function createThread(data: {
  type?: string;
  practice_id?: string;
  participant_ids: string[];
  initial_message?: string;
}): Promise<MessageThread> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post<MessageThread>(
      '/api/messages/threads',
      data,
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to create thread');
  }
}

/**
 * Send message in thread
 */
export async function sendMessage(
  threadId: string,
  content: string
): Promise<Message> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await apiClient.post<Message>(
      '/api/messages',
      { thread_id: threadId, content },
      token
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to send message');
  }
}
