'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/mobile/BottomNav";
import authService from '../../services/auth.service';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Refresh access token on mount if authenticated but token is missing (page refresh)
  useEffect(() => {
    if (mounted && isAuthenticated && !accessToken) {
      authService.refresh()
        .then((newToken) => {
          useAuthStore.getState().setAccessToken(newToken);
        })
        .catch(() => {
          useAuthStore.getState().logout();
          router.replace('/login');
        });
    }
  }, [mounted, isAuthenticated, accessToken, router]);

  const userRole = useAuthStore((state) => state.user?.role);

  useEffect(() => {
    if (!mounted) return;

    const isPublicRoute = pathname === '/login' || pathname === '/signup';
    
    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    } else if (isAuthenticated && isPublicRoute) {
      router.replace(userRole === 'driver' ? '/driver' : '/');
    } else if (isAuthenticated) {
      const isDriverRoute = pathname === '/driver' || pathname.startsWith('/driver/');
      if (userRole === 'driver' && !isDriverRoute) {
        router.replace('/driver');
      } else if (userRole !== 'driver' && isDriverRoute) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, userRole, pathname, router, mounted]);

  if (!mounted) return null;

  const isPublicRoute = pathname === '/login' || pathname === '/signup';

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // To prevent flash of content, only render children if authenticated and token is ready
  if (!isAuthenticated) return null;
  if (isAuthenticated && !accessToken) return null;

  const isDriverRoute = pathname === '/driver' || pathname.startsWith('/driver/');

  return (
    <div className={`min-h-screen w-full bg-[#f7f7f7] ${isDriverRoute ? 'flex justify-center' : ''}`}>
      {!isDriverRoute && <TopNav />}
      
      <div className={`flex flex-col flex-1 w-full ${isDriverRoute ? 'max-w-[480px] bg-white border-x border-[#dddddd] relative shadow-xl overflow-x-hidden' : 'pt-[80px]'}`}>
        <main key={pathname} className={`flex-1 w-full min-h-[calc(100vh-80px)] pb-[88px] page-enter ${!isDriverRoute ? 'md:pb-0' : ''}`}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
