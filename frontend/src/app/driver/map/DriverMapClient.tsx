'use client';

import { MapPin, Navigation2, AlertTriangle, Route, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import shipmentService, { Shipment } from '@/services/shipment.service';
import warehouseService, { Warehouse } from '@/services/warehouse.service';
import { predictionService, PredictionResult } from '@/services/prediction.service';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function createDivIcon(html: string, size: [number, number], anchor?: [number, number]): L.DivIcon {
  return L.divIcon({ html, className: '', iconSize: size, iconAnchor: anchor || [size[0] / 2, size[1]] });
}

const ORIGIN_ICON = createDivIcon(
  `<div style="width:32px;height:32px;border-radius:50%;background:#222222;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  </div>`,
  [32, 32],
  [16, 16]
);

const DEST_ICON = createDivIcon(
  `<div style="width:32px;height:32px;border-radius:50%;background:#ff385c;border:3px solid white;box-shadow:0 2px 8px rgba(255,56,92,0.3);display:flex;align-items:center;justify-content:center">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  [32, 32],
  [16, 16]
);

const NAV_ICON = createDivIcon(
  `<div style="position:relative;display:flex;align-items:center;justify-content:center">
    <div style="width:56px;height:56px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:1px solid #dddddd">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff385c" stroke="#ff385c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
    </div>
  </div>`,
  [56, 56],
  [28, 28]
);

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function interpolatePosition(
  origin: [number, number],
  destination: [number, number],
  progress: number
): [number, number] {
  const t = Math.max(0, Math.min(1, progress));
  return [
    origin[0] + (destination[0] - origin[0]) * t,
    origin[1] + (destination[1] - origin[1]) * t,
  ];
}

function RoutePolylines({
  originCoords,
  destCoords,
  currentPos,
}: {
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  currentPos: [number, number] | null;
}) {
  const map = useMap();
  const layersRef = useRef<L.Polyline[]>([]);

  useEffect(() => {
    if (!map) return;
    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];

    if (originCoords && destCoords) {
      const fullPath = L.polyline(
        [originCoords, destCoords],
        { color: '#dddddd', weight: 4, opacity: 0.8 }
      ).addTo(map);
      layersRef.current.push(fullPath);
    }

    if (originCoords && currentPos) {
      const traveledPath = L.polyline(
        [originCoords, currentPos],
        { color: '#222222', weight: 4, opacity: 1 }
      ).addTo(map);
      layersRef.current.push(traveledPath);
    }

    return () => {
      layersRef.current.forEach((l) => l.remove());
      layersRef.current = [];
    };
  }, [map, originCoords, destCoords, currentPos]);

  return null;
}

export default function DriverMapClient() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [speed] = useState<number>(45);
  const isFetching = useRef(false);

  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      try {
        const shipmentsData = await shipmentService.getAll({ limit: 50 });
        const active = shipmentsData.shipments.find(
          (s) => s.status === 'in_transit' || s.status === 'delayed'
        );

        if (active) {
          setActiveShipment(active);

          if (active.destinationLocation?.coordinates) {
            const dc = active.destinationLocation.coordinates;
            setDestCoords([dc[1], dc[0]]);
          }

          if (active.originWarehouseId) {
            try {
              const wh = await warehouseService.getById(active.originWarehouseId);
              if (wh.location?.coordinates) {
                setOriginCoords([wh.location.coordinates[1], wh.location.coordinates[0]]);
              }
            } catch {
              setOriginCoords([12.9716, 77.5946]);
            }
          } else {
            setOriginCoords([12.9716, 77.5946]);
          }

          try {
            const pred = await predictionService.getPrediction(active._id);
            setPrediction(pred);
          } catch {
            // Continue without prediction
          }
        }
      } catch (error) {
        console.error('Failed to fetch map data', error);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!originCoords || !destCoords) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.005;
        if (next >= 1) return 0;
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [originCoords, destCoords]);

  useEffect(() => {
    if (originCoords && destCoords) {
      setCurrentPos(interpolatePosition(originCoords, destCoords, progress));
    }
  }, [progress, originCoords, destCoords]);

  const totalDistance = activeShipment?.distanceKm || 0;
  const distanceCovered = totalDistance * progress;
  const distanceRemaining = totalDistance - distanceCovered;

  const etaMins = prediction?.predictedETA
    ? Math.max(0, Math.floor((new Date(prediction.predictedETA).getTime() - Date.now()) / 60000))
    : Math.ceil((distanceRemaining / (speed || 45)) * 60);

  const defaultCenter: [number, number] = currentPos || originCoords || destCoords || [20.5937, 78.9629];

  return (
    <div id="driver-map-container" className="relative w-full h-full min-h-[calc(100vh-88px-72px)] bg-[#f7f7f7] overflow-hidden flex flex-col">
      <MapContainer center={defaultCenter} zoom={12} className="absolute inset-0 z-0 w-full h-full" zoomControl={false}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        <MapController center={defaultCenter} zoom={13} />

        {originCoords && <Marker position={originCoords} icon={ORIGIN_ICON} />}
        {destCoords && <Marker position={destCoords} icon={DEST_ICON} />}
        {currentPos && <Marker position={currentPos} icon={NAV_ICON} />}

        <RoutePolylines
          originCoords={originCoords}
          destCoords={destCoords}
          currentPos={currentPos}
        />
      </MapContainer>

      {/* Floating Route Information overlay */}
      <div className="absolute top-6 left-4 right-4 z-[1000] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl border border-[#dddddd] p-4 rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] pointer-events-auto transition-all duration-300">
          {loading ? (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-[#f7f7f7] animate-pulse" />
                  <div className="h-5 w-36 rounded bg-[#f7f7f7] animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-8 w-12 rounded bg-[#f7f7f7] animate-pulse" />
                  <div className="h-2 w-10 rounded bg-[#f7f7f7] animate-pulse ml-auto" />
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-[#f7f7f7] animate-pulse" />
              <div className="flex justify-between">
                <div className="h-3 w-20 rounded bg-[#f7f7f7] animate-pulse" />
                <div className="h-3 w-24 rounded bg-[#f7f7f7] animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span
                    className={`font-bold text-[12px] uppercase tracking-widest flex items-center gap-1.5 mb-1 ${
                      prediction?.riskScore && prediction.riskScore > 60
                        ? 'text-[#ff385c]'
                        : 'text-[#b25a00]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        prediction?.riskScore && prediction.riskScore > 60
                          ? 'bg-[#ff385c]'
                          : 'bg-[#f2a600]'
                      }`}
                    />
                    {prediction?.riskScore && prediction.riskScore > 80 ? 'High Risk Route' : 'Live Routing'}
                  </span>
                  <h2 className="text-[#222222] font-bold text-lg">
                    {activeShipment?.destinationAddress || 'No Active Shipment'}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-[#222222] font-bold text-2xl block leading-none">{etaMins}</span>
                  <span className="text-[#6a6a6a] font-bold text-[10px] uppercase tracking-widest">Mins</span>
                </div>
              </div>

              <div className="h-2 w-full bg-[#f7f7f7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#222222] transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[12px] font-medium text-[#6a6a6a] mt-2 tracking-wide">
                <span>{distanceCovered.toFixed(1)} km covered</span>
                <span>{distanceRemaining.toFixed(1)} km remaining</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map Action Buttons */}
      <div className="absolute right-4 bottom-[120px] z-[1000] flex flex-col gap-3 pointer-events-none">
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
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-[14px] bg-white border-[#dddddd] text-[#222222] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-[#f7f7f7] pointer-events-auto"
        >
          <AlertTriangle className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-[14px] bg-[#ff385c] border-none text-white shadow-[0_4px_12px_rgba(255,56,92,0.3)] hover:bg-[#e00b41] pointer-events-auto"
        >
          <Route className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="absolute bottom-6 left-4 right-4 z-[1000] flex justify-between items-end pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl border border-[#dddddd] px-4 py-2.5 rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 rounded-[8px] bg-[#f7f7f7] flex items-center justify-center">
            <span className="text-[#222222] font-bold text-sm">{speed}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-widest">Speed</span>
            <span className="text-[10px] font-bold text-[#222222] uppercase tracking-widest">KM/H</span>
          </div>
        </div>

        {currentPos && (
          <button
            onClick={() => {
              const mapEl = document.querySelector('.leaflet-container');
              if (mapEl) {
                const map = (mapEl as any)._leaflet_map;
                if (map) map.setView(currentPos, 13);
              }
            }}
            className="bg-white/90 backdrop-blur-xl border border-[#dddddd] px-4 py-2.5 rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center gap-2 pointer-events-auto hover:bg-[#f7f7f7] transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#222222]" />
            <span className="text-[10px] font-bold text-[#222222] uppercase tracking-widest">Re-center</span>
          </button>
        )}
      </div>
    </div>
  );
}
