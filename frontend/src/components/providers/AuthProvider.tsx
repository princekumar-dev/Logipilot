'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/mobile/BottomNav";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (mounted) {
      const isPublicRoute = pathname === '/login' || pathname === '/signup';
      
      if (!isAuthenticated && !isPublicRoute) {
        router.replace('/login');
      } else if (isAuthenticated) {
        if (isPublicRoute) {
          // Redirect authenticated users away from login/signup
          router.replace(user?.role === 'driver' ? '/driver' : '/');
        } else if (user?.role === 'driver' && !(pathname === '/driver' || pathname.startsWith('/driver/'))) {
          // Drivers can only access /driver routes
          router.replace('/driver');
        } else if (user?.role !== 'driver' && (pathname === '/driver' || pathname.startsWith('/driver/'))) {
          // Managers/Admins cannot access /driver mobile routes
          router.replace('/');
        }
      }
    }
  }, [isAuthenticated, user, pathname, router, mounted]);

  if (!mounted) return null;

  const isPublicRoute = pathname === '/login' || pathname === '/signup';

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // To prevent flash of content, only render children if authenticated
  if (!isAuthenticated) return null;

  const isDriverRoute = pathname === '/driver' || pathname.startsWith('/driver/');

  return (
    <div className={`min-h-screen w-full bg-[#f7f7f7] ${isDriverRoute ? 'flex justify-center' : ''}`}>
      {!isDriverRoute && <TopNav />}
      
      <div className={`flex flex-col flex-1 w-full ${isDriverRoute ? 'max-w-[480px] bg-white border-x border-[#dddddd] relative shadow-xl overflow-x-hidden' : 'pt-[80px]'}`}>
        <main className={`flex-1 w-full min-h-[calc(100vh-80px)] pb-[88px] ${!isDriverRoute ? 'md:pb-0' : ''}`}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
