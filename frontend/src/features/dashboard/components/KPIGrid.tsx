'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { Package, AlertTriangle, CheckCircle, Truck, TrendingUp, TrendingDown } from 'lucide-react';
import analyticsService, { DashboardStats } from '@/services/analytics.service';

function useCountUp(target: number, duration = 600, enabled = true) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setValue(0);
      return;
    }
    fromRef.current = value;
    startRef.current = 0;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, enabled]);

  return value;
}

export const KPIGrid = memo(function KPIGrid() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    analyticsService.getDashboardStats()
      .then((s) => { if (!cancelled) setStats(s); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const activeShipments = useCountUp(stats?.activeShipments ?? 0, 600, !loading);
  const delayedShipments = useCountUp(stats?.delayedShipments ?? 0, 600, !loading);
  const onTimeRate = useCountUp(stats?.onTimeRate ?? 0, 600, !loading);
  const fleetUtilization = useCountUp(stats?.fleetUtilization ?? 0, 600, !loading);
  const inTransit = stats?.inTransitShipments ?? 0;
  const totalShipments = stats?.totalShipments ?? 0;
  const activeVehicles = stats?.activeVehicles ?? 0;
  const totalVehicles = stats?.totalVehicles ?? 0;

  const kpis = [
    {
      title: 'Active Shipments',
      value: loading ? null : activeShipments,
      icon: Package,
      trend: `${inTransit} in transit`,
      trendUp: true,
    },
    {
      title: 'Delayed Shipments',
      value: loading ? null : delayedShipments,
      icon: AlertTriangle,
      trend: delayedShipments > 0 ? `${totalShipments > 0 ? Math.round((delayedShipments / totalShipments) * 100) : 0}% of total` : 'None',
      trendUp: delayedShipments === 0,
    },
    {
      title: 'On-Time Rate',
      value: loading ? null : onTimeRate,
      suffix: '%',
      icon: CheckCircle,
      trend: onTimeRate >= 90 ? 'Good' : 'Needs improvement',
      trendUp: onTimeRate >= 90,
    },
    {
      title: 'Fleet Utilization',
      value: loading ? null : fleetUtilization,
      suffix: '%',
      icon: Truck,
      trend: `${activeVehicles}/${totalVehicles} vehicles`,
      trendUp: fleetUtilization >= 70,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="relative bg-white border border-[#dddddd] rounded-[14px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer flex flex-col justify-between p-6 h-[140px]"
        >
          <div className="flex justify-between items-start">
            <span className="text-[14px] font-medium text-[#6a6a6a]">{kpi.title}</span>
            <kpi.icon className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
          </div>

          <div className="flex items-end justify-between">
            <div className="text-[28px] font-bold tracking-tight text-[#222222]">
              {loading ? (
                <div className="h-8 w-16 rounded bg-[#f7f7f7] animate-pulse" />
              ) : (
                <span className="transition-opacity duration-300 opacity-100">
                  {kpi.value?.toLocaleString() ?? '0'}{kpi.suffix ?? ''}
                </span>
              )}
            </div>
            {!loading && (
              <div className={`flex items-center gap-1 text-[14px] font-medium transition-opacity duration-500 opacity-100 ${kpi.trendUp ? 'text-[#008a05]' : 'text-[#c13515]'}`}>
                {kpi.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {kpi.trend}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});
