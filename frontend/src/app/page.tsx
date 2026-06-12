'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const KPIGrid = dynamic(() => import('@/features/dashboard/components/KPIGrid').then(m => m.KPIGrid), { ssr: false, loading: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="rounded-[14px] bg-white border border-[#dddddd] p-6 h-[140px] animate-pulse" />)}</div> });
const MapWrapper = dynamic(() => import('@/features/dashboard/components/MapWrapper').then(m => m.MapWrapper), { ssr: false, loading: () => <div className="h-[460px] w-full rounded-[14px] bg-[#f7f7f7] animate-pulse" /> });
const HighRiskTable = dynamic(() => import('@/features/dashboard/components/HighRiskTable').then(m => m.HighRiskTable), { ssr: false, loading: () => <div className="h-[784px] w-full rounded-[14px] bg-[#f7f7f7] animate-pulse" /> });
const AIRecommendations = dynamic(() => import('@/features/dashboard/components/AIRecommendations').then(m => m.AIRecommendations), { ssr: false, loading: () => <div className="h-[300px] w-full rounded-[14px] bg-[#f7f7f7] animate-pulse" /> });
const CopilotWidget = dynamic(() => import('@/features/copilot/components/CopilotWidget').then(m => m.CopilotWidget), { ssr: false });

export default function DashboardPage() {
  useEffect(() => {
    import('@/features/dashboard/components/HighRiskTable');
  }, []);

  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#dddddd]">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#222222]">Global Operations Center</h1>
            <p className="text-[16px] text-[#6a6a6a] mt-1">Live system metrics and actionable intelligence.</p>
          </div>
        </div>

        {/* KPI Section */}
        <section>
          <KPIGrid />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (Map & Recommendations) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="h-[460px] w-full">
              <MapWrapper />
            </div>
            <div className="h-[300px] w-full">
              <AIRecommendations />
            </div>
          </div>

          {/* Right Column (High Risk Shipments) */}
          <div className="lg:col-span-1 h-[784px] w-full">
            <HighRiskTable />
          </div>
        </div>

        {/* Floating Copilot Widget */}
        <CopilotWidget />
      </div>
    </div>
  );
}
