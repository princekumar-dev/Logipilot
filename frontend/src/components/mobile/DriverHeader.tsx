'use client';

import { useState } from 'react';
import { Search, Menu, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function DriverHeader() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearch = () => {
    setIsSearchExpanded(false);
    toast.success("Searching drops...");
  };

  return (
    <header className="sticky top-0 z-40 h-[72px] bg-white border-b border-[#dddddd] flex items-center justify-between px-4 w-full">
      {/* Brand / Logo Area */}
      <Link href="/driver" className="flex items-center text-primary shrink-0 gap-2">
        <img src="/logo.svg" alt="LogiPilot Logo" className="w-6 h-6 object-contain" />
        <span className="font-display font-bold text-lg tracking-tight text-[#ff385c]">LogiPilot</span>
      </Link>

      {/* Right Account Menu Pill */}
      <Link href="/driver/profile" className="flex items-center gap-2 border border-[#dddddd] rounded-full p-1.5 pl-3 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow bg-white ml-auto">
        <Menu className="w-4 h-4 text-[#222222]" />
        <UserCircle2 className="w-6 h-6 text-[#717171]" />
      </Link>
    </header>
  );
}
