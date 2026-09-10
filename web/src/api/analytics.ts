import { apiClient } from './index';
import type { LGUDashboardSummary } from '../types/analytics';

export interface DashboardFilterOptions {
  region?: string;
  municipality?: string;
  startDate?: string;
  endDate?: string;
}

export const analyticsApi = {
  getLGUDashboard: async (options?: DashboardFilterOptions): Promise<LGUDashboardSummary> => {
    const params = new URLSearchParams();
    if (options?.region) params.append('region', options.region);
    if (options?.municipality) params.append('municipality', options.municipality);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const res = await apiClient.get<LGUDashboardSummary>(`/api/lgu/dashboard?${params.toString()}`);
    return res.data;
  },
};
