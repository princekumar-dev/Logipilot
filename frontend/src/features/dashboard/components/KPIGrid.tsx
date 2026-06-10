'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle, Truck, TrendingUp, TrendingDown } from 'lucide-react';

const kpis = [
  {
    title: 'Active Shipments',
    value: '1,248',
    icon: Package,
    trend: '+12.5%',
    trendUp: true,
  },
  {
    title: 'Delayed Shipments',
    value: '74',
    icon: AlertTriangle,
    trend: '+4.1%',
    trendUp: false,
  },
  {
    title: 'On-Time Rate',
    value: '93.4%',
    icon: CheckCircle,
    trend: '+0.2%',
    trendUp: true,
  },
  {
    title: 'Fleet Utilization',
    value: '87%',
    icon: Truck,
    trend: '-2.4%',
    trendUp: false,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function KPIGrid() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="rounded-[14px] bg-white border border-[#dddddd] shadow-sm p-6 h-[140px]">
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {kpis.map((kpi, idx) => (
        <motion.div 
          key={idx} 
          variants={item}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative bg-white border border-[#dddddd] rounded-[14px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer flex flex-col justify-between p-6 h-[140px]"
        >
          <div className="flex justify-between items-start">
            <span className="text-[14px] font-medium text-[#6a6a6a]">{kpi.title}</span>
            <kpi.icon className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
          </div>

          <div className="flex items-end justify-between">
            <div className="text-[28px] font-bold tracking-tight text-[#222222]">
              {kpi.value}
            </div>
            <div className={`flex items-center gap-1 text-[14px] font-medium ${kpi.trendUp ? 'text-[#008a05]' : 'text-[#c13515]'}`}>
              {kpi.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {kpi.trend}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
