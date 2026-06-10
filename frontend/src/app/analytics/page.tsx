'use client';

import { motion, Variants } from 'framer-motion';
import { LineChart, BarChart2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function AnalyticsPage() {
  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto text-[#222222]">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#dddddd]">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#222222]">
              Analytics & Reports
            </h1>
            <p className="text-[16px] text-[#6a6a6a] mt-1">Deep insights, historical data, and performance metrics.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none border border-[#dddddd] text-[#222222] font-bold text-[14px] px-4 py-2 rounded-[8px] hover:bg-[#f7f7f7] transition-colors">Last 7 Days</button>
            <button className="flex-1 sm:flex-none border border-[#222222] bg-white text-[#222222] font-bold text-[14px] px-4 py-2 rounded-[8px] hover:bg-[#f7f7f7] transition-colors">This Month</button>
          </div>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px]">
            <div className="relative p-6 flex flex-col h-full z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[14px] font-medium text-[#6a6a6a]">On-Time Delivery</span>
                <LineChart className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col mt-auto">
                <div className="text-[32px] font-bold tracking-tight text-[#222222]">93.4%</div>
                <p className="flex items-center gap-1.5 text-[14px] font-bold text-[#008a05] mt-1"><TrendingUp className="w-3.5 h-3.5" strokeWidth={2} /> +2.1% from last week</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px]">
            <div className="relative p-6 flex flex-col h-full z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[14px] font-medium text-[#6a6a6a]">Avg Delay Duration</span>
                <BarChart2 className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col mt-auto">
                <div className="text-[32px] font-bold tracking-tight text-[#222222]">1h 45m</div>
                <p className="flex items-center gap-1.5 text-[14px] font-bold text-[#008a05] mt-1"><TrendingDown className="w-3.5 h-3.5" strokeWidth={2} /> -15m from last week</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px]">
            <div className="relative p-6 flex flex-col h-full z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[14px] font-medium text-[#6a6a6a]">Fuel Efficiency Savings</span>
                <DollarSign className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col mt-auto">
                <div className="text-[32px] font-bold tracking-tight text-[#222222]">$12,450</div>
                <p className="flex items-center gap-1.5 text-[14px] font-bold text-[#008a05] mt-1"><TrendingUp className="w-3.5 h-3.5" strokeWidth={2} /> +$800 this month</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white border border-[#dddddd] rounded-[14px] h-96 flex flex-col relative overflow-hidden group hover:border-[#222222] transition-colors">
            <div className="p-6 border-b border-[#dddddd] bg-white relative z-10">
              <h3 className="font-bold text-[18px] text-[#222222]">Shipment Volume Trend</h3>
              <p className="text-[14px] text-[#6a6a6a] mt-1">Daily completed shipments over 30 days</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-[#6a6a6a] gap-3 relative z-10 bg-[#f7f7f7]">
              <div className="w-16 h-16 rounded-full bg-white border border-[#dddddd] flex items-center justify-center">
                <LineChart className="w-6 h-6 text-[#222222]" strokeWidth={1.5} />
              </div>
              <span className="font-bold text-[14px]">Recharts LineChart Placeholder</span>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white border border-[#dddddd] rounded-[14px] h-96 flex flex-col relative overflow-hidden group hover:border-[#222222] transition-colors">
            <div className="p-6 border-b border-[#dddddd] bg-white relative z-10">
              <h3 className="font-bold text-[18px] text-[#222222]">Delay Root Causes</h3>
              <p className="text-[14px] text-[#6a6a6a] mt-1">Categorized by occurrence frequency</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-[#6a6a6a] gap-3 relative z-10 bg-[#f7f7f7]">
              <div className="w-16 h-16 rounded-full bg-white border border-[#dddddd] flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-[#222222]" strokeWidth={1.5} />
              </div>
              <span className="font-bold text-[14px]">Recharts BarChart Placeholder</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
