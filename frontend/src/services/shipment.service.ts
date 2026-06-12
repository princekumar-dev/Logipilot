import api from './api';

export interface Shipment {
  _id: string;
  trackingNumber: string;
  originWarehouseId?: string;
  destinationWarehouseId?: string;
  destinationAddress?: string;
  destinationLocation?: { type: string; coordinates: number[] };
  driverId?: string;
  vehicleId?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  riskScore?: number;
  predictedDelay?: number;
  predictedETA?: string;
  eta?: string;
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedShipments {
  shipments: Shipment[];
  total: number;
  page: number;
  pages: number;
}

export interface ShipmentResponse {
  success: boolean;
  message: string;
  data: Shipment;
}

export interface ShipmentsListResponse {
  success: boolean;
  message: string;
  data: PaginatedShipments;
}

const shipmentService = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; priority?: string }) => {
    const response = await api.get<ShipmentsListResponse>('/shipments', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ShipmentResponse>(`/shipments/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Shipment>) => {
    const response = await api.post<ShipmentResponse>('/shipments', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Shipment>) => {
    const response = await api.put<ShipmentResponse>(`/shipments/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/shipments/${id}`);
    return response.data;
  },

  assignDriver: async (shipmentId: string, driverId: string) => {
    const response = await api.post<ShipmentResponse>(`/shipments/${shipmentId}/assign-driver`, { driverId });
    return response.data.data;
  },

  assignVehicle: async (shipmentId: string, vehicleId: string) => {
    const response = await api.post<ShipmentResponse>(`/shipments/${shipmentId}/assign-vehicle`, { vehicleId });
    return response.data.data;
  }
};

export default shipmentService;
