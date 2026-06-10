'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CloudRain, Bell, ShieldAlert, Package } from 'lucide-react';

const alerts = [
  {
    id: 1,
    title: 'Severe Weather Warning',
    desc: 'Heavy rain expected on Route 4. Reduce speed by 15% and increase following distance.',
    time: '10 mins ago',
    type: 'WEATHER',
    severity: 'HIGH',
    icon: CloudRain,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  {
    id: 2,
    title: 'Traffic Congestion',
    desc: 'Accident reported 5 miles ahead on I-95 North. AI is calculating alternate routes.',
    time: '25 mins ago',
    type: 'TRAFFIC',
    severity: 'CRITICAL',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200'
  },
  {
    id: 3,
    title: 'New Assignment Added',
    desc: 'A high-priority medical supply drop has been added to your queue for Acme Labs.',
    time: '1 hour ago',
    type: 'SYSTEM',
    severity: 'LOW',
    icon: Package,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  {
    id: 4,
    title: 'Mandatory Break Approaching',
    desc: 'You have been driving for 3.5 hours. Please take a mandatory 15-minute break soon.',
    time: '2 hours ago',
    type: 'COMPLIANCE',
    severity: 'MEDIUM',
    icon: ShieldAlert,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  }
];

export default function AlertsPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-100 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Alerts
          <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">2 NEW</span>
        </h1>
        <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
          Mark All Read
        </button>
      </div>

      {/* Alerts List */}
      <div className="p-6 space-y-4 pb-32">
        {alerts.map((alert, i) => (
          <motion.div 
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-white rounded-3xl p-5 border ${alert.border} shadow-sm relative overflow-hidden flex items-start gap-4`}
          >
            {/* Left Color Bar for High/Critical */}
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
          </motion.div>
        ))}
      </div>
    </div>
  );
}
