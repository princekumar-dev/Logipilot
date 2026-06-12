'use client';

import { useState, useRef } from 'react';
import { Search, Globe, Menu, UserCircle2, LogOut, Calendar } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/auth.service';

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuthStore();

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

  const handleLogout = () => {
    logout();
    setIsAccountOpen(false);
    router.push('/login');
    authService.logout().catch(() => {});
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-[80px] border-b border-border bg-background flex items-center justify-between px-4 lg:px-10">
        
        {/* Logo */}
        <Link href="/" prefetch={true} className="flex items-center gap-2 text-primary shrink-0 mr-4">
          <img src="/logo.svg" alt="LogiPilot Logo" className="w-6 h-6 object-contain" />
          <span className="font-display font-bold text-xl tracking-tight text-[#ff385c]">LogiPilot</span>
        </Link>

        {/* Main Nav Links */}
        <nav className={`hidden lg:flex items-center gap-4 px-4 overflow-x-auto whitespace-nowrap transition-opacity duration-200 ${isSearchExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                prefetch={true}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#222222]'
                    : 'text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] px-3 py-2 rounded-full'
                } ${!isActive ? 'px-3 py-2 rounded-full' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Global Search */}
        <div className={`hidden md:flex flex-1 justify-center max-w-lg px-2 lg:px-4 transition-all duration-300 ${isSearchExpanded ? 'opacity-0 pointer-events-none absolute left-1/2 -translate-x-1/2 top-4 scale-95' : 'opacity-100 scale-100'}`}>
          <button onClick={() => setIsSearchExpanded(true)} className="flex items-center bg-white border border-[#dddddd] rounded-full h-12 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-shadow duration-200">
            <div className="hidden sm:block px-4 text-sm font-medium text-foreground">Any route</div>
            <div className="hidden sm:block w-px h-6 bg-[#dddddd]"></div>
            <div className="hidden sm:block px-4 text-sm font-medium text-foreground">Any time</div>
            <div className="w-px h-6 bg-[#dddddd]"></div>
            <div className="pl-2 pr-2 py-1 flex items-center gap-3">
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
          <div className="relative">
            <button 
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-3 border border-[#dddddd] rounded-full p-1.5 pl-3 hover:shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-shadow ml-1 sm:ml-2 bg-white"
            >
              <Menu className="w-4 h-4 text-foreground" />
              <UserCircle2 className="w-8 h-8 text-[#717171]" />
            </button>

            {isAccountOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsAccountOpen(false)} 
                />
                <div className="absolute right-0 top-[52px] w-[220px] bg-white rounded-[14px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-[#dddddd] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 border-b border-[#dddddd]">
                    <p className="text-[14px] font-bold text-[#222222]">{user?.name || 'User'}</p>
                    <p className="text-[12px] text-[#6a6a6a] truncate">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <Link 
                      href="/settings" 
                      prefetch={true}
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-[#222222] hover:bg-[#f7f7f7] rounded-[8px] transition-colors"
                    >
                      <UserCircle2 className="w-4 h-4" strokeWidth={2} />
                      Account settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-[#c13515] hover:bg-[#fff8f6] rounded-[8px] transition-colors"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={2} />
                      Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Expanded Search UI overlay */}
      {isSearchExpanded && (
        <>
          <div 
            className="fixed inset-0 bg-black/25 z-40 animate-in fade-in duration-200" 
            onClick={() => setIsSearchExpanded(false)} 
          />
          <div className="fixed top-[96px] left-1/2 -translate-x-1/2 w-[90%] max-w-[850px] bg-white rounded-[32px] md:rounded-full shadow-2xl z-[60] flex items-center border border-[#dddddd] overflow-hidden md:overflow-visible animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col md:flex-row w-full items-stretch py-2 md:py-0">
              <div className="flex-1 flex flex-col justify-center px-6 md:px-8 py-4 md:py-3 hover:bg-[#f7f7f7] md:rounded-full cursor-pointer transition-colors relative group">
                <span className="text-[12px] font-bold text-[#222222]">Route</span>
                <input type="text" placeholder="Search destinations" className="bg-transparent border-none outline-none text-[14px] text-[#222222] placeholder:text-[#6a6a6a] w-full" autoFocus />
                <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-[#dddddd] group-hover:opacity-0 transition-opacity hidden md:block"></div>
                <div className="absolute bottom-0 left-6 right-6 h-px bg-[#dddddd] md:hidden"></div>
              </div>

              <div className="flex-1 flex flex-col justify-center px-6 md:px-8 py-4 md:py-3 hover:bg-[#f7f7f7] md:rounded-full cursor-pointer transition-colors relative group" onClick={() => dateInputRef.current?.showPicker()}>
                <span className="text-[12px] font-bold text-[#222222]">Date</span>
                <div className="flex items-center justify-between">
                  <input type="text" placeholder="Add dates" value={selectedDate} readOnly className="bg-transparent border-none outline-none text-[14px] text-[#222222] placeholder:text-[#6a6a6a] w-full cursor-pointer" />
                  <Calendar className="w-5 h-5 text-[#6a6a6a] shrink-0 ml-2" />
                </div>
                <input ref={dateInputRef} type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="absolute inset-0 opacity-0 pointer-events-none" />
                <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-[#dddddd] group-hover:opacity-0 transition-opacity hidden md:block"></div>
                <div className="absolute bottom-0 left-6 right-6 h-px bg-[#dddddd] md:hidden"></div>
              </div>

              <div className="flex items-center px-4 md:pl-4 md:pr-2 py-3 md:py-2">
                <button onClick={handleSearch} className="h-12 w-full md:w-28 bg-primary hover:bg-[#e00b3f] text-white rounded-full flex items-center justify-center gap-2 font-bold transition-colors shrink-0">
                  <Search className="w-4 h-4 stroke-[3]" />
                  <span className="hidden md:inline">Search</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
