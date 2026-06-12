'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Package, Truck, AlertTriangle, CheckCircle } from "lucide-react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart as ReBarChart,
  Bar,
  Cell,
} from 'recharts';
import analyticsService, { AnalyticsSummary } from '@/services/analytics.service';

const COLORS = ['#222222', '#6a6a6a', '#c13515', '#008a05', '#b25a00', '#1a5fb4', '#8b5cf6', '#ec4899'];

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

function useCountUp(target: number, duration = 600, enabled = true) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!enabled) { setValue(0); return; }
    fromRef.current = value;
    startRef.current = 0;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (p < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, enabled]);

  return value;
}

function formatMinutes(mins: number): string {
  if (mins === 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDate(dateStr: any): string {
  if (!dateStr) return '';
  const d = new Date(String(dateStr));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    setLoading(true);
    analyticsService.getAnalyticsSummary(period)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const lineChartSize = useContainerSize(lineChartRef);
  const barChartSize = useContainerSize(barChartRef);

  const summary = data?.summary;
  const volumeTrend = data?.volumeTrend ?? [];
  const delayCauses = data?.delayCauses ?? [];

  const onTimeRate = useCountUp(summary?.onTimeRate ?? 0, 600, !loading);
  const totalShipments = useCountUp(summary?.totalShipments ?? 0, 600, !loading);
  const avgDelayMins = summary?.avgDelayMinutes ?? 0;
  const delayedCount = summary?.delayedShipments ?? 0;
  const deliveredCount = summary?.deliveredShipments ?? 0;

  const emptyState = !loading && (!summary || summary.totalShipments === 0);

  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto text-[#222222]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#dddddd] transition-all duration-300">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#222222]">
              Analytics & Reports
            </h1>
            <p className="text-[16px] text-[#6a6a6a] mt-1">Deep insights, historical data, and performance metrics.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setPeriod(7)}
              className={`flex-1 sm:flex-none font-bold text-[14px] px-4 py-2 rounded-[8px] transition-colors border ${
                period === 7
                  ? 'bg-[#222222] text-white border-[#222222]'
                  : 'border-[#dddddd] text-[#222222] hover:bg-[#f7f7f7]'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setPeriod(30)}
              className={`flex-1 sm:flex-none font-bold text-[14px] px-4 py-2 rounded-[8px] transition-colors border ${
                period === 30
                  ? 'bg-[#222222] text-white border-[#222222]'
                  : 'border-[#dddddd] text-[#222222] hover:bg-[#f7f7f7]'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {emptyState ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6a6a6a]">
            <Package className="w-12 h-12 mb-4 text-[#dddddd]" strokeWidth={1.5} />
            <p className="text-[18px] font-bold">No analytics data yet</p>
            <p className="text-[14px] mt-1">Shipments will appear here once the database is connected and data is available.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px] hover:-translate-y-1">
                <div className="relative p-6 flex flex-col h-full z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[14px] font-medium text-[#6a6a6a]">On-Time Delivery</span>
                    <CheckCircle className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col mt-auto">
                    <div className="text-[32px] font-bold tracking-tight text-[#222222]">
                      {loading ? (
                        <div className="h-8 w-20 rounded bg-[#f7f7f7] animate-pulse" />
                      ) : (
                        <span className="transition-opacity duration-300">{onTimeRate}%</span>
                      )}
                    </div>
                    {!loading && (
                      <p className={`flex items-center gap-1.5 text-[14px] font-bold mt-1 ${summary && summary.onTimeRate >= 90 ? 'text-[#008a05]' : 'text-[#6a6a6a]'}`}>
                        {summary && summary.onTimeRate >= 90
                          ? <><TrendingUp className="w-3.5 h-3.5" strokeWidth={2} /> Good performance</>
                          : <><TrendingDown className="w-3.5 h-3.5" strokeWidth={2} /> Needs improvement</>}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px] hover:-translate-y-1">
                <div className="relative p-6 flex flex-col h-full z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[14px] font-medium text-[#6a6a6a]">Avg Delay Duration</span>
                    <AlertTriangle className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col mt-auto">
                    <div className="text-[32px] font-bold tracking-tight text-[#222222]">
                      {loading ? (
                        <div className="h-8 w-20 rounded bg-[#f7f7f7] animate-pulse" />
                      ) : (
                        <span className="transition-opacity duration-300">{formatMinutes(avgDelayMins)}</span>
                      )}
                    </div>
                    {!loading && (
                      <p className="flex items-center gap-1.5 text-[14px] font-bold text-[#6a6a6a] mt-1">
                        {delayedCount} delayed shipments
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px] hover:-translate-y-1">
                <div className="relative p-6 flex flex-col h-full z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[14px] font-medium text-[#6a6a6a]">Total Shipments</span>
                    <Truck className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col mt-auto">
                    <div className="text-[32px] font-bold tracking-tight text-[#222222]">
                      {loading ? (
                        <div className="h-8 w-20 rounded bg-[#f7f7f7] animate-pulse" />
                      ) : (
                        <span className="transition-opacity duration-300">{totalShipments.toLocaleString()}</span>
                      )}
                    </div>
                    {!loading && (
                      <p className="flex items-center gap-1.5 text-[14px] font-bold text-[#008a05] mt-1">
                        {deliveredCount} delivered
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-[#dddddd] rounded-[14px] group hover:border-[#222222] transition-colors transition-all duration-300">
                <div className="p-6 border-b border-[#dddddd]">
                  <h3 className="font-bold text-[18px] text-[#222222]">Shipment Volume Trend</h3>
                  <p className="text-[14px] text-[#6a6a6a] mt-1">Daily completed shipments over {period} days</p>
                </div>
                <div ref={lineChartRef} className="relative p-4" style={{ width: '100%', height: 300 }}>
                  {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white rounded-b-[14px]">
                      <div className="w-[calc(100%-2rem)] h-[calc(100%-2rem)] bg-[#f7f7f7] rounded-[8px] animate-pulse" />
                    </div>
                  )}
                  {!loading && volumeTrend.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-[#6a6a6a] text-[14px]">No shipment data available</div>
                  ) : lineChartSize.width > 0 && lineChartSize.height > 0 ? (
                    <ReLineChart width={lineChartSize.width} height={lineChartSize.height} data={volumeTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        stroke="#6a6a6a"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis stroke="#6a6a6a" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        labelFormatter={formatDate}
                        contentStyle={{ borderRadius: 8, border: '1px solid #ddd', fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#222222"
                        strokeWidth={2}
                        dot={{ fill: '#222222', r: 3 }}
                        activeDot={{ r: 5 }}
                        name="Shipments"
                      />
                    </ReLineChart>
                  ) : null}
                </div>
              </div>

              <div className="bg-white border border-[#dddddd] rounded-[14px] group hover:border-[#222222] transition-colors transition-all duration-300">
                <div className="p-6 border-b border-[#dddddd]">
                  <h3 className="font-bold text-[18px] text-[#222222]">Delay Root Causes</h3>
                  <p className="text-[14px] text-[#6a6a6a] mt-1">Categorized by occurrence frequency</p>
                </div>
                <div ref={barChartRef} className="relative p-4" style={{ width: '100%', height: 300 }}>
                  {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white rounded-b-[14px]">
                      <div className="w-[calc(100%-2rem)] h-[calc(100%-2rem)] bg-[#f7f7f7] rounded-[8px] animate-pulse" />
                    </div>
                  )}
                  {!loading && delayCauses.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-[#6a6a6a] text-[14px]">No delay data available</div>
                  ) : barChartSize.width > 0 && barChartSize.height > 0 ? (
                    <ReBarChart width={barChartSize.width} height={barChartSize.height} data={delayCauses} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" stroke="#6a6a6a" fontSize={11} tickLine={false} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="cause"
                        stroke="#6a6a6a"
                        fontSize={11}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #ddd', fontSize: 12 }}
                      />
                      <Bar dataKey="count" name="Occurrences" radius={[0, 4, 4, 0]}>
                        {delayCauses.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </ReBarChart>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

