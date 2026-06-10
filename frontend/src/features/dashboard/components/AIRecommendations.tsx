'use client';

import { motion, Variants } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const recommendations = [
  {
    title: 'Heavy Traffic Detected',
    desc: 'Reroute Shipment LP100045 via Ring Road.',
    impact: 'Saves 32 mins',
    priority: 'HIGH',
  },
  {
    title: 'Warehouse Congestion',
    desc: 'Delay dispatch of Fleet B by 45 mins.',
    impact: 'Avoids bottleneck',
    priority: 'MED',
  }
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function AIRecommendations() {
  return (
    <div className="rounded-[14px] border border-[#dddddd] h-full relative overflow-hidden bg-white flex flex-col">
      <div className="px-6 py-5 border-b border-[#dddddd] bg-white relative z-10 flex items-center justify-between">
        <h2 className="text-base font-bold flex items-center gap-2.5 text-[#222222] tracking-tight">
          <div className="p-1.5 rounded-lg text-[#222222]">
            <Bot className="w-5 h-5" strokeWidth={2} />
          </div>
          AI Intelligence
        </h2>
        <div className="flex items-center gap-2 border border-[#dddddd] bg-[#f7f7f7] px-3 py-1.5 rounded-full">
           <span className="w-2 h-2 bg-[#008a05] rounded-full animate-pulse" />
           <span className="text-[12px] font-bold text-[#222222]">Active</span>
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto relative z-10 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {recommendations.map((rec, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="group bg-white border border-[#dddddd] rounded-[14px] p-5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all cursor-pointer relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-current opacity-100 transition-opacity" style={{ color: rec.priority === 'HIGH' ? '#ff385c' : '#222222' }} />
              
              <div className="flex justify-between items-start mb-2 pl-2">
                <h4 className="font-bold text-[14px] text-[#222222]">
                  {rec.title}
                </h4>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-[6px] uppercase tracking-wide ${rec.priority === 'HIGH' ? 'text-[#c13515] bg-[#fff8f6]' : 'text-[#222222] bg-[#f7f7f7]'}`}>
                  {rec.priority}
                </span>
              </div>
              
              <p className="text-[14px] font-normal text-[#6a6a6a] mb-5 pl-2 leading-relaxed">
                {rec.desc}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-[#dddddd] pl-2 mt-auto">
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#008a05]">
                  <Zap className="w-4 h-4 fill-current" />
                  {rec.impact}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toast.success(`Action Applied`, { description: `Fix for "${rec.title}" is being processed.` })}
                  className="h-8 px-4 text-[14px] font-bold text-[#222222] hover:bg-[#f7f7f7] rounded-[8px] group-hover:bg-primary group-hover:text-white transition-all border border-transparent group-hover:border-primary"
                >
                  Apply Fix
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
