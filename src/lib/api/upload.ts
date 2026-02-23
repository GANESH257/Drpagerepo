/**
 * Upload API - for certification, badge, and award images.
 * Uses API_BASE_URL; no localStorage. Token from getToken() for auth.
 */

import { API_BASE_URL, getToken } from './config';

export interface UploadResponse {
  url: string;
}

/**
 * Upload a single image file. Returns the URL path (e.g. /uploads/xxx).
 * Use getUploadFullUrl(url) for img src.
 */
export async function uploadImage(file: File): Promise<string> {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required to upload');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || 'Upload failed');
  }

  const data: UploadResponse = await response.json();
  return data.url;
}

/**
 * Get full URL for an upload path (for use in img src).
 */
export function getUploadFullUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${p}`;
}
