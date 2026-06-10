import { create } from 'zustand';

interface AppState {
  driverStatus: 'AVAILABLE' | 'DRIVING' | 'ON_BREAK' | 'OFFLINE';
  setDriverStatus: (status: AppState['driverStatus']) => void;
  
  // Example global setting
  isLowBandwidthMode: boolean;
  toggleLowBandwidthMode: () => void;
  
  // Example of global selected entity
  selectedShipmentId: string | null;
  setSelectedShipmentId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  driverStatus: 'DRIVING',
  setDriverStatus: (status) => set({ driverStatus: status }),
  
  isLowBandwidthMode: false,
  toggleLowBandwidthMode: () => set((state) => ({ isLowBandwidthMode: !state.isLowBandwidthMode })),
  
  selectedShipmentId: null,
  setSelectedShipmentId: (id) => set({ selectedShipmentId: id }),
}));
