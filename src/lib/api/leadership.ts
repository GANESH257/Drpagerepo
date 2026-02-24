/**
 * Leadership API (Board of Directors for Leadership & Committees page)
 */

import { apiClient, getToken } from './config';

export interface BoardOfDirectorsResponse {
  introText: string;
  bylawsUrl: string;
  directors: { fullName: string; role: string }[];
}

export async function getBoardOfDirectors(): Promise<BoardOfDirectorsResponse> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const response = await apiClient.get<BoardOfDirectorsResponse>(
    '/api/leadership/board',
    token
  );
  return response;
}
