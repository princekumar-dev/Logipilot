'use client';

import { motion } from 'framer-motion';
import { User, ShieldCheck, Map, Truck, LogOut, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'Driver Name';
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'D';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-100 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Profile</h1>
        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="p-6 space-y-6 pb-32">
        {/* Driver Info Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg relative">
            <span className="text-2xl font-black text-blue-600">{initials}</span>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <h2 className="text-xl font-black text-slate-900">{userName}</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Senior Logistics Pilot</p>
          
          <div className="flex gap-2 mt-4">
            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border border-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> CDL-A
            </span>
            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border border-slate-200 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" /> Fleet B
            </span>
          </div>
        </motion.div>

        {/* Performance Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 flex flex-col">
            <span className="text-3xl font-black text-emerald-700">98%</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">On-Time Rate</span>
          </div>
          <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 flex flex-col">
            <span className="text-3xl font-black text-blue-700">4.9</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Driver Rating</span>
          </div>
        </motion.div>

        {/* Status Toggle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Status</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-emerald-500 text-white rounded-xl py-3 text-xs font-bold shadow-md">Active / Driving</button>
            <button className="bg-slate-100 text-slate-600 rounded-xl py-3 text-xs font-bold hover:bg-slate-200 transition-colors">On Break</button>
          </div>
        </motion.div>

        {/* Emergency SOS */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center justify-center gap-2">
            <PhoneCall className="w-5 h-5" />
            Emergency Assistance SOS
          </Button>
        </motion.div>

        {/* Settings / Logout */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col gap-2 pt-4 border-t border-slate-200">
          <Button variant="ghost" className="w-full justify-start h-12 text-slate-600 font-bold">App Settings</Button>
          <Button variant="ghost" className="w-full justify-start h-12 text-slate-600 font-bold">Vehicle Breakdown Report</Button>
          <Button variant="ghost" className="w-full justify-start h-12 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold mt-2">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
