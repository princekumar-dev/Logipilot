import api from './api';
import { cachedFetch } from '@/lib/requestCache';

export interface DashboardStats {
  activeShipments: number;
  delayedShipments: number;
  deliveredShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  cancelledShipments: number;
  totalShipments: number;
  onTimeRate: number;
  fleetUtilization: number;
  avgDelay: number;
  avgRisk: number;
  totalDrivers: number;
  activeDrivers: number;
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
}

export interface AnalyticsSummary {
  summary: {
    totalShipments: number;
    deliveredShipments: number;
    delayedShipments: number;
    cancelledShipments: number;
    pendingShipments: number;
    inTransitShipments: number;
    onTimeRate: number;
    avgDelayMinutes: number;
    avgRisk: number;
  };
  volumeTrend: { date: string; count: number }[];
  delayCauses: { cause: string; count: number }[];
  priorityBreakdown: { priority: string; count: number }[];
}

export interface Recommendation {
  _id: string;
  shipmentId: string;
  companyId: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expectedTimeSavedMinutes?: number;
  expectedCostSaved?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  generatedAt: string;
}

export interface RecommendationsListResponse {
  success: boolean;
  message: string;
  data: {
    recommendations: Recommendation[];
    total: number;
    page: number;
    pages: number;
  };
}

export interface HighRiskShipment {
  shipmentId: string;
  trackingNumber: string;
  delayProbability: number;
  predictedDelayMinutes: number;
  predictedETA: string;
  riskScore: number;
  confidence: number;
  factors: { name: string; impact: number }[];
}

const analyticsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return cachedFetch('dashboard:stats', async () => {
      const response = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
      return response.data.data;
    });
  },

  getHighRiskShipments: async (): Promise<HighRiskShipment[]> => {
    return cachedFetch('dashboard:high-risk', async () => {
      const response = await api.get<{ success: boolean; data: HighRiskShipment[] }>('/dashboard/high-risk', {
        signal: AbortSignal.timeout(5000),
      });
      return response.data.data;
    }, 30_000);
  },

  getAnalyticsSummary: async (period?: number): Promise<AnalyticsSummary> => {
    const cacheKey = `analytics:summary:${period || 'default'}`;
    return cachedFetch(cacheKey, async () => {
      const response = await api.get<{ success: boolean; data: AnalyticsSummary }>('/analytics/summary', {
        params: period ? { period } : undefined,
      });
      return response.data.data;
    });
  },

  getRecommendations: async (params?: { page?: number; limit?: number; status?: string; priority?: string }) => {
    const cacheKey = `recommendations:${JSON.stringify(params || {})}`;
    return cachedFetch(cacheKey, async () => {
      const response = await api.get<RecommendationsListResponse>('/recommendations', { params });
      return response.data.data;
    });
  },
};

export default analyticsService;
