'use client';

import { motion, Variants } from 'framer-motion';
import { Users, AlertTriangle, Clock, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const drivers = [
  { id: 'DRV-101', name: 'Arun K.', vehicle: 'TN-01-AB-1234', route: 'Chennai → Bangalore', hos: '8h 45m', score: 98, status: 'Active' },
  { id: 'DRV-102', name: 'Vikram S.', vehicle: 'MH-12-CD-5678', route: 'Mumbai → Pune', hos: '11h 20m', score: 72, status: 'Approaching Limit' },
  { id: 'DRV-103', name: 'Rahul M.', vehicle: 'DL-04-GH-3456', route: 'Delhi → Jaipur', hos: '4h 15m', score: 95, status: 'Active' },
  { id: 'DRV-104', name: 'Manoj V.', vehicle: 'KA-03-EF-9012', route: 'Bangalore → Hubli', hos: '12h 05m', score: 88, status: 'Violation Risk' },
  { id: 'DRV-105', name: 'Suresh P.', vehicle: 'TS-09-IJ-7890', route: 'Hyderabad → Pune', hos: '1h 10m', score: 81, status: 'Active' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const getStatusStyle = (status: string) => {
  if (status === 'Active') return 'bg-[#fff8f6] text-[#008a05]';
  if (status === 'Approaching Limit') return 'bg-[#fff8eb] text-[#b25a00]';
  if (status === 'Violation Risk') return 'bg-[#fff8f6] text-[#c13515] animate-pulse';
  return 'bg-[#f7f7f7] text-[#6a6a6a]';
};

export default function DriversPage() {
  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#dddddd]">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#222222]">
              Driver Operations
            </h1>
            <p className="text-[16px] text-[#6a6a6a] mt-1">Driver schedules, performance, and HOS compliance tracking.</p>
          </div>
          <button className="bg-primary text-white font-bold text-[14px] px-6 py-3 rounded-[8px] hover:bg-black transition-colors">Assign Driver</button>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px]">
            <div className="relative p-6 flex flex-col h-full z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[14px] font-medium text-[#6a6a6a]">Active Drivers</span>
                <Users className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col mt-auto">
                <div className="text-[32px] font-bold tracking-tight text-[#222222]">214</div>
                <p className="text-[14px] font-bold text-[#222222] mt-1">On Shift Right Now</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px]">
            <div className="relative p-6 flex flex-col h-full z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[14px] font-medium text-[#6a6a6a]">HOS Approaching</span>
                <Clock className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col mt-auto">
                <div className="text-[32px] font-bold tracking-tight text-[#222222]">18</div>
                <p className="text-[14px] font-bold text-[#b25a00] mt-1">&lt; 2 hours remaining</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="relative overflow-hidden rounded-[14px] bg-white border border-[#dddddd] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer h-[160px]">
            <div className="relative p-6 flex flex-col h-full z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[14px] font-medium text-[#6a6a6a]">HOS Violations</span>
                <AlertTriangle className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col mt-auto">
                <div className="text-[32px] font-bold tracking-tight text-[#222222]">2</div>
                <p className="text-[14px] font-bold text-[#c13515] mt-1">Requires immediate action</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white border border-[#dddddd] rounded-[14px] overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-[#dddddd] bg-white flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#222222]" strokeWidth={2} />
              <input placeholder="Search drivers by name or ID..." className="w-full pl-10 pr-4 py-3 bg-white border border-[#dddddd] rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent placeholder-[#6a6a6a]" />
            </div>
            <button className="flex items-center text-[14px] font-bold text-[#222222] border border-[#dddddd] rounded-full px-4 py-2 hover:bg-[#f7f7f7] transition-colors">
              <Filter className="w-4 h-4 mr-2" strokeWidth={2} /> Filter
            </button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-white border-b border-[#dddddd]">
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a] pl-5">Driver</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a]">Vehicle & Route</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a]">Hours of Service</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a]">Safety Score</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a]">Status</TableHead>
                <TableHead className="h-12 text-[12px] font-medium text-[#6a6a6a] text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id} className="hover:bg-[#f7f7f7] border-b border-[#dddddd] transition-colors group cursor-pointer h-16">
                  <TableCell className="pl-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-[14px] text-[#222222]">{driver.name}</span>
                      <span className="text-[12px] font-medium text-[#6a6a6a]">{driver.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[#222222]">{driver.vehicle}</span>
                      <span className="text-[12px] text-[#6a6a6a]">{driver.route}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[14px] font-bold text-[#222222]">{driver.hos}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5 w-[120px]">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-bold text-[#222222]">{driver.score}/100</span>
                      </div>
                      <Progress value={driver.score} className={`h-1.5 ${driver.score < 80 ? 'bg-[#ffe8b3] [&>div]:bg-[#f2a600]' : 'bg-[#e2fad6] [&>div]:bg-[#008a05]'}`} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(driver.status)}`}>
                      {driver.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-5">
                    <button className="h-8 px-3 text-[12px] font-bold text-[#222222] hover:bg-[#f7f7f7] border border-[#dddddd] rounded-[8px] transition-colors">View Details</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    </div>
  );
}
