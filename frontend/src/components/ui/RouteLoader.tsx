'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function RouteLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setLoading(false);
      setProgress(0);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [pathname]);

  useEffect(() => {
    if (!loading) return;

    const steps = [10, 30, 50, 70, 85];
    let step = 0;

    const interval = setInterval(() => {
      if (step < steps.length) {
        setProgress(steps[step]);
        step++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [loading]);

  // Start loading on popstate (back/forward) and shallow navigation
  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
      setProgress(10);
    };

    // Intercept link clicks for instant feedback
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return;
      if (href === pathname) return;
      setLoading(true);
      setProgress(10);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]">
      <div
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{
          width: loading ? `${progress}%` : '100%',
          opacity: loading ? 1 : 0,
          transition: loading ? 'width 0.2s ease-out, opacity 0.2s ease-out' : 'width 0.3s ease-out, opacity 0.3s ease-out',
        }}
      />
    </div>
  );
}
