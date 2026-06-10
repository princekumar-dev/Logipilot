'use client';

import { useState } from 'react';
import { Home, Package, Map, Bell, Truck, LayoutDashboard, BarChart3, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function BottomNav() {
  const pathname = usePathname();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const isDriverContext = pathname === '/driver' || pathname.startsWith('/driver/');

  const driverItems = [
    { label: 'Home', icon: Home, href: '/driver' },
    { label: 'Deliveries', icon: Package, href: '/driver/deliveries' },
    { label: 'Map', icon: Map, href: '/driver/map' },
    { label: 'Alerts', icon: Bell, href: '/driver/alerts' },
  ];

  const managerItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Fleet', icon: Truck, href: '/fleet' },
    { label: 'Shipments', icon: Package, href: '/shipments' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  ];

  const handleSearch = () => {
    setIsSearchExpanded(false);
    toast.success("Searching drops...");
  };

  const navItems = isDriverContext ? driverItems : managerItems;

  return (
    <>
      <div className={`fixed bottom-0 h-[88px] z-50 pointer-events-none ${isDriverContext ? 'w-full max-w-[480px] left-1/2 -translate-x-1/2' : 'left-0 right-0 md:hidden'}`}>
        
        {/* Real Transparent Cutout Mask Layer */}
        <div 
          className={`absolute inset-0 bg-white pointer-events-auto ${isDriverContext ? 'border-x border-[#dddddd]' : ''}`}
          style={{
            boxShadow: '0 -8px 30px rgba(0,0,0,0.04)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 1px, transparent 33px, black 33.5px)',
            maskImage: 'radial-gradient(circle at 50% 1px, transparent 33px, black 33.5px)',
            filter: 'drop-shadow(0px -1px 0px #dddddd)'
          }}
        />

        <div className="relative w-full h-full px-6 pb-6 pt-3 flex justify-between items-center safe-area-bottom pointer-events-auto">
          {/* Render Nav Items */}
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/driver' && pathname.startsWith(item.href));
            
            return (
              <div key={item.label} className="flex items-center">
                <Link href={item.href} className="relative flex flex-col items-center justify-center gap-1 w-14 group">
                  <div className={`relative flex items-center justify-center w-10 h-10 transition-all duration-300 ${isActive ? 'text-[#ff385c]' : 'text-[#6a6a6a] hover:text-[#222222]'}`}>
                    <item.icon className="w-6 h-6 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-bold tracking-wide transition-colors ${isActive ? 'text-[#ff385c]' : 'text-[#6a6a6a]'}`}>
                    {item.label}
                  </span>
                </Link>
                {/* Insert spacer after the second item for both contexts */}
                {index === 1 && (
                  <div className="w-[60px]" />
                )}
              </div>
            );
          })}

          {/* Center FAB */}
          <div className="absolute left-1/2 top-[-24px] -translate-x-1/2 flex items-center justify-center">
            {/* The Floating Action Button */}
            <button 
              onClick={() => setIsSearchExpanded(true)} 
              className="relative w-[50px] h-[50px] bg-primary hover:bg-[#e00b3f] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(255,56,92,0.3)] transition-transform hover:scale-105 active:scale-95"
            >
              <Search className="w-5 h-5 text-white stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchExpanded && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/25 z-[100]" 
              onClick={() => setIsSearchExpanded(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95, x: "-50%" }} 
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }} 
              exit={{ opacity: 0, y: 20, scale: 0.95, x: "-50%" }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-[110px] left-1/2 w-[90%] max-w-[440px] bg-white rounded-[32px] shadow-2xl z-[110] flex items-center border border-[#dddddd] overflow-hidden font-sans"
            >
              <div className="flex flex-col w-full items-stretch py-2">
                <div className="flex-1 flex flex-col justify-center px-6 py-4 hover:bg-[#f7f7f7] cursor-pointer transition-colors relative group">
                  <span className="text-[12px] font-bold text-[#222222]">Route</span>
                  <input type="text" placeholder="Search drops or routes" className="bg-transparent border-none outline-none text-[14px] text-[#222222] placeholder:text-[#6a6a6a] w-full" autoFocus />
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-[#dddddd]"></div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-6 py-4 hover:bg-[#f7f7f7] cursor-pointer transition-colors relative group">
                  <span className="text-[12px] font-bold text-[#222222]">Date</span>
                  <input type="text" placeholder="Add dates" className="bg-transparent border-none outline-none text-[14px] text-[#222222] placeholder:text-[#6a6a6a] w-full" />
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-[#dddddd]"></div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-6 py-4 hover:bg-[#f7f7f7] cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <span className="text-[12px] font-bold text-[#222222] block">Cargo</span>
                      <input type="text" placeholder="Add details" className="bg-transparent border-none outline-none text-[14px] text-[#222222] placeholder:text-[#6a6a6a] w-full" />
                    </div>
                    <button onClick={handleSearch} className="h-12 w-12 bg-primary hover:bg-[#e00b3f] text-white rounded-full flex items-center justify-center gap-2 font-bold transition-colors shrink-0">
                      <Search className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
