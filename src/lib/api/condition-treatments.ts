import { apiClient, ApiError, getToken } from './config';

export interface ConditionTreatmentLink {
  condition_id: string;
  treatment_id: string;
  condition_name?: string;
  treatment_name?: string;
}

export async function getConditionTreatments(filters?: {
  condition_id?: string;
  treatment_id?: string;
}): Promise<ConditionTreatmentLink[]> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const params = new URLSearchParams();
  if (filters?.condition_id) params.set('condition_id', filters.condition_id);
  if (filters?.treatment_id) params.set('treatment_id', filters.treatment_id);
  const q = params.toString();
  const data = await apiClient.get<ConditionTreatmentLink[]>(
    `/api/condition-treatments${q ? `?${q}` : ''}`,
    token
  );
  return Array.isArray(data) ? data : [];
}

export async function linkConditionTreatment(conditionId: string, treatmentId: string): Promise<ConditionTreatmentLink> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  return apiClient.post<ConditionTreatmentLink>('/api/condition-treatments', {
    condition_id: conditionId,
    treatment_id: treatmentId,
  }, token);
}

export async function unlinkConditionTreatment(
  conditionId: string,
  treatmentId: string
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  await apiClient.delete(
    `/api/condition-treatments/${conditionId}/${treatmentId}`,
    token
  );
}
