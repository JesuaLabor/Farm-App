import { apiClient } from './index';
import type {
  CreateProgramPayload,
  GovernmentProgram,
  ProgramApplication,
  ReviewApplicationPayload,
  SubmitApplicationPayload,
} from '../types/program';

export const programApi = {
  listPrograms: async (status?: string): Promise<GovernmentProgram[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const res = await apiClient.get<GovernmentProgram[]>(`/api/programs?${params.toString()}`);
    return res.data;
  },

  getProgramByID: async (id: string): Promise<GovernmentProgram> => {
    const res = await apiClient.get<GovernmentProgram>(`/api/programs/${id}`);
    return res.data;
  },

  createProgram: async (payload: CreateProgramPayload): Promise<GovernmentProgram> => {
    const res = await apiClient.post<GovernmentProgram>('/api/programs', payload);
    return res.data;
  },

  updateProgramStatus: async (id: string, status: 'open' | 'closed'): Promise<void> => {
    await apiClient.put(`/api/programs/${id}/status`, { status });
  },

  submitApplication: async (programId: string, payload: SubmitApplicationPayload): Promise<ProgramApplication> => {
    const res = await apiClient.post<ProgramApplication>(`/api/programs/${programId}/applications`, payload);
    return res.data;
  },

  listMyApplications: async (): Promise<ProgramApplication[]> => {
    const res = await apiClient.get<ProgramApplication[]>('/api/programs/applications/my');
    return res.data;
  },

  listProgramApplications: async (programId: string): Promise<ProgramApplication[]> => {
    const res = await apiClient.get<ProgramApplication[]>(`/api/programs/${programId}/applications`);
    return res.data;
  },

  reviewApplication: async (appId: string, payload: ReviewApplicationPayload): Promise<void> => {
    await apiClient.put(`/api/programs/applications/${appId}/status`, payload);
  },
};
