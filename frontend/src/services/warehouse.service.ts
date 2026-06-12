import api from './api';

export interface Warehouse {
  _id: string;
  companyId: string;
  name: string;
  code: string;
  address: string;
  location: { type: string; coordinates: number[] };
  capacity: number;
  currentOccupancy: number;
  contactPhone?: string;
  contactEmail?: string;
  operatingHours: { open: string; close: string };
  status: 'active' | 'inactive' | 'full';
  createdAt: string;
  updatedAt: string;
}

export interface WarehousesListResponse {
  success: boolean;
  message: string;
  data: {
    warehouses: Warehouse[];
    total: number;
    page: number;
    pages: number;
  };
}

const warehouseService = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get<WarehousesListResponse>('/warehouses', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Warehouse }>(`/warehouses/${id}`);
    return response.data.data;
  },
};

export default warehouseService;
