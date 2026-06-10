'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Loader2,
  MoreVertical
} from 'lucide-react';
import shipmentService, { Shipment } from '../../services/shipment.service';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newShipmentOrigin, setNewShipmentOrigin] = useState('');
  const [newShipmentDest, setNewShipmentDest] = useState('');
  const [newShipmentPriority, setNewShipmentPriority] = useState<'low'|'medium'|'high'|'critical'>('medium');
  const [isCreating, setIsCreating] = useState(false);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await shipmentService.getAll({ limit: 50 });
      setShipments(data.shipments);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch shipments. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      await shipmentService.create({
        destinationAddress: newShipmentDest,
        priority: newShipmentPriority
      });
      setIsCreateModalOpen(false);
      setNewShipmentDest('');
      fetchShipments(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Error creating shipment');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-1 bg-[#f7f7f7] text-[#6a6a6a] rounded-[6px] text-[10px] font-bold uppercase tracking-wide">Pending</span>;
      case 'in_transit': return <span className="px-2 py-1 bg-[#e2fad6] text-[#008a05] rounded-[6px] text-[10px] font-bold uppercase tracking-wide">In Transit</span>;
      case 'delayed': return <span className="px-2 py-1 bg-[#fff8f6] text-[#c13515] rounded-[6px] text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3"/> Delayed</span>;
      case 'delivered': return <span className="px-2 py-1 bg-[#f7f7f7] text-[#222222] rounded-[6px] text-[10px] font-bold uppercase tracking-wide">Delivered</span>;
      default: return <span className="px-2 py-1 bg-[#f7f7f7] text-[#6a6a6a] rounded-[6px] text-[10px] font-bold uppercase tracking-wide">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'critical': return <span className="text-[#c13515] text-[12px] font-bold">Critical</span>;
      case 'high': return <span className="text-[#b25a00] text-[12px] font-bold">High</span>;
      case 'medium': return <span className="text-[#008a05] text-[12px] font-bold">Medium</span>;
      default: return <span className="text-[#6a6a6a] text-[12px] font-bold">Low</span>;
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto text-[#222222]">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#222222]">
              Shipment Management
            </h1>
            <p className="text-[16px] text-[#6a6a6a] mt-1">Live tracking and assignment of global logistics.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-3 bg-white border border-[#222222] text-[#222222] rounded-[8px] font-bold text-[14px] hover:bg-[#f7f7f7] transition-colors">
              <Filter className="w-4 h-4" strokeWidth={2} />
              Filter
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-[8px] font-bold text-[14px] hover:bg-black transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              New Shipment
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-[14px] border border-[#dddddd] overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-4 border-b border-[#dddddd] flex items-center justify-between bg-white">
            <div className="relative w-full max-w-sm">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#222222]" strokeWidth={2} />
              <input 
                type="text" 
                placeholder="Search tracking number, destination..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#dddddd] rounded-full text-[14px] outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-all placeholder-[#6a6a6a]"
              />
            </div>
            <div className="text-[14px] font-medium text-[#6a6a6a] hidden sm:block">
              Showing {shipments.length} Active Shipments
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-[#6a6a6a]">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#222222]" strokeWidth={2} />
                <p className="font-medium text-[14px]">Syncing telemetry data...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-[#c13515] font-bold text-[14px]">
                {error}
              </div>
            ) : shipments.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-[#dddddd] mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-[18px] font-bold text-[#222222]">No Shipments Found</h3>
                <p className="text-[#6a6a6a] text-[14px] mt-1">There are no active shipments in the network.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#dddddd] bg-white">
                    <th className="px-6 py-4 text-[12px] font-medium text-[#6a6a6a]">Tracking ID</th>
                    <th className="px-6 py-4 text-[12px] font-medium text-[#6a6a6a]">Destination</th>
                    <th className="px-6 py-4 text-[12px] font-medium text-[#6a6a6a]">Status</th>
                    <th className="px-6 py-4 text-[12px] font-medium text-[#6a6a6a]">Priority</th>
                    <th className="px-6 py-4 text-[12px] font-medium text-[#6a6a6a]">Created</th>
                    <th className="px-6 py-4 text-[12px] font-medium text-[#6a6a6a] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dddddd]">
                  {shipments.map((shipment) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={shipment._id} 
                      className="hover:bg-[#f7f7f7] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[8px] border border-[#dddddd] bg-white text-[#222222] flex items-center justify-center font-bold text-[12px]">
                            LP
                          </div>
                          <div>
                            <div className="font-bold text-[14px] text-[#222222] group-hover:underline decoration-2">{shipment.trackingNumber}</div>
                            <div className="text-[12px] text-[#6a6a6a] font-medium">ID: {shipment._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#222222]" strokeWidth={2} />
                          <span className="text-[14px] font-medium text-[#222222]">{shipment.destinationAddress || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(shipment.status)}
                      </td>
                      <td className="px-6 py-4">
                        {getPriorityBadge(shipment.priority)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[14px] text-[#6a6a6a] font-medium">
                          <Clock className="w-4 h-4" strokeWidth={2} />
                          {new Date(shipment.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-[#6a6a6a] hover:text-[#222222] hover:bg-white border border-transparent hover:border-[#dddddd] rounded-full transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-5 h-5" strokeWidth={2} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create Modal overlay */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[14px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-[#dddddd] bg-white">
                <h2 className="text-[22px] font-bold text-[#222222]">Create New Shipment</h2>
                <p className="text-[14px] text-[#6a6a6a] mt-1 font-medium">Initialize a new logistics package.</p>
              </div>
              
              <form onSubmit={handleCreateShipment} className="p-6 space-y-6">
                <div>
                  <label className="block text-[12px] font-bold text-[#222222] mb-2 uppercase tracking-wide">Destination Address</label>
                  <input 
                    type="text" 
                    required
                    value={newShipmentDest}
                    onChange={(e) => setNewShipmentDest(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors placeholder-[#6a6a6a]" 
                    placeholder="e.g. 123 Tech Park, Chennai"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#222222] mb-2 uppercase tracking-wide">Priority</label>
                  <select 
                    value={newShipmentPriority}
                    onChange={(e) => setNewShipmentPriority(e.target.value as any)}
                    className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-[#dddddd]">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-6 py-3 text-[14px] font-bold text-[#222222] hover:bg-[#f7f7f7] rounded-[8px] transition-colors underline"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isCreating}
                    className="px-6 py-3 text-[14px] font-bold text-white bg-primary hover:bg-black rounded-[8px] transition-colors flex items-center gap-2"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4" strokeWidth={2} />}
                    Create Shipment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
