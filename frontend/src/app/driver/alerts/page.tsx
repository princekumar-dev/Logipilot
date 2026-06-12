'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AlertTriangle, CloudRain, Package, ShieldAlert } from 'lucide-react';
import shipmentService, { Shipment } from '@/services/shipment.service';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-[#f7f7f7] animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-36 rounded bg-[#f7f7f7] animate-pulse" />
        <div className="h-3 w-full rounded bg-[#f7f7f7] animate-pulse" />
        <div className="flex gap-2">
          <div className="h-4 w-14 rounded bg-[#f7f7f7] animate-pulse" />
          <div className="h-4 w-16 rounded bg-[#f7f7f7] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

interface AlertItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: string;
  severity: string;
  icon: typeof CloudRain;
  color: string;
  bg: string;
  border: string;
}

function buildAlertsFromShipments(shipments: Shipment[]): AlertItem[] {
  const alerts: AlertItem[] = [];

  const delayed = shipments.filter(s => s.status === 'delayed');
  delayed.forEach(s => {
    alerts.push({
      id: s._id + '-delayed',
      title: `Shipment ${s.trackingNumber} Delayed`,
      desc: `Shipment to ${s.destinationAddress || 'unknown destination'} is delayed.${s.predictedDelay ? ` Expected delay: ${s.predictedDelay} minutes.` : ''}`,
      time: s.updatedAt ? new Date(s.updatedAt).toLocaleString() : 'Recently',
      type: 'SHIPMENT',
      severity: 'HIGH',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    });
  });

  const highRisk = shipments.filter(s => s.riskScore && s.riskScore > 70 && s.status !== 'delivered' && s.status !== 'cancelled');
  highRisk.forEach(s => {
    alerts.push({
      id: s._id + '-risk',
      title: `High Risk: ${s.trackingNumber}`,
      desc: `Risk score ${s.riskScore}/100 for shipment to ${s.destinationAddress || 'destination'}. Consider proactive rerouting.`,
      time: s.updatedAt ? new Date(s.updatedAt).toLocaleString() : 'Recently',
      type: 'RISK',
      severity: s.riskScore! > 85 ? 'CRITICAL' : 'MEDIUM',
      icon: ShieldAlert,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    });
  });

  const pending = shipments.filter(s => s.status === 'pending');
  if (pending.length > 0) {
    alerts.push({
      id: 'pending-assignments',
      title: `${pending.length} Pending Assignment${pending.length > 1 ? 's' : ''}`,
      desc: `You have ${pending.length} shipment${pending.length > 1 ? 's' : ''} waiting for dispatch. Check your delivery queue.`,
      time: 'Now',
      type: 'SYSTEM',
      severity: 'LOW',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    });
  }

  return alerts;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    shipmentService.getAll({ limit: 50 })
      .then((res) => { if (!cancelled) setAlerts(buildAlertsFromShipments(res.shipments)); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pathname]);

  const newCount = alerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL').length;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-6 py-4 border-b border-slate-100 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Alerts
          {!loading && newCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">{newCount} NEW</span>
          )}
        </h1>
        <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
          Mark All Read
        </button>
      </div>

      <div className="p-6 space-y-4 pb-32">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No alerts at this time</div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-3xl p-5 border ${alert.border} shadow-sm relative overflow-hidden flex items-start gap-4 transition-all duration-300`}
            >
              {(alert.severity === 'HIGH' || alert.severity === 'CRITICAL') && (
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${alert.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'}`} />
              )}

              <div className={`w-12 h-12 rounded-2xl ${alert.bg} border ${alert.border} flex flex-shrink-0 items-center justify-center shadow-sm`}>
                <alert.icon className={`w-6 h-6 ${alert.color}`} />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-sm text-slate-900 leading-tight">{alert.title}</h4>
                  <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap ml-2">{alert.time}</span>
                </div>
                <p className="text-xs font-medium text-slate-500 mb-3 leading-relaxed">
                  {alert.desc}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md ${alert.bg} ${alert.color} border ${alert.border}`}>
                    {alert.type}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                    Sev: {alert.severity}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
