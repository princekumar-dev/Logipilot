'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Truck, AlertCircle, ShieldCheck, MapPin, Fuel } from "lucide-react";
import vehicleService, { Vehicle } from '@/services/vehicle.service';
import analyticsService, { DashboardStats } from '@/services/analytics.service';

const MapWrapper = dynamic(() => import('@/features/dashboard/components/MapWrapper').then(m => m.MapWrapper), { ssr: false, loading: () => <div className="h-full w-full rounded-[14px] bg-[#f7f7f7] animate-pulse" /> });

function useCountUp(target: number, duration = 600, enabled = true) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!enabled) { setValue(0); return; }
    fromRef.current = value;
    startRef.current = 0;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (p < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, enabled]);

  return value;
}

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      vehicleService.getAll({ limit: 50 }),
      analyticsService.getDashboardStats(),
    ])
      .then(([vehicleRes, statsRes]) => {
        if (!cancelled) { setVehicles(vehicleRes.vehicles); setStats(statsRes); }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pathname]);

  const activeCount = useCountUp(stats?.activeVehicles ?? 0, 600, !loading);
  const totalCount = useCountUp(stats?.totalVehicles ?? 0, 600, !loading);
  const maintenanceCount = useCountUp(stats?.maintenanceVehicles ?? 0, 600, !loading);
  const utilization = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  const kpiCards = [
    { title: 'Active Vehicles', value: activeCount, trend: `${utilization}% Utilization`, trendColor: 'text-[#008a05]', icon: Truck },
    { title: 'Maintenance Alerts', value: maintenanceCount, trend: 'Need attention', trendColor: 'text-[#c13515]', icon: AlertCircle },
    { title: 'Total Fleet', value: totalCount, trend: 'Registered vehicles', trendColor: 'text-[#222222]', icon: Truck },
  ];

  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#dddddd]">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#222222]">Fleet Command</h1>
            <p className="text-[16px] text-[#6a6a6a] mt-1">Monitor vehicle status, maintenance, and live telematics.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpiCards.map((kpi, idx) => (
            <div key={idx} className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px]">
              <div className="relative p-6 flex flex-col h-full z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[14px] font-medium text-[#6a6a6a]">{kpi.title}</span>
                  <kpi.icon className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col mt-auto">
                  <div className="text-[32px] font-bold tracking-tight text-[#222222]">
                    {loading ? (
                      <div className="h-8 w-16 rounded bg-[#f7f7f7] animate-pulse" />
                    ) : (
                      <span className="transition-opacity duration-300">{kpi.value.toLocaleString()}</span>
                    )}
                  </div>
                  {!loading && <p className={`text-[14px] font-bold mt-1 ${kpi.trendColor}`}>{kpi.trend}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px]">
          <div className="lg:col-span-2 relative overflow-hidden flex flex-col items-center justify-center h-[400px] lg:h-auto">
            <MapWrapper mode="fleet" />
          </div>

          <div className="lg:col-span-1 bg-white border border-[#dddddd] rounded-[14px] flex flex-col overflow-hidden max-h-[400px] lg:max-h-none">
            <div className="p-5 border-b border-[#dddddd] bg-white">
              <h3 className="font-bold text-[18px] text-[#222222]">Vehicle Roster</h3>
            </div>
            <div className="overflow-y-auto p-4 space-y-4 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {loading ? (
                <div className="space-y-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-[14px] bg-[#f7f7f7] animate-pulse" />
                  ))}
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-12 text-[#6a6a6a] text-[14px]">No vehicles found</div>
              ) : (
                vehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="bg-white border border-[#dddddd] rounded-[14px] p-4 hover:border-[#222222] transition-colors group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-[#222222]">{vehicle.vehicleNumber}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wide ${
                        vehicle.status === 'in_use' || vehicle.status === 'available' ? 'bg-[#e2fad6] text-[#008a05]' :
                        vehicle.status === 'maintenance' ? 'bg-[#fff8f6] text-[#c13515]' :
                        'bg-[#f7f7f7] text-[#6a6a6a]'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="text-[12px] font-medium text-[#222222] mb-4 bg-[#f7f7f7] w-fit px-2 py-1 rounded-[6px] capitalize">{vehicle.type} — {vehicle.fuelType}</div>
                    <div className="grid grid-cols-2 gap-2 text-[12px] font-medium">
                      <div className="flex items-center gap-1.5 text-[#6a6a6a]">
                        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Health: {vehicle.healthScore}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end text-[#6a6a6a]">
                        <Fuel className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{vehicle.capacityKg} kg</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
