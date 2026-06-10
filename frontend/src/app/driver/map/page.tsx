'use client';

import dynamic from 'next/dynamic';

const DriverMapClient = dynamic(() => import('./DriverMapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-48px)] bg-[#f7f7f7] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function MapPage() {
  return <DriverMapClient />;
}
