'use client';

import { motion } from 'framer-motion';
import { Navigation2, Clock, MapPin, Package, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function DriverHomePage() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Driver';

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1 pt-2">
        <h1 className="text-[28px] font-bold tracking-tight text-[#222222]">Good Morning, {firstName}</h1>
        <p className="text-[14px] text-[#6a6a6a]">Shift started at 08:00 AM</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[14px] border border-[#dddddd] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="mb-4">
            <Package className="w-6 h-6 text-[#222222]" />
          </div>
          <span className="text-3xl font-bold text-[#222222]">12</span>
          <span className="text-[14px] text-[#6a6a6a] mt-1">Total Drops</span>
        </div>
        <div className="bg-white p-5 rounded-[14px] border border-[#dddddd] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col">
          <div className="mb-4">
            <CheckCircle2 className="w-6 h-6 text-[#222222]" />
          </div>
          <span className="text-3xl font-bold text-[#222222]">5</span>
          <span className="text-[14px] text-[#6a6a6a] mt-1">Completed</span>
        </div>
      </motion.div>

      {/* Current Assignment */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[14px] p-6 border border-[#dddddd] shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[12px] font-bold text-[#222222] bg-[#f7f7f7] px-3 py-1.5 rounded-full border border-[#dddddd]">Next Stop</span>
            <span className="text-[14px] text-[#222222] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#6a6a6a]" />
              14:30 ETA
            </span>
          </div>

          <h3 className="text-[22px] font-bold text-[#222222] leading-tight mb-2">Acme Corp Logistics Hub</h3>
          <p className="text-[14px] text-[#6a6a6a] flex items-center gap-2 mb-8">
            <MapPin className="w-4 h-4 text-[#222222]" />
            124 Industrial Pkwy, Sector 4
          </p>

          <Link href="/driver/map" className="w-full block">
            <Button className="w-full h-12 rounded-[8px] bg-[#ff385c] hover:bg-[#e00b41] text-white font-medium text-[16px] flex items-center justify-center gap-2 group">
              <Navigation2 className="w-5 h-5 group-hover:animate-bounce" />
              Start Navigation
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* AI Alerts */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-[14px] p-5 border border-[#dddddd] shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden flex items-start gap-4">
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
      </motion.div>
    </div>
  );
}
