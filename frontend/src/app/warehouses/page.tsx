'use client';

import { motion, Variants } from 'framer-motion';
import { Building2, PackageCheck, PackageMinus, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const warehouses = [
  { id: 'WH-BLR', name: 'Bangalore Central Hub', location: 'Peenya, Bangalore', capacity: 85, incoming: 1240, outgoing: 1100, status: 'Normal' },
  { id: 'WH-BOM', name: 'Mumbai Docks Facility', location: 'Nhava Sheva, Mumbai', capacity: 96, incoming: 3100, outgoing: 2850, status: 'Critical' },
  { id: 'WH-DEL', name: 'Delhi NCR Depot', location: 'Gurugram, Haryana', capacity: 62, incoming: 850, outgoing: 920, status: 'Normal' },
  { id: 'WH-MAA', name: 'Chennai Port Storage', location: 'Chennai Port Trust', capacity: 78, incoming: 1450, outgoing: 1200, status: 'Warning' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function WarehousesPage() {
  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto text-[#222222]">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#dddddd]">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#222222]">
              Warehouse Operations
            </h1>
            <p className="text-[16px] text-[#6a6a6a] mt-1">Inventory capacity, throughput, and facility management.</p>
          </div>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warehouses.map((wh) => (
            <motion.div 
              key={wh.id}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative overflow-hidden bg-white border border-[#dddddd] rounded-[14px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[18px] font-bold tracking-tight text-[#222222] group-hover:underline decoration-2">{wh.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[14px] font-medium text-[#6a6a6a]">
                    <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                    {wh.location}
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wide
                  ${wh.status === 'Critical' ? 'bg-[#fff8f6] text-[#c13515]' : 
                    wh.status === 'Warning' ? 'bg-[#fff8eb] text-[#b25a00]' : 
                    'bg-[#e2fad6] text-[#008a05]'}`}
                >
                  {wh.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[12px]">
                  <span className="font-bold text-[#6a6a6a] uppercase tracking-wide">Total Capacity</span>
                  <span className={`font-bold ${wh.capacity >= 90 ? 'text-[#c13515]' : wh.capacity >= 75 ? 'text-[#b25a00]' : 'text-[#008a05]'}`}>{wh.capacity}%</span>
                </div>
                <Progress 
                  value={wh.capacity} 
                  className={`h-2.5 bg-[#f7f7f7] 
                    ${wh.capacity >= 90 ? '[&>div]:bg-primary' : 
                      wh.capacity >= 75 ? '[&>div]:bg-[#f2a600]' : 
                      '[&>div]:bg-[#008a05]'}`
                  } 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#dddddd]">
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#6a6a6a] uppercase tracking-wide mb-1">
                    <PackageCheck className="w-4 h-4 text-[#008a05]" strokeWidth={2} /> Incoming
                  </span>
                  <span className="text-[24px] font-bold tracking-tight text-[#222222]">{wh.incoming.toLocaleString()}</span>
                </div>
                <div className="flex flex-col border-l border-[#dddddd] pl-4">
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#6a6a6a] uppercase tracking-wide mb-1">
                    <PackageMinus className="w-4 h-4 text-[#f2a600]" strokeWidth={2} /> Outgoing
                  </span>
                  <span className="text-[24px] font-bold tracking-tight text-[#222222]">{wh.outgoing.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
