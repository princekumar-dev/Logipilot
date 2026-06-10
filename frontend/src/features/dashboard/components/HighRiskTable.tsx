'use client';

import { motion } from 'framer-motion';
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

import { useEffect, useState } from 'react';
import shipmentService from '@/services/shipment.service';
import { predictionService, PredictionResult } from '@/services/prediction.service';

interface RiskRow {
  id: string;
  trackingNumber: string;
  eta: string;
  score: number;
  prob: string;
  action: string;
}

export function HighRiskTable() {
  const [riskData, setRiskData] = useState<RiskRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        // Get all active shipments
        const shipmentsData = await shipmentService.getAll();
        const activeShipments = shipmentsData.shipments.filter(
          s => s.status === 'in_transit' || s.status === 'delayed' || s.status === 'pending'
        );

        const rows: RiskRow[] = [];

        // For MVP, just get predictions for the first few active shipments
        for (const shipment of activeShipments) {
          try {
            const prediction = await predictionService.getPrediction(shipment._id);
            
            let statusText = 'Monitor';
            let actionText = 'Monitor';
            if (prediction.riskScore > 80) {
              statusText = 'Critical';
              actionText = 'Dispatch Backup';
            } else if (prediction.riskScore > 60) {
              statusText = 'At Risk';
              actionText = 'Alert Driver';
            } else if (prediction.delayProbability > 0.5) {
              statusText = 'Delayed';
              actionText = 'Reroute';
            }

            const etaDate = new Date(prediction.predictedETA);
            const timeString = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            rows.push({
              id: shipment._id,
              trackingNumber: shipment.trackingNumber,
              eta: `${timeString} (${statusText})`,
              score: prediction.riskScore,
              prob: `${(prediction.delayProbability * 100).toFixed(0)}%`,
              action: actionText
            });
          } catch (e) {
            console.error('Failed to get prediction for', shipment._id);
          }
        }

        // Sort by highest risk score and take top 8
        const sortedRows = rows.sort((a, b) => b.score - a.score).slice(0, 8);
        setRiskData(sortedRows);
      } catch (error) {
        console.error('Error fetching risk data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchPredictions, 30000);
    return () => clearInterval(interval);
  }, []);

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
           <span className="text-[10px] font-bold tracking-tight">{riskData.filter(d => d.score > 80).length} Critical</span>
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
              {riskData.map((row) => (
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
