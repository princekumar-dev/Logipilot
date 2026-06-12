'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Package, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import shipmentService, { Shipment } from '@/services/shipment.service';
import driverService, { Driver } from '@/services/driver.service';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-[#f7f7f7] animate-pulse" />
          <div className="h-5 w-36 rounded bg-[#f7f7f7] animate-pulse" />
        </div>
        <div className="h-5 w-16 rounded bg-[#f7f7f7] animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-48 rounded bg-[#f7f7f7] animate-pulse" />
        <div className="h-3 w-28 rounded bg-[#f7f7f7] animate-pulse" />
      </div>
      <div className="border-t border-slate-100 pt-4">
        <div className="h-10 w-full rounded-xl bg-[#f7f7f7] animate-pulse" />
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  in_transit: 'bg-blue-50 text-blue-700 border border-blue-100',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  pending: 'bg-slate-100 text-slate-600 border border-slate-200',
  delayed: 'bg-red-50 text-red-700 border border-red-100',
  cancelled: 'bg-slate-100 text-slate-400 border border-slate-200',
};

const statusLabels: Record<string, string> = {
  in_transit: 'IN TRANSIT',
  delivered: 'DELIVERED',
  pending: 'PENDING',
  delayed: 'DELAYED',
  cancelled: 'CANCELLED',
};

export default function DeliveriesPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    shipmentService.getAll({ limit: 50 })
      .then((res) => { if (!cancelled) setShipments(res.shipments); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pathname]);

  const filtered = filter === 'ALL' ? shipments : shipments.filter(s => s.status === filter.toUpperCase().replace(' ', '_'));

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-6 py-4 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Deliveries</h1>
        <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {['ALL', 'PENDING', 'IN TRANSIT', 'DELIVERED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-4 pb-32 flex-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Deliveries Found"
            description="You currently have no deliveries assigned to your route. Check back later or contact dispatch."
            actionLabel="Refresh Assignments"
            onAction={() => window.location.reload()}
          />
        ) : (
          filtered.map((shipment) => (
            <div
              key={shipment._id}
              className={`bg-white rounded-3xl p-5 border shadow-sm relative overflow-hidden flex flex-col transition-all duration-300 ${shipment.status === 'delivered' ? 'border-slate-100 opacity-60' : 'border-slate-200'}`}
            >
              {shipment.priority === 'critical' && shipment.status !== 'delivered' && (
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-500" />
              )}
              {shipment.status === 'delivered' && (
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
              )}

              <div className="flex justify-between items-start mb-4 pl-1">
                <div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 block mb-1">
                    {shipment.trackingNumber}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{shipment.destinationAddress || 'Unknown Destination'}</h3>
                </div>
                <div className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-widest uppercase ${statusColors[shipment.status] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                  {statusLabels[shipment.status] || shipment.status}
                </div>
              </div>

              <div className="space-y-2 mb-6 pl-1">
                <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {shipment.destinationAddress || 'No address'}
                </p>
                <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {shipment.eta ? `ETA: ${new Date(shipment.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No ETA'}
                </p>
              </div>

              <div className="mt-auto border-t border-slate-100 pt-4 pl-1">
                {shipment.status === 'delivered' ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Proof of Delivery Uploaded
                  </div>
                ) : (
                  <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex justify-between px-5 group">
                    View Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
