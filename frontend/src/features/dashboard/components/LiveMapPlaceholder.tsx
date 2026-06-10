'use client';

import { motion } from 'framer-motion';
import { Maximize, Layers, MapPin, Navigation2, Crosshair } from 'lucide-react';

export function LiveMapPlaceholder() {
  return (
    <div className="relative w-full h-full bg-[#f7f7f7] rounded-[14px] overflow-hidden border border-[#dddddd] group flex items-center justify-center">
      {/* Light Map Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#dddddd_1px,transparent_1px),linear-gradient(to_bottom,#dddddd_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      
      {/* Center Radar / Marker (Airbnb style Rausch Pin) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          {/* Pulsing rings in Rausch color */}
          <motion.div animate={{ scale: [1, 2, 2.5], opacity: [0.5, 0, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 rounded-full border border-primary" />
          
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center relative shadow-[0_2px_4px_rgba(0,0,0,0.18)]">
             <MapPin className="w-6 h-6 text-white" />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex flex-col items-center"
        >
          <div className="bg-white border border-[#dddddd] px-4 py-2 rounded-full text-center shadow-[0_2px_4px_rgba(0,0,0,0.18)]">
            <span className="text-[#222222] font-bold text-[14px] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live routing
            </span>
          </div>
        </motion.div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
        <button className="w-10 h-10 rounded-[8px] bg-white border border-[#dddddd] text-[#222222] shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-[#f7f7f7] transition-all flex items-center justify-center">
          <Layers className="h-4 w-4" strokeWidth={2} />
        </button>
        <button className="w-10 h-10 rounded-[8px] bg-white border border-[#dddddd] text-[#222222] shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-[#f7f7f7] transition-all flex items-center justify-center">
          <Crosshair className="h-4 w-4" strokeWidth={2} />
        </button>
        <button className="w-10 h-10 rounded-[8px] bg-white border border-[#dddddd] text-[#222222] shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-[#f7f7f7] transition-all flex items-center justify-center">
          <Maximize className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Telemetry Footer */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20">
        <div className="flex gap-2">
          <div className="bg-white border border-[#dddddd] px-3 py-1.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.18)] flex items-center gap-2">
            <Navigation2 className="w-3.5 h-3.5 text-[#222222]" strokeWidth={2} />
            <span className="text-[12px] font-bold text-[#222222]">12.9716° N</span>
          </div>
          <div className="bg-white border border-[#dddddd] px-3 py-1.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.18)] flex items-center gap-2">
            <Navigation2 className="w-3.5 h-3.5 text-[#222222] rotate-90" strokeWidth={2} />
            <span className="text-[12px] font-bold text-[#222222]">77.5946° E</span>
          </div>
        </div>
        
        <div className="bg-white border border-[#dddddd] px-3 py-1.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.18)] flex items-center gap-2">
          <span className="text-[12px] font-bold text-[#222222]">Zoom 12x</span>
        </div>
      </div>
    </div>
  );
}
