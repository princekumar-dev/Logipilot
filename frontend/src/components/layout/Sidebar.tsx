'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Users, 
  Building2, 
  LineChart, 
  Bot, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Shipments', href: '/shipments', icon: Package },
  { name: 'Fleet', href: '/fleet', icon: Truck },
  { name: 'Drivers', href: '/drivers', icon: Users },
  { name: 'Warehouses', href: '/warehouses', icon: Building2 },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'AI Copilot', href: '/copilot', icon: Bot, isAccent: true },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background">
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Overview
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  item.isAccent && !isActive && "text-info hover:text-info hover:bg-info/10"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Status Readout */}
        <div className="mt-auto pt-4 px-2">

          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex justify-between items-center bg-muted/50 p-2 rounded-md border border-border/50">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                System Status
              </span>
              <span className="font-medium text-foreground">Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
