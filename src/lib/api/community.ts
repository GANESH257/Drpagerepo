/**
 * Community API - posts (questions) and comments (answers) by section
 */

import { apiClient, ApiError, getToken } from './config';

export interface CommunitySection {
  id: string;
  name: string;
}

export interface CommunityPost {
  id: string;
  section: string;
  author_type: string;
  author_id: string;
  author_display_name: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_type: string;
  author_id: string;
  author_display_name: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityPostWithComments extends CommunityPost {
  comments: CommunityComment[];
}

export interface PostsResponse {
  posts: CommunityPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getCommunitySections(): Promise<CommunitySection[]> {
  try {
    const data = await apiClient.get<CommunitySection[]>('/api/community/sections');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // Handle different error types gracefully
    if (error && typeof error === 'object' && 'error' in error) {
      const apiError = error as ApiError;
      throw new Error(apiError.error || 'Failed to fetch sections');
    }
    // Handle network errors or other unexpected errors
    if (error instanceof Error) {
      throw new Error(`Failed to fetch sections: ${error.message}`);
    }
    throw new Error('Failed to fetch sections');
  }
}

export async function getCommunityPosts(
  section: string,
  page = 1,
  limit = 20
): Promise<PostsResponse> {
  try {
    const params = new URLSearchParams({
      section: section || 'general',
      page: String(page),
      limit: String(limit),
    });
    const data = await apiClient.get<PostsResponse>(
      `/api/community/posts?${params.toString()}`
    );
    return data;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to fetch posts');
  }
}

export async function getCommunityPost(id: string): Promise<CommunityPostWithComments> {
  try {
    const data = await apiClient.get<CommunityPostWithComments>(
      `/api/community/posts/${id}`
    );
    return data;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) throw new Error('Post not found');
    throw new Error(apiError.error || 'Failed to fetch post');
  }
}

export async function createCommunityPost(
  section: string,
  title: string,
  body: string
): Promise<CommunityPost> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  try {
    const data = await apiClient.post<CommunityPost>(
      '/api/community/posts',
      { section, title, body },
      token
    );
    return data;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to create post');
  }
}

export async function createCommunityComment(
  postId: string,
  body: string
): Promise<CommunityComment> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  try {
    const data = await apiClient.post<CommunityComment>(
      `/api/community/posts/${postId}/comments`,
      { body },
      token
    );
    return data;
  } catch (error) {
    const apiError = error as ApiError;
    throw new Error(apiError.error || 'Failed to add comment');
  }
}

/** Delete a post (admin only). */
export async function deleteCommunityPost(postId: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  try {
    await apiClient.delete<void>(`/api/community/posts/${postId}`, token);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) throw new Error('Post not found');
    throw new Error(apiError.error || 'Failed to delete post');
  }
}

/** Delete a comment (admin only). */
export async function deleteCommunityComment(commentId: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  try {
    await apiClient.delete<void>(`/api/community/comments/${commentId}`, token);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) throw new Error('Comment not found');
    throw new Error(apiError.error || 'Failed to delete comment');
  }
}
