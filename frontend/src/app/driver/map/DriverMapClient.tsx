'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation2, AlertTriangle, Route, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import shipmentService from '@/services/shipment.service';
import { predictionService, PredictionResult } from '@/services/prediction.service';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToString } from 'react-dom/server';

const DEFAULT_POSITION: [number, number] = [12.9716, 77.5946];

function MapController({ setMapRef }: { setMapRef: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    setMapRef(map);
  }, [map, setMapRef]);
  return null;
}

const createNavIcon = () => {
  const iconHtml = renderToString(
    <div className="relative">
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center relative shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-[#dddddd]">
        <Navigation2 className="w-7 h-7 text-[#ff385c]" fill="currentColor" />
      </div>
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#ff385c]/5 rounded-full blur-2xl pointer-events-none" />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [64, 64],
    iconAnchor: [32, 32],
  });
};

export default function DriverMapClient() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [etaMins, setEtaMins] = useState<number>(14);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [speed, setSpeed] = useState<number>(45);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const shipmentsData = await shipmentService.getAll();
        const activeShipment = shipmentsData.shipments.find(s => s.status === 'in_transit' || s.status === 'delayed');
        
        if (activeShipment) {
          const pred = await predictionService.getPrediction(activeShipment._id);
          setPrediction(pred);
          
          if (pred.predictedETA) {
            const etaDate = new Date(pred.predictedETA);
            const now = new Date();
            const diffMins = Math.max(0, Math.floor((etaDate.getTime() - now.getTime()) / 60000));
            setEtaMins(diffMins);
          }
        }
      } catch (error) {
        console.error('Failed to fetch prediction for map', error);
      }
    };

    fetchPrediction();
    const interval = setInterval(fetchPrediction, 30000);
    return () => clearInterval(interval);
  }, []);

  const navIcon = createNavIcon();

  const handleRecenter = () => {
    if (mapRef) {
      mapRef.flyTo(DEFAULT_POSITION, 14);
    }
  };

  return (
    <div id="driver-map-container" className="relative w-full h-full min-h-[calc(100vh-88px-72px)] bg-[#f7f7f7] overflow-hidden flex flex-col">
      {/* Airbnb Map Tile Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          background: #f7f7f7 !important;
          width: 100%;
          height: 100%;
          z-index: 0;
        }
        .leaflet-control-attribution { display: none !important; }
        .leaflet-control-zoom { display: none !important; }
      `}} />

      <MapContainer 
        center={DEFAULT_POSITION} 
        zoom={14} 
        scrollWheelZoom={true} 
        zoomControl={false}
        className="absolute inset-0 z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={DEFAULT_POSITION} icon={navIcon} />
        <MapController setMapRef={setMapRef} />
      </MapContainer>

      {/* Floating Route Information overlay */}
      <div className="absolute top-6 left-4 right-4 z-20 pointer-events-none">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/90 backdrop-blur-xl border border-[#dddddd] p-4 rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] pointer-events-auto">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className={`font-bold text-[12px] uppercase tracking-widest flex items-center gap-1.5 mb-1 ${prediction?.riskScore && prediction.riskScore > 60 ? 'text-[#ff385c]' : 'text-[#b25a00]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${prediction?.riskScore && prediction.riskScore > 60 ? 'bg-[#ff385c]' : 'bg-[#f2a600]'}`} /> 
                {prediction?.riskScore && prediction.riskScore > 80 ? 'High Risk Route' : 'Live Routing'}
              </span>
              <h2 className="text-[#222222] font-bold text-lg">Acme Corp Hub</h2>
            </div>
            <div className="text-right">
              <span className="text-[#222222] font-bold text-2xl block leading-none">{etaMins}</span>
              <span className="text-[#6a6a6a] font-bold text-[10px] uppercase tracking-widest">Mins</span>
            </div>
          </div>
          
          <div className="h-2 w-full bg-[#f7f7f7] rounded-full overflow-hidden">
             <div className="h-full bg-[#222222] w-[65%]" />
          </div>
          <div className="flex justify-between text-[12px] font-medium text-[#6a6a6a] mt-2 tracking-wide">
            <span>2.4 mi covered</span>
            <span>1.2 mi remaining</span>
          </div>
        </motion.div>
      </div>

      {/* Map Action Buttons */}
      <div className="absolute right-4 bottom-[120px] z-20 flex flex-col gap-3 pointer-events-none">
        <Button 
          onClick={() => {
            if (!document.fullscreenElement) {
              document.getElementById('driver-map-container')?.requestFullscreen().catch(() => {
                toast.error('Fullscreen not supported on this device');
              });
            } else {
              document.exitFullscreen();
            }
          }}
          variant="outline" 
          size="icon" 
          className="w-12 h-12 rounded-[14px] bg-white border-[#dddddd] text-[#222222] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-[#f7f7f7] pointer-events-auto"
        >
          <Scan className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="icon" className="w-12 h-12 rounded-[14px] bg-white border-[#dddddd] text-[#222222] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-[#f7f7f7] pointer-events-auto">
          <AlertTriangle className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="icon" className="w-12 h-12 rounded-[14px] bg-[#ff385c] border-none text-white shadow-[0_4px_12px_rgba(255,56,92,0.3)] hover:bg-[#e00b41] pointer-events-auto">
          <Route className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="absolute bottom-6 left-4 right-4 z-20 flex justify-between items-end pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl border border-[#dddddd] px-4 py-2.5 rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 rounded-[8px] bg-[#f7f7f7] flex items-center justify-center">
            <span className="text-[#222222] font-bold text-sm">{speed}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-widest">Speed</span>
            <span className="text-[10px] font-bold text-[#222222] uppercase tracking-widest">MPH</span>
          </div>
        </div>
        
        <button onClick={handleRecenter} className="bg-white/90 backdrop-blur-xl border border-[#dddddd] px-4 py-2.5 rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center gap-2 pointer-events-auto hover:bg-[#f7f7f7] transition-colors">
          <MapPin className="w-4 h-4 text-[#222222]" />
          <span className="text-[10px] font-bold text-[#222222] uppercase tracking-widest">Re-center</span>
        </button>
      </div>
    </div>
  );
}
