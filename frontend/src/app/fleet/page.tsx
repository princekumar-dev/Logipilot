'use client';

import { motion, Variants } from 'framer-motion';
import { Truck, MapPin, AlertCircle, Fuel, ShieldCheck } from "lucide-react";
import { MapWrapper } from '@/features/dashboard/components/MapWrapper';

const fleet = [
  { id: 'TN-01-AB-1234', type: 'Heavy Duty Truck', status: 'Active', driver: 'Arun K.', fuel: '78%', location: 'NH-48, Vellore' },
  { id: 'MH-12-CD-5678', type: 'Refrigerated Van', status: 'Maintenance', driver: 'Unassigned', fuel: '45%', location: 'Pune Depot' },
  { id: 'KA-03-EF-9012', type: 'Light Commercial', status: 'Active', driver: 'Manoj V.', fuel: '92%', location: 'Bangalore City' },
  { id: 'DL-04-GH-3456', type: 'Heavy Duty Truck', status: 'Idle', driver: 'Rahul M.', fuel: '100%', location: 'Delhi Hub' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function FleetPage() {
  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#dddddd]">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#222222]">
              Fleet Command
            </h1>
            <p className="text-[16px] text-[#6a6a6a] mt-1">Monitor vehicle status, maintenance, and live telematics.</p>
          </div>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px]">
            <div className="relative p-6 flex flex-col h-full z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[14px] font-medium text-[#6a6a6a]">Active Vehicles</span>
                <Truck className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col mt-auto">
                <div className="text-[32px] font-bold tracking-tight text-[#222222]">142</div>
                <p className="text-[14px] font-bold text-[#008a05] mt-1">87% Utilization</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px]">
            <div className="relative p-6 flex flex-col h-full z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[14px] font-medium text-[#6a6a6a]">Maintenance Alerts</span>
                <AlertCircle className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col mt-auto">
                <div className="text-[32px] font-bold tracking-tight text-[#222222]">12</div>
                <p className="text-[14px] font-bold text-[#c13515] mt-1">3 scheduled this week</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px]">
            <div className="relative p-6 flex flex-col h-full z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[14px] font-medium text-[#6a6a6a]">Safety Score</span>
                <ShieldCheck className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col mt-auto">
                <div className="text-[32px] font-bold tracking-tight text-[#222222]">94/100</div>
                <p className="text-[14px] font-bold text-[#008a05] mt-1">+2 points from last month</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Map View */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 relative overflow-hidden flex flex-col items-center justify-center">
            <MapWrapper />
          </motion.div>

          {/* Vehicle List */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1 bg-white border border-[#dddddd] rounded-[14px] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#dddddd] bg-white">
              <h3 className="font-bold text-[18px] text-[#222222]">Vehicle Roster</h3>
            </div>
            <div className="overflow-y-auto p-4 space-y-4 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {fleet.map((vehicle, i) => (
                <motion.div 
                  key={vehicle.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="bg-white border border-[#dddddd] rounded-[14px] p-4 hover:border-[#222222] transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-[#222222]">{vehicle.id}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wide ${vehicle.status === 'Active' ? 'bg-[#fff8f6] text-[#008a05]' : vehicle.status === 'Idle' ? 'bg-[#f7f7f7] text-[#6a6a6a]' : 'bg-[#fff8f6] text-[#c13515]'}`}>
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="text-[12px] font-medium text-[#222222] mb-4 bg-[#f7f7f7] w-fit px-2 py-1 rounded-[6px]">{vehicle.type}</div>
                  <div className="grid grid-cols-2 gap-2 text-[12px] font-medium">
                    <div className="flex items-center gap-1.5 text-[#6a6a6a]">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                      <span className="truncate">{vehicle.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end text-[#6a6a6a]">
                      <Fuel className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{vehicle.fuel}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
