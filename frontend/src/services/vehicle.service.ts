import api from './api';

export interface Vehicle {
  _id: string;
  companyId: string;
  vehicleNumber: string;
  type: 'truck' | 'van' | 'bike' | 'container';
  capacityKg: number;
  healthScore: number;
  fuelType: 'diesel' | 'petrol' | 'electric' | 'cng';
  lastServiceDate?: string;
  nextServiceDate?: string;
  insuranceExpiry?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  currentDriverId?: string;
  currentShipmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehiclesListResponse {
  success: boolean;
  message: string;
  data: {
    vehicles: Vehicle[];
    total: number;
    page: number;
    pages: number;
  };
}

const vehicleService = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get<VehiclesListResponse>('/vehicles', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Vehicle }>(`/vehicles/${id}`);
    return response.data.data;
  },
};

export default vehicleService;
