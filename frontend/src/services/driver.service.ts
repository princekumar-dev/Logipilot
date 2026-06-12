import api from './api';

export interface Driver {
  _id: string;
  companyId: string;
  name: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  rating: number;
  onTimeRate: number;
  totalDeliveries: number;
  totalDelays: number;
  yearsExperience: number;
  status: 'active' | 'inactive' | 'on_leave';
  currentShipmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriversListResponse {
  success: boolean;
  message: string;
  data: {
    drivers: Driver[];
    total: number;
    page: number;
    pages: number;
  };
}

const driverService = {
  getMe: async (): Promise<Driver | null> => {
    try {
      const response = await api.get<{ success: boolean; data: Driver }>('/drivers/me');
      return response.data.data;
    } catch {
      return null;
    }
  },

  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get<DriversListResponse>('/drivers', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Driver }>(`/drivers/${id}`);
    return response.data.data;
  },
};

export default driverService;
