'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

import { useEffect, useState, useRef } from 'react';
import analyticsService, { HighRiskShipment } from '@/services/analytics.service';

interface RiskRow {
  id: string;
  trackingNumber: string;
  eta: string;
  score: number;
  prob: string;
  action: string;
}

function toRow(s: HighRiskShipment): RiskRow {
  let statusText = 'Monitor';
  let actionText = 'Monitor';
  if (s.riskScore > 80) {
    statusText = 'Critical';
    actionText = 'Dispatch Backup';
  } else if (s.riskScore > 60) {
    statusText = 'At Risk';
    actionText = 'Alert Driver';
  } else if (s.delayProbability > 0.5) {
    statusText = 'Delayed';
    actionText = 'Reroute';
  }

  const etaDate = new Date(s.predictedETA);
  const timeString = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id: s.shipmentId,
    trackingNumber: s.trackingNumber,
    eta: `${timeString} (${statusText})`,
    score: s.riskScore,
    prob: `${(s.delayProbability * 100).toFixed(0)}%`,
    action: actionText,
  };
}

function SkeletonRow() {
  return (
    <TableRow className="border-b border-[#dddddd] h-14">
      <TableCell className="pl-5 py-2">
        <div className="h-4 w-20 rounded bg-[#f7f7f7] animate-pulse" />
      </TableCell>
      <TableCell className="px-2 py-2">
        <div className="flex flex-col gap-1">
          <div className="h-4 w-14 rounded bg-[#f7f7f7] animate-pulse" />
          <div className="h-3 w-10 rounded bg-[#f7f7f7] animate-pulse" />
        </div>
      </TableCell>
      <TableCell className="hidden xl:table-cell py-2">
        <div className="flex flex-col gap-1 w-[80px]">
          <div className="h-3 w-8 rounded bg-[#f7f7f7] animate-pulse" />
          <div className="h-1.5 w-full rounded bg-[#f7f7f7] animate-pulse" />
        </div>
      </TableCell>
      <TableCell className="text-right pr-5 py-2">
        <div className="h-8 w-20 rounded-[8px] bg-[#f7f7f7] animate-pulse ml-auto" />
      </TableCell>
    </TableRow>
  );
}

export function HighRiskTable() {
  const [riskData, setRiskData] = useState<RiskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const fetchRisk = async () => {
      try {
        if (!hasLoaded.current && !cancelled) setLoading(true);
        const predictions = await analyticsService.getHighRiskShipments();
        if (!cancelled) {
          setRiskData(predictions.map(toRow));
          hasLoaded.current = true;
        }
      } catch (error) {
        console.error('Error fetching risk data:', error);
        if (!cancelled) setRiskData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRisk();
    const interval = setInterval(fetchRisk, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const criticalCount = loading ? 0 : riskData.filter(d => d.score > 80).length;

  return (
    <div className="rounded-[14px] border border-[#dddddd] h-full bg-white flex flex-col overflow-hidden">
      <div className="px-4 md:px-5 py-4 border-b border-[#dddddd] bg-white relative z-10 flex items-center justify-between">
        <h2 className="text-sm md:text-base font-bold flex items-center gap-2 text-[#222222] tracking-tight">
          <div className="p-1.5 rounded-lg text-primary hidden sm:block">
            <ShieldAlert className="w-4 h-4" strokeWidth={2} />
          </div>
          High Risk
        </h2>
        <div className="flex items-center gap-1.5 bg-[#f7f7f7] border border-[#dddddd] text-[#222222] px-3 py-1 rounded-full shrink-0">
           <AlertCircle className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
           <span className="text-[10px] font-bold tracking-tight">{criticalCount} Critical</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-white overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-white border-b border-[#dddddd]">
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a] pl-5">ID</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a] px-2">ETA</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a] hidden xl:table-cell">Risk</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a] text-right pr-5">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : riskData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-[#6a6a6a] text-[14px]">
                    No high-risk shipments
                  </TableCell>
                </TableRow>
              ) : (
                riskData.map((row) => (
                  <TableRow 
                    key={row.id} 
                    className="hover:bg-[#f7f7f7] transition-colors group border-b border-[#dddddd] cursor-pointer h-14"
                  >
                    <TableCell className="pl-5 py-2">
                      <span className="text-sm font-bold text-[#222222] transition-colors">
                        {row.trackingNumber.replace('LP', '')}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded w-fit whitespace-nowrap ${row.score > 80 ? 'text-[#c13515] bg-[#fff8f6]' : 'text-[#b25a00] bg-[#fff8eb]'}`}>
                          {row.eta.split(' ')[0]}
                        </span>
                        <span className="text-[10px] font-medium text-[#6a6a6a]">{row.eta.split(' ')[1]?.replace(/[()]/g, '')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell py-2">
                      <div className="flex flex-col gap-1 w-[60px] md:w-[80px]">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#222222]">{row.prob}</span>
                        </div>
                        <Progress value={row.score} className={`h-1.5 ${row.score > 80 ? 'bg-[#ffb3c1] [&>div]:bg-primary' : 'bg-[#ffe8b3] [&>div]:bg-[#f2a600]'}`} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-5 py-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(`Action: ${row.action.split(' ')[0]}`, { description: `Triggered for shipment ${row.id}` });
                        }}
                        className="h-8 px-3 text-[12px] font-bold shadow-none rounded-[8px] whitespace-nowrap border-[#dddddd] text-[#222222] hover:bg-[#f7f7f7]"
                      >
                        {row.action.split(' ')[0]}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
