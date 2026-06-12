'use client';

import { useState, useEffect, useRef } from 'react';
import { Users, Search, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import driverService, { Driver } from '@/services/driver.service';

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

function SkeletonRow() {
  return (
    <TableRow className="border-b border-[#dddddd] h-16">
      <TableCell className="pl-5"><div className="h-4 w-28 rounded bg-[#f7f7f7] animate-pulse" /></TableCell>
      <TableCell><div className="h-4 w-24 rounded bg-[#f7f7f7] animate-pulse" /></TableCell>
      <TableCell><div className="h-4 w-16 rounded bg-[#f7f7f7] animate-pulse" /></TableCell>
      <TableCell><div className="h-4 w-20 rounded bg-[#f7f7f7] animate-pulse" /></TableCell>
      <TableCell><div className="h-4 w-12 rounded bg-[#f7f7f7] animate-pulse" /></TableCell>
      <TableCell><div className="h-5 w-14 rounded bg-[#f7f7f7] animate-pulse" /></TableCell>
    </TableRow>
  );
}

const getStatusStyle = (status: string) => {
  if (status === 'active') return 'bg-[#e2fad6] text-[#008a05]';
  if (status === 'on_leave') return 'bg-[#fff8eb] text-[#b25a00]';
  return 'bg-[#f7f7f7] text-[#6a6a6a]';
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    driverService.getAll({ limit: 50 })
      .then((res) => {
        if (!cancelled) {
          setDrivers(res.drivers);
          setTotal(res.total);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const activeCount = drivers.filter(d => d.status === 'active').length;
  const onLeaveCount = drivers.filter(d => d.status === 'on_leave').length;

  const totalAnim = useCountUp(total, 600, !loading);
  const activeAnim = useCountUp(activeCount, 600, !loading);
  const leaveAnim = useCountUp(onLeaveCount, 600, !loading);

  const kpiCards = [
    { title: 'Total Drivers', value: totalAnim, trend: 'Registered drivers', trendColor: 'text-[#222222]', iconColor: 'text-[#222222]' },
    { title: 'Active Drivers', value: activeAnim, trend: 'On shift right now', trendColor: 'text-[#008a05]', iconColor: 'text-[#008a05]' },
    { title: 'On Leave', value: leaveAnim, trend: 'Currently unavailable', trendColor: 'text-[#b25a00]', iconColor: 'text-[#b25a00]' },
  ];

  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#dddddd] transition-all duration-300">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#222222]">
              Driver Operations
            </h1>
            <p className="text-[16px] text-[#6a6a6a] mt-1">Driver schedules, performance, and compliance tracking.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
          {kpiCards.map((kpi, idx) => (
            <div key={idx} className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px] hover:-translate-y-1">
              <div className="relative p-6 flex flex-col h-full z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[14px] font-medium text-[#6a6a6a]">{kpi.title}</span>
                  <Users className={`h-5 w-5 ${kpi.iconColor}`} strokeWidth={1.5} />
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

        <div className="bg-white border border-[#dddddd] rounded-[14px] overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-4 border-b border-[#dddddd] bg-white flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#222222]" strokeWidth={2} />
              <input placeholder="Search drivers by name..." className="w-full pl-10 pr-4 py-3 bg-white border border-[#dddddd] rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent placeholder-[#6a6a6a]" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-white border-b border-[#dddddd]">
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a] pl-5">Driver</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a]">Contact</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a]">Experience</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a]">Rating</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a]">On-Time Rate</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[#6a6a6a]">No drivers found</TableCell>
                </TableRow>
              ) : (
                drivers.map((driver) => (
                  <TableRow key={driver._id} className="hover:bg-[#f7f7f7] border-b border-[#dddddd] transition-colors cursor-pointer h-16">
                    <TableCell className="pl-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-[14px] text-[#222222]">{driver.name}</span>
                        <span className="text-[12px] font-medium text-[#6a6a6a]">{driver.licenseNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-[#222222]">{driver.phone}</span>
                        <span className="text-[12px] text-[#6a6a6a]">{driver.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[14px] font-bold text-[#222222]">{driver.yearsExperience} years</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 w-[120px]">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="font-bold text-[#222222]">{driver.rating.toFixed(1)}/5.0</span>
                        </div>
                        <Progress value={(driver.rating / 5) * 100} className={`h-1.5 ${driver.rating < 3 ? 'bg-[#ffe8b3] [&>div]:bg-[#f2a600]' : 'bg-[#e2fad6] [&>div]:bg-[#008a05]'}`} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[14px] font-bold text-[#222222]">{(driver.onTimeRate * 100).toFixed(0)}%</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(driver.status)}`}>
                        {driver.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
