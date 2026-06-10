import { KPIGrid } from '@/features/dashboard/components/KPIGrid';
import { MapWrapper } from '@/features/dashboard/components/MapWrapper';
import { HighRiskTable } from '@/features/dashboard/components/HighRiskTable';
import { AIRecommendations } from '@/features/dashboard/components/AIRecommendations';
import { CopilotWidget } from '@/features/copilot/components/CopilotWidget';

export default function DashboardPage() {
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
