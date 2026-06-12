'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navigation2, Clock, MapPin, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import shipmentService, { Shipment } from '@/services/shipment.service';
import driverService, { Driver } from '@/services/driver.service';

export default function DriverHomePage() {
  const user = useAuthStore((state) => state.user);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Driver';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      driverService.getMe(),
      shipmentService.getAll({ limit: 50 }),
    ])
      .then(([driverRes, shipmentRes]) => {
        if (!cancelled) { setDriver(driverRes); setShipments(shipmentRes.shipments); }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pathname]);

  const totalDrops = shipments.length;
  const completedDrops = shipments.filter(s => s.status === 'delivered').length;
  const nextShipment = shipments.find(s => s.status === 'in_transit' || s.status === 'pending');

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1 pt-2 transition-all duration-300">
        <h1 className="text-[28px] font-bold tracking-tight text-[#222222]">{greeting}, {firstName}</h1>
        <p className="text-[14px] text-[#6a6a6a]">Shift started at 08:00 AM</p>
      </div>

      <div className="grid grid-cols-2 gap-4 transition-all duration-300">
        <div className="bg-white p-5 rounded-[14px] border border-[#dddddd] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="mb-4"><Package className="w-6 h-6 text-[#222222]" /></div>
          {loading ? (
            <div className="h-9 w-12 rounded bg-[#f7f7f7] animate-pulse" />
          ) : (
            <span className="text-3xl font-bold text-[#222222]">{totalDrops}</span>
          )}
          <span className="text-[14px] text-[#6a6a6a] mt-1">Total Drops</span>
        </div>
        <div className="bg-white p-5 rounded-[14px] border border-[#dddddd] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="mb-4"><CheckCircle2 className="w-6 h-6 text-[#222222]" /></div>
          {loading ? (
            <div className="h-9 w-12 rounded bg-[#f7f7f7] animate-pulse" />
          ) : (
            <span className="text-3xl font-bold text-[#222222]">{completedDrops}</span>
          )}
          <span className="text-[14px] text-[#6a6a6a] mt-1">Completed</span>
        </div>
      </div>

      <div className="bg-white rounded-[14px] p-6 border border-[#dddddd] shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden transition-all duration-300">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[12px] font-bold text-[#222222] bg-[#f7f7f7] px-3 py-1.5 rounded-full border border-[#dddddd]">Next Stop</span>
            <span className="text-[14px] text-[#222222] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#6a6a6a]" />
              {loading ? (
                <div className="h-4 w-16 rounded bg-[#f7f7f7] animate-pulse" />
              ) : nextShipment?.eta ? (
                `${new Date(nextShipment.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ETA`
              ) : 'No active shipment'}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-7 w-48 rounded bg-[#f7f7f7] animate-pulse" />
              <div className="h-4 w-64 rounded bg-[#f7f7f7] animate-pulse" />
            </div>
          ) : nextShipment ? (
            <>
              <h3 className="text-[22px] font-bold text-[#222222] leading-tight mb-2">{nextShipment.trackingNumber}</h3>
              <p className="text-[14px] text-[#6a6a6a] flex items-center gap-2 mb-8">
                <MapPin className="w-4 h-4 text-[#222222]" />
                {nextShipment.destinationAddress || 'No destination set'}
              </p>
            </>
          ) : (
            <p className="text-[14px] text-[#6a6a6a] mb-8">No active shipments assigned</p>
          )}

          <Link href="/driver/map" className="w-full block">
            <Button className="w-full h-12 rounded-[8px] bg-[#ff385c] hover:bg-[#e00b41] text-white font-medium text-[16px] flex items-center justify-center gap-2 group">
              <Navigation2 className="w-5 h-5 group-hover:animate-bounce" />
              Start Navigation
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[14px] p-5 border border-[#dddddd] shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden flex items-start gap-4 transition-all duration-300">
        <div className="w-12 h-12 rounded-[14px] bg-[#f7f7f7] flex flex-shrink-0 items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-[#222222]" />
        </div>
        <div>
          <h4 className="font-bold text-[16px] text-[#222222] mb-1">Heavy Rain Expected</h4>
          <p className="text-[14px] text-[#6a6a6a] mb-3">Traffic congestion on current route. AI recommends alternate path.</p>
          <button className="text-[#222222] font-medium text-[14px] underline hover:no-underline">
            View Alternate
          </button>
        </div>
      </div>
    </div>
  );
}
