'use client';

import { motion } from 'framer-motion';
import { Package, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

const deliveries = [
  { id: 'LP100045', customer: 'Acme Corp', dest: '124 Industrial Pkwy', eta: '14:30', status: 'IN TRANSIT', priority: 'HIGH' },
  { id: 'LP100291', customer: 'TechFlow Solutions', dest: '98 Innovation Blvd', eta: '16:15', status: 'PENDING', priority: 'NORMAL' },
  { id: 'LP100833', customer: 'Global Supply Inc.', dest: 'Dock 4, Port Zone', eta: '11:00', status: 'DELIVERED', priority: 'HIGH' },
];

export default function DeliveriesPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header & Filters */}
      <div className="bg-white px-6 py-4 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Deliveries</h1>
        
        <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {['ALL', 'PENDING', 'IN TRANSIT', 'DELIVERED'].map((filter, i) => (
            <button key={i} className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors ${i === 0 ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-6 space-y-4 pb-32 flex-1">
        {deliveries.length === 0 ? (
          <EmptyState 
            title="No Deliveries Found" 
            description="You currently have no deliveries assigned to your route. Check back later or contact dispatch."
            actionLabel="Refresh Assignments"
            onAction={() => window.location.reload()}
          />
        ) : (
          deliveries.map((delivery, i) => (
            <motion.div 
              key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-white rounded-3xl p-5 border shadow-sm relative overflow-hidden flex flex-col ${delivery.status === 'DELIVERED' ? 'border-slate-100 opacity-60' : 'border-slate-200'}`}
          >
            {delivery.priority === 'HIGH' && delivery.status !== 'DELIVERED' && (
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-500" />
            )}
            {delivery.status === 'DELIVERED' && (
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
            )}
            
            <div className="flex justify-between items-start mb-4 pl-1">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 block mb-1">
                  {delivery.id}
                </span>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{delivery.customer}</h3>
              </div>
              <div className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-widest uppercase ${
                delivery.status === 'IN TRANSIT' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                delivery.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {delivery.status}
              </div>
            </div>

            <div className="space-y-2 mb-6 pl-1">
              <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {delivery.dest}
              </p>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                ETA: {delivery.eta}
              </p>
            </div>

            <div className="mt-auto border-t border-slate-100 pt-4 pl-1">
              {delivery.status === 'DELIVERED' ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Proof of Delivery Uploaded
                </div>
              ) : (
                <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex justify-between px-5 group">
                  View Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </motion.div>
        )))}
      </div>
    </div>
  );
}
