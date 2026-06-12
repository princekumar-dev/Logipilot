'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Building2, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import warehouseService, { Warehouse } from '@/services/warehouse.service';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    warehouseService.getAll({ limit: 50 })
      .then((res) => { if (!cancelled) setWarehouses(res.warehouses); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pathname]);

  const getStatusLabel = (wh: Warehouse) => {
    const pct = wh.capacity > 0 ? (wh.currentOccupancy / wh.capacity) * 100 : 0;
    if (pct >= 90) return 'Critical';
    if (pct >= 75) return 'Warning';
    return 'Normal';
  };

  const getCapacityPct = (wh: Warehouse) => {
    return wh.capacity > 0 ? Math.round((wh.currentOccupancy / wh.capacity) * 100) : 0;
  };

  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto text-[#222222]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#dddddd] transition-all duration-300">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#222222]">
              Warehouse Operations
            </h1>
            <p className="text-[16px] text-[#6a6a6a] mt-1">Inventory capacity, throughput, and facility management.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300">
          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[280px] rounded-[14px] bg-[#f7f7f7] animate-pulse" />
            ))
          ) : warehouses.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-[#6a6a6a] text-[14px]">No warehouses found</div>
          ) : (
            warehouses.map((wh) => {
              const capacityPct = getCapacityPct(wh);
              const status = getStatusLabel(wh);
              return (
                <div
                  key={wh._id}
                  className="relative overflow-hidden bg-white border border-[#dddddd] rounded-[14px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer p-6 hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-[18px] font-bold tracking-tight text-[#222222] group-hover:underline decoration-2">{wh.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[14px] font-medium text-[#6a6a6a]">
                        <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                        {wh.address}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wide
                      ${status === 'Critical' ? 'bg-[#fff8f6] text-[#c13515]' :
                        status === 'Warning' ? 'bg-[#fff8eb] text-[#b25a00]' :
                        'bg-[#e2fad6] text-[#008a05]'}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-[12px]">
                      <span className="font-bold text-[#6a6a6a] uppercase tracking-wide">Capacity Used</span>
                      <span className={`font-bold ${capacityPct >= 90 ? 'text-[#c13515]' : capacityPct >= 75 ? 'text-[#b25a00]' : 'text-[#008a05]'}`}>{capacityPct}%</span>
                    </div>
                    <Progress
                      value={capacityPct}
                      className={`h-2.5 bg-[#f7f7f7]
                        ${capacityPct >= 90 ? '[&>div]:bg-primary' :
                          capacityPct >= 75 ? '[&>div]:bg-[#f2a600]' :
                          '[&>div]:bg-[#008a05]'}`
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#dddddd]">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-[#6a6a6a] uppercase tracking-wide mb-1">
                        Capacity
                      </span>
                      <span className="text-[24px] font-bold tracking-tight text-[#222222]">{wh.capacity.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col border-l border-[#dddddd] pl-4">
                      <span className="text-[12px] font-bold text-[#6a6a6a] uppercase tracking-wide mb-1">
                        Current Occupancy
                      </span>
                      <span className="text-[24px] font-bold tracking-tight text-[#222222]">{wh.currentOccupancy.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
