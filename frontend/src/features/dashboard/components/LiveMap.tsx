'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Maximize, Layers, Navigation2, Crosshair } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Custom Airbnb-style map pin using Lucide React icon rendered to HTML
const createCustomIcon = () => {
  const iconHtml = renderToString(
    <div className="relative flex flex-col items-center">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-[#ff385c] animate-ping opacity-50 w-12 h-12"></div>
        <div className="w-6 h-6 rounded-full bg-[#ff385c] border-[3px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] relative z-10" />
      </div>
      <div className="mt-1 bg-white border border-[#dddddd] px-3 py-1 rounded-full text-center shadow-[0_2px_8px_rgba(0,0,0,0.12)] whitespace-nowrap">
        <span className="text-[#222222] font-bold text-[12px] tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff385c] animate-pulse" />
          Live routing
        </span>
      </div>
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [120, 80],
    iconAnchor: [60, 24], // Anchored to the center of the red dot
  });
};

const DEFAULT_POSITION: [number, number] = [12.9716, 77.5946];

function MapController({ setMapRef }: { setMapRef: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    setMapRef(map);
  }, [map, setMapRef]);
  return null;
}

export function LiveMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_POSITION);
  const [zoom, setZoom] = useState(12);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tileLayer, setTileLayer] = useState("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!mapRef) return;
    const updateTelemetry = () => {
      const center = mapRef.getCenter();
      setMapCenter([center.lat, center.lng]);
      setZoom(mapRef.getZoom());
    };
    mapRef.on('moveend', updateTelemetry);
    mapRef.on('zoomend', updateTelemetry);
    return () => {
      mapRef.off('moveend', updateTelemetry);
      mapRef.off('zoomend', updateTelemetry);
    };
  }, [mapRef]);

  if (!isMounted) return null;

  const customIcon = createCustomIcon();

  const handleRecenter = () => {
    if (mapRef) {
      mapRef.flyTo(DEFAULT_POSITION, 12);
    }
  };

  const handleToggleLayer = () => {
    setTileLayer(prev => 
      prev.includes("light_all") 
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    );
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.getElementById('map-container')?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div id="map-container" className="relative w-full h-full bg-[#f7f7f7] rounded-[14px] overflow-hidden border border-[#dddddd] group">
      
      {/* Airbnb Map Tile Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          background: #f7f7f7 !important;
          width: 100%;
          height: 100%;
          border-radius: 14px;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
        .leaflet-control-zoom {
          display: none !important;
        }
      `}} />

      <MapContainer 
        center={DEFAULT_POSITION} 
        zoom={12} 
        scrollWheelZoom={true} 
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          url={tileLayer}
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
        />
        <Marker position={DEFAULT_POSITION} icon={customIcon} />
        <MapController setMapRef={setMapRef} />
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
        <button onClick={handleToggleLayer} className="w-10 h-10 rounded-[8px] bg-white border border-[#dddddd] text-[#222222] shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-[#f7f7f7] transition-all flex items-center justify-center">
          <Layers className="h-4 w-4" strokeWidth={2} />
        </button>
        <button onClick={handleRecenter} className="w-10 h-10 rounded-[8px] bg-white border border-[#dddddd] text-[#222222] shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-[#f7f7f7] transition-all flex items-center justify-center">
          <Crosshair className="h-4 w-4" strokeWidth={2} />
        </button>
        <button onClick={handleFullscreen} className="w-10 h-10 rounded-[8px] bg-white border border-[#dddddd] text-[#222222] shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-[#f7f7f7] transition-all flex items-center justify-center">
          <Maximize className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Telemetry Footer */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20 pointer-events-none">
        <div className="flex gap-2">
          <div className="bg-white/90 backdrop-blur-sm border border-[#dddddd] px-3 py-1.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.12)] flex items-center gap-2 pointer-events-auto">
            <Navigation2 className="w-3.5 h-3.5 text-[#222222]" strokeWidth={2} />
            <span className="text-[12px] font-bold text-[#222222]">{mapCenter[0].toFixed(4)}° N</span>
          </div>
          <div className="bg-white/90 backdrop-blur-sm border border-[#dddddd] px-3 py-1.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.12)] flex items-center gap-2 pointer-events-auto">
            <Navigation2 className="w-3.5 h-3.5 text-[#222222] rotate-90" strokeWidth={2} />
            <span className="text-[12px] font-bold text-[#222222]">{mapCenter[1].toFixed(4)}° E</span>
          </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm border border-[#dddddd] px-3 py-1.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.12)] flex items-center gap-2 pointer-events-auto">
          <span className="text-[12px] font-bold text-[#222222]">Zoom {Math.round(zoom)}x</span>
        </div>
      </div>
    </div>
  );
}
