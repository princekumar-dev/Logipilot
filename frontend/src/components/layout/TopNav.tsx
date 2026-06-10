'use client';

import { useState } from 'react';
import { Bell, Search, Globe, Menu, UserCircle2, MapPin, Calendar, Package, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function TopNav() {
  const pathname = usePathname();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const navLinks = [
    { label: 'Dashboard', href: '/' },
    { label: 'Fleet', href: '/fleet' },
    { label: 'Drivers', href: '/drivers' },
    { label: 'Shipments', href: '/shipments' },
    { label: 'Warehouses', href: '/warehouses' },
    { label: 'Analytics', href: '/analytics' },
  ];

  const handleSearch = () => {
    setIsSearchExpanded(false);
    toast.success("Searching available routes...");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-[80px] border-b border-border bg-background flex items-center justify-between px-4 lg:px-10">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-primary shrink-0 mr-4">
          <img src="/logo.svg" alt="LogiPilot Logo" className="w-6 h-6 object-contain" />
          <span className="font-display font-bold text-xl tracking-tight text-[#ff385c]">LogiPilot</span>
        </Link>

        {/* Main Nav Links (Left of Search on Desktop) */}
        <nav className={`hidden lg:flex items-center gap-4 px-4 overflow-x-auto whitespace-nowrap transition-opacity duration-200 ${isSearchExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium ${pathname === link.href ? 'text-[#222222]' : 'text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] px-3 py-2 rounded-full transition-colors'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Global Search - Airbnb Pill Style */}
        <div className={`hidden md:flex flex-1 justify-center max-w-lg px-2 lg:px-4 transition-all duration-300 ${isSearchExpanded ? 'opacity-0 pointer-events-none absolute left-1/2 -translate-x-1/2 top-4 scale-95' : 'opacity-100 scale-100'}`}>
          <button onClick={() => setIsSearchExpanded(true)} className="flex items-center bg-white border border-[#dddddd] rounded-full h-12 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-shadow duration-200">
            <div className="hidden sm:block px-4 text-sm font-medium text-foreground">Any route</div>
            <div className="hidden sm:block w-px h-6 bg-[#dddddd]"></div>
            <div className="hidden sm:block px-4 text-sm font-medium text-foreground">Any time</div>
            <div className="hidden sm:block w-px h-6 bg-[#dddddd]"></div>
            <div className="pl-4 pr-2 py-1 text-sm text-muted-foreground flex items-center gap-3 font-normal">
              <span className="hidden lg:inline">Add cargo</span>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                <Search className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          </button>
        </div>

        {/* Right Side / Actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-2 w-auto lg:w-[240px] shrink-0">
          <button className="hidden sm:block p-2.5 rounded-full hover:bg-[#f7f7f7] transition-colors text-foreground">
            <Globe className="w-4 h-4" />
          </button>
          
          {/* Account Menu Pill */}
          <Link href="/settings" className="flex items-center gap-3 border border-[#dddddd] rounded-full p-1.5 pl-3 hover:shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-shadow ml-1 sm:ml-2 bg-white">
            <Menu className="w-4 h-4 text-foreground" />
            <UserCircle2 className="w-8 h-8 text-[#717171]" />
          </Link>
        </div>
      </header>

      {/* Expanded Search UI overlay */}
      <AnimatePresence>
        {isSearchExpanded && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/25 z-40" 
              onClick={() => setIsSearchExpanded(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }} 
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }} 
              exit={{ opacity: 0, y: -10, scale: 0.95, x: "-50%" }}
              transition={{ duration: 0.2 }}
              className="fixed top-[96px] left-1/2 w-[90%] max-w-[850px] bg-white rounded-[32px] md:rounded-full shadow-2xl z-[60] flex items-center border border-[#dddddd] overflow-hidden md:overflow-visible"
            >
              <div className="flex flex-col md:flex-row w-full items-stretch py-2 md:py-0">
                <div className="flex-1 flex flex-col justify-center px-6 md:px-8 py-4 md:py-3 hover:bg-[#f7f7f7] md:rounded-full cursor-pointer transition-colors relative group">
                  <span className="text-[12px] font-bold text-[#222222]">Route</span>
                  <input type="text" placeholder="Search destinations" className="bg-transparent border-none outline-none text-[14px] text-[#222222] placeholder:text-[#6a6a6a] w-full" autoFocus />
                  <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-[#dddddd] group-hover:opacity-0 transition-opacity hidden md:block"></div>
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-[#dddddd] md:hidden"></div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-6 md:px-8 py-4 md:py-3 hover:bg-[#f7f7f7] md:rounded-full cursor-pointer transition-colors relative group">
                  <span className="text-[12px] font-bold text-[#222222]">Date</span>
                  <input type="text" placeholder="Add dates" className="bg-transparent border-none outline-none text-[14px] text-[#222222] placeholder:text-[#6a6a6a] w-full" />
                  <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-[#dddddd] group-hover:opacity-0 transition-opacity hidden md:block"></div>
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-[#dddddd] md:hidden"></div>
                </div>

                <div className="flex-1 flex flex-col justify-center px-6 md:pl-8 md:pr-2 py-4 md:py-2 hover:bg-[#f7f7f7] md:rounded-full cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <span className="text-[12px] font-bold text-[#222222] block">Cargo</span>
                      <input type="text" placeholder="Add details" className="bg-transparent border-none outline-none text-[14px] text-[#222222] placeholder:text-[#6a6a6a] w-full" />
                    </div>
                    <button onClick={handleSearch} className="h-12 w-12 md:w-28 bg-primary hover:bg-[#e00b3f] text-white rounded-full flex items-center justify-center gap-2 font-bold transition-colors shrink-0">
                      <Search className="w-4 md:w-4 h-4 md:h-4 stroke-[3]" />
                      <span className="hidden md:inline">Search</span>
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
