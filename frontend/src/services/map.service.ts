import api from './api';
import { cachedFetch } from '@/lib/requestCache';

export interface MapWarehouse {
  _id: string;
  name: string;
  code: string;
  address: string;
  status: string;
  coordinates: number[] | null;
}

export interface MapShipment {
  _id: string;
  trackingNumber: string;
  status: string;
  priority: string;
  riskScore: number;
  destinationAddress: string;
  destinationCoordinates: number[] | null;
  originCoordinates: number[] | null;
  originName: string;
  destName: string;
  distanceKm: number;
  weightKg: number;
  packageCount: number;
  vehicle: { vehicleNumber: string; type: string; status: string } | null;
  driver: { name: string; phone: string } | null;
}

export interface MapVehicleLocation {
  _id: string;
  vehicleNumber: string;
  type: string;
  status: string;
  healthScore: number;
  fuelType: string;
  location: { lat: number; lng: number };
  speed: number;
  heading: number;
  accuracy: number | null;
  lastGpsTimestamp: string | null;
  hasGpsData: boolean;
  shipmentId: string | null;
  trackingNumber: string;
  destinationAddress: string;
  shipmentStatus: string | null;
}

export interface MapOverviewResponse {
  success: boolean;
  message: string;
  data: {
    warehouses: MapWarehouse[];
    shipments: MapShipment[];
  };
}

export interface VehicleLocationsResponse {
  success: boolean;
  message: string;
  data: {
    vehicles: MapVehicleLocation[];
  };
}

export interface RouteResponse {
  success: boolean;
  message: string;
  data: {
    polyline: string;
    distanceMeters: number;
    duration: string;
  };
}

const mapService = {
  getOverview: async () => {
    return cachedFetch('map:overview', async () => {
      const response = await api.get<MapOverviewResponse>('/map/overview');
      return response.data.data;
    }, 15_000);
  },

  getVehicleLocations: async () => {
    return cachedFetch('map:vehicles', async () => {
      const response = await api.get<VehicleLocationsResponse>('/map/vehicles');
      return response.data.data;
    }, 15_000);
  },

  getRoute: async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    const response = await api.post<RouteResponse>('/map/route', { origin, destination });
    return response.data.data;
  },

  reportLocation: async (data: {
    vehicleId: string;
    driverId?: string;
    shipmentId?: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    altitude?: number;
    accuracy?: number;
  }) => {
    const response = await api.post('/gps/report', data);
    return response.data;
  },

  getGpsVehicleLocations: async () => {
    const response = await api.get<VehicleLocationsResponse>('/gps/vehicles');
    return response.data.data;
  },

  getLocationHistory: async (vehicleId: string, params?: { from?: string; to?: string; limit?: number }) => {
    const response = await api.get(`/gps/history/${vehicleId}`, { params });
    return response.data.data;
  },
};

export default mapService;
