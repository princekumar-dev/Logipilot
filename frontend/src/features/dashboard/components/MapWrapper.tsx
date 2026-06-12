'use client';

import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('./LiveMap').then((mod) => mod.LiveMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#f7f7f7] rounded-[14px] flex flex-col items-center justify-center border border-[#dddddd]">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-[14px] text-[#6a6a6a] font-bold tracking-tight">Loading map...</span>
    </div>
  ),
});

export function MapWrapper({ mode }: { mode?: 'dashboard' | 'fleet' }) {
  return <LiveMap mode={mode} />;
}
