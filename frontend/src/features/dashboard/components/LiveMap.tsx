'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Maximize, Crosshair, MapPin, Truck, Layers, Sun, Moon, Mountain, Globe, Satellite } from 'lucide-react';
import mapService, {
  MapWarehouse,
  MapShipment,
  MapVehicleLocation,
} from '@/services/map.service';
import { getCachedRoute, clearCachedRoute } from '@/lib/routeCache';

import 'leaflet/dist/leaflet.css';

type MapTheme = 'light' | 'dark';
type MapLayer = 'standard' | 'terrain' | 'satellite';

const TILE_LAYERS: Record<MapTheme, Record<MapLayer, { url: string; attribution: string }>> = {
  light: {
    standard: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
    },
  },
  dark: {
    standard: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    },
    terrain: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
    },
  },
};

function createDivIcon(html: string, size: [number, number], anchor?: [number, number]): L.DivIcon {
  return L.divIcon({
    html,
    className: '',
    iconSize: size,
    iconAnchor: anchor || [size[0] / 2, size[1]],
  });
}

const HUB_ICON = createDivIcon(
  `<div style="width:40px;height:40px;border-radius:10px;background:#222;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.35)">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  </div>`,
  [40, 50],
  [20, 50]
);

const HUB_ICON_HOVER = createDivIcon(
  `<div style="width:48px;height:48px;border-radius:10px;background:#00a651;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,166,81,0.45);transform:scale(1.1)">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  </div>`,
  [48, 58],
  [24, 58]
);

const iconCache = new Map<string, L.DivIcon>();
function vehicleIcon(color: string, size: number): L.DivIcon {
  const key = `${color}-${size}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = createDivIcon(
      `<div style="width:${size}px;height:${size}px;border-radius:8px;border:2px solid white;background:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3)">
        <svg width="${size * 0.55}" height="${size * 0.55}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      </div>`,
      [size, size + 6],
      [size / 2, size + 6]
    );
    iconCache.set(key, icon);
  }
  return icon;
}

function AutoFitBounds({ bounds }: { bounds: { lat: number; lng: number }[] | null }) {
  const map = useMap();
  const hasFitted = useRef(false);
  useEffect(() => {
    if (map && bounds && bounds.length >= 2 && !hasFitted.current) {
      hasFitted.current = true;
      const latLngs = bounds.map((b) => L.latLng(b.lat, b.lng) as L.LatLngExpression);
      map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

function RoutePolylines({
  shipments,
  hoveredRouteId,
  onRouteHover,
  rerouteShipmentId,
  onRerouteComplete,
  theme,
}: {
  shipments: MapShipment[];
  hoveredRouteId: string | null;
  onRouteHover: (id: string | null) => void;
  rerouteShipmentId: string | null;
  onRerouteComplete: () => void;
  theme: MapTheme;
}) {
  const map = useMap();
  const layersMapRef = useRef<Map<string, L.Polyline>>(new Map());
  const hitLayersMapRef = useRef<Map<string, L.Polyline>>(new Map());
  const fetchedRef = useRef<Set<string>>(new Set());
  const cacheRef = useRef<Map<string, L.LatLng[]>>(new Map());
  const [routeTick, setRouteTick] = useState(0);

  useEffect(() => {
    if (!map) return;

    const activeShipments = shipments.filter(
      (s) => (s.status === 'in_transit' || s.status === 'delayed') && s.originCoordinates && s.destinationCoordinates
    );

    const toFetch = activeShipments.filter((s) => !fetchedRef.current.has(s._id));
    toFetch.forEach((s) => fetchedRef.current.add(s._id));

    if (toFetch.length === 0) return;

    Promise.all(
      toFetch.map((shipment) => {
        const origCoords = shipment.originCoordinates!;
        const destCoords = shipment.destinationCoordinates!;
        const origin = { lat: origCoords[1], lng: origCoords[0] };
        const destination = { lat: destCoords[1], lng: destCoords[0] };
        return getCachedRoute(origin, destination, (o, d) => mapService.getRoute(o, d))
          .then((path) => {
            cacheRef.current.set(shipment._id, path.map((p) => L.latLng(p.lat, p.lng)));
          });
      })
    ).then(() => {
      setRouteTick((t) => t + 1);
    });
  }, [map, shipments]);

  useEffect(() => {
    if (!map) return;

    const activeShipments = shipments.filter(
      (s) => (s.status === 'in_transit' || s.status === 'delayed') && s.originCoordinates && s.destinationCoordinates
    );

    const activeIds = new Set(activeShipments.map(s => s._id));
    for (const [id, polyline] of layersMapRef.current.entries()) {
      if (!activeIds.has(id)) {
        polyline.remove();
        layersMapRef.current.delete(id);
      }
    }
    for (const [id, hitPolyline] of hitLayersMapRef.current.entries()) {
      if (!activeIds.has(id)) {
        hitPolyline.remove();
        hitLayersMapRef.current.delete(id);
      }
    }

    activeShipments.forEach((shipment) => {
      const cachedPath = cacheRef.current.get(shipment._id);
      if (!cachedPath) return;

      const isHovered = hoveredRouteId === shipment._id;
      const isDimmed = hoveredRouteId && hoveredRouteId !== shipment._id;

      const color = shipment.status === 'delayed' ? '#ff385c' : theme === 'dark' ? '#aaaaaa' : '#888888';
      const weight = isHovered ? 5 : 2;
      const opacity = isDimmed ? 0.2 : 1;
      const dashArray = shipment.status === 'delayed' ? undefined : '8, 8';

      // 1. Visible Line (Not interactive)
      let polyline = layersMapRef.current.get(shipment._id);
      if (!polyline) {
        polyline = L.polyline(cachedPath, {
          color,
          weight,
          opacity,
          dashArray,
          className: 'route-line',
          interactive: false,
        }).addTo(map);

        layersMapRef.current.set(shipment._id, polyline);
      } else {
        polyline.setStyle({ color, weight, opacity, dashArray });
        const currentLatLngs = polyline.getLatLngs() as L.LatLng[];
        if (currentLatLngs.length !== cachedPath.length) {
          polyline.setLatLngs(cachedPath);
        }
      }

      // 2. Invisible Hit-Detection Line (Wide and interactive)
      let hitPolyline = hitLayersMapRef.current.get(shipment._id);
      if (!hitPolyline) {
        hitPolyline = L.polyline(cachedPath, {
          color: 'transparent',
          weight: 24, // 24px wide hit area
          opacity: 0,
          interactive: true,
        }).addTo(map);

        hitPolyline.on('mouseover', () => onRouteHover(shipment._id));
        hitPolyline.on('mouseout', () => onRouteHover(null));

        const el = hitPolyline.getElement();
        if (el) (el as HTMLElement).style.cursor = 'pointer';

        hitLayersMapRef.current.set(shipment._id, hitPolyline);
      } else {
        const currentLatLngs = hitPolyline.getLatLngs() as L.LatLng[];
        if (currentLatLngs.length !== cachedPath.length) {
          hitPolyline.setLatLngs(cachedPath);
        }
      }
    });
  }, [map, shipments, hoveredRouteId, onRouteHover, theme, routeTick]);

  useEffect(() => {
    return () => {
      for (const polyline of layersMapRef.current.values()) {
        polyline.remove();
      }
      layersMapRef.current.clear();
      
      for (const hitPolyline of hitLayersMapRef.current.values()) {
        hitPolyline.remove();
      }
      hitLayersMapRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!map || !rerouteShipmentId) return;

    const shipment = shipments.find((s) => s._id === rerouteShipmentId);
    if (!shipment || !shipment.originCoordinates || !shipment.destinationCoordinates) {
      onRerouteComplete();
      return;
    }

    const origCoords = shipment.originCoordinates;
    const destCoords = shipment.destinationCoordinates;
    const origin = { lat: origCoords[1], lng: origCoords[0] };
    const destination = { lat: destCoords[1], lng: destCoords[0] };

    clearCachedRoute(origin, destination);
    fetchedRef.current.delete(rerouteShipmentId);

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=false`;

    fetch(osrmUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const coords: [number, number][] = data.routes[0].geometry.coordinates;
          cacheRef.current.set(rerouteShipmentId, coords.map((c) => L.latLng(c[1], c[0])));
        } else {
          const fallback = [L.latLng(origin.lat, origin.lng), L.latLng(destination.lat, destination.lng)];
          cacheRef.current.set(rerouteShipmentId, fallback);
        }
        setRouteTick((t) => t + 1);
      })
      .catch(() => {
        const fallback = [L.latLng(origin.lat, origin.lng), L.latLng(destination.lat, destination.lng)];
        cacheRef.current.set(rerouteShipmentId, fallback);
        setRouteTick((t) => t + 1);
      })
      .finally(() => {
        onRerouteComplete();
      });
  }, [map, rerouteShipmentId, shipments, onRerouteComplete]);

  return null;
}

function CaptureMapRef({ onMap }: { onMap: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (map) onMap(map);
  }, [map, onMap]);
  return null;
}

function LayerPanel({
  theme,
  setTheme,
  layer,
  setLayer,
}: {
  theme: MapTheme;
  setTheme: (t: MapTheme) => void;
  layer: MapLayer;
  setLayer: (l: MapLayer) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-[8px] bg-white border border-[#dddddd] text-[#222222] shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-[#f7f7f7] transition-all flex items-center justify-center"
      >
        <Layers className="h-4 w-4" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute top-0 right-12 bg-white rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-[#dddddd] p-3 w-[180px] z-[1002]">
          <div className="text-[11px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-2">Theme</div>
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-[12px] font-bold transition-all ${
                theme === 'light'
                  ? 'bg-[#222] text-white'
                  : 'bg-[#f7f7f7] text-[#6a6a6a] hover:bg-[#eeeeee]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" strokeWidth={2} />
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-[12px] font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-[#222] text-white'
                  : 'bg-[#f7f7f7] text-[#6a6a6a] hover:bg-[#eeeeee]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" strokeWidth={2} />
              Dark
            </button>
          </div>

          <div className="text-[11px] font-bold text-[#6a6a6a] uppercase tracking-wider mb-2">Layers</div>
          <div className="space-y-1">
            {([
              { key: 'standard' as MapLayer, icon: Globe, label: 'Standard' },
              { key: 'terrain' as MapLayer, icon: Mountain, label: 'Terrain' },
              { key: 'satellite' as MapLayer, icon: Satellite, label: 'Satellite' },
            ]).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setLayer(key)}
                className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-[6px] text-[12px] font-bold transition-all ${
                  layer === key
                    ? 'bg-[#222] text-white'
                    : 'text-[#6a6a6a] hover:bg-[#f7f7f7]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LiveMap({ mode = 'dashboard' }: { mode?: 'dashboard' | 'fleet' }) {
  const [warehouses, setWarehouses] = useState<MapWarehouse[]>([]);
  const [shipments, setShipments] = useState<MapShipment[]>([]);
  const [vehicles, setVehicles] = useState<MapVehicleLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [hoveredWarehouseId, setHoveredWarehouseId] = useState<string | null>(null);
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);
  const [rerouteShipmentId, setRerouteShipmentId] = useState<string | null>(null);
  const [rerouting, setRerouting] = useState(false);
  const [bounds, setBounds] = useState<{ lat: number; lng: number }[] | null>(null);
  const [theme, setTheme] = useState<MapTheme>('light');
  const [layer, setLayer] = useState<MapLayer>('standard');
  const isFetching = useRef(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (isFetching.current) return;
    isFetching.current = true;

    const fetchData = async () => {
      try {
        if (mode === 'fleet') {
          const vehicleData = await mapService.getVehicleLocations();
          setVehicles(vehicleData.vehicles);
          if (vehicleData.vehicles.length > 0) {
            setBounds(vehicleData.vehicles.map((v) => ({ lat: v.location.lat, lng: v.location.lng })));
          }
        } else {
          const [overview, vehicleData] = await Promise.all([
            mapService.getOverview(),
            mapService.getVehicleLocations(),
          ]);
          setWarehouses(overview.warehouses);
          setShipments(overview.shipments);
          setVehicles(vehicleData.vehicles);

          const allCoords: { lat: number; lng: number }[] = [];
          overview.warehouses.forEach((w) => {
            if (w.coordinates) allCoords.push({ lat: w.coordinates[1], lng: w.coordinates[0] });
          });
          vehicleData.vehicles.forEach((v) => {
            allCoords.push({ lat: v.location.lat, lng: v.location.lng });
          });
          if (allCoords.length > 0) setBounds(allCoords);
        }
      } catch (err) {
        console.error('Map data fetch failed:', err);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    const el = document.getElementById('dashboard-map');
    if (!el) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          try {
            // Leaflet can sometimes throw if invalidated before fully initialized or after unmount
            mapRef.current?.invalidateSize();
          } catch (err) {
            // ignore
          }
        }, 50);
      }
    });
    
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.getElementById('dashboard-map')?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const hoveredShipment = useMemo(
    () => shipments.find((s) => s._id === hoveredRouteId),
    [shipments, hoveredRouteId]
  );

  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const tile = TILE_LAYERS[theme][layer];

  return (
    <div
      id="dashboard-map"
      className="relative w-full h-full bg-[#f7f7f7] rounded-[14px] overflow-hidden border border-[#dddddd] group"
      style={{ isolation: 'isolate' }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={5}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer key={`${theme}-${layer}`} url={tile.url} attribution={tile.attribution} />
        <CaptureMapRef onMap={(m) => { mapRef.current = m; }} />
        <AutoFitBounds bounds={bounds} />

        {mode === 'dashboard' && (
          <>
            {warehouses
              .filter((w) => w.coordinates)
              .map((w) => (
                <Marker
                  key={`hub-${w._id}`}
                  position={[w.coordinates![1], w.coordinates![0]]}
                  icon={hoveredWarehouseId === w._id ? HUB_ICON_HOVER : HUB_ICON}
                  eventHandlers={{
                    mouseover: () => setHoveredWarehouseId(w._id),
                    mouseout: () => setHoveredWarehouseId(null),
                  }}
                />
              ))}

            <RoutePolylines
              shipments={shipments}
              hoveredRouteId={hoveredRouteId}
              onRouteHover={setHoveredRouteId}
              rerouteShipmentId={rerouteShipmentId}
              onRerouteComplete={() => { setRerouteShipmentId(null); setRerouting(false); }}
              theme={theme}
            />

            {vehicles.map((v) => {
              const color =
                v.shipmentStatus === 'delayed' ? '#ff385c' :
                v.status === 'in_use' ? '#0066cc' :
                v.status === 'maintenance' ? '#f2a600' : '#00a651';
              const size = hoveredVehicleId === v._id ? 40 : 34;
              return (
                <Marker
                  key={`dv-${v._id}`}
                  position={[v.location.lat, v.location.lng]}
                  icon={vehicleIcon(color, size)}
                  eventHandlers={{
                    mouseover: () => setHoveredVehicleId(v._id),
                    mouseout: () => setHoveredVehicleId(null),
                  }}
                />
              );
            })}
          </>
        )}

        {mode === 'fleet' &&
          vehicles.map((v) => {
            const color = v.shipmentStatus === 'delayed' ? '#ff385c' : '#00a651';
            const size = hoveredVehicleId === v._id ? 40 : 34;
            return (
              <Marker
                key={`fv-${v._id}`}
                position={[v.location.lat, v.location.lng]}
                icon={vehicleIcon(color, size)}
                eventHandlers={{
                  mouseover: () => setHoveredVehicleId(v._id),
                  mouseout: () => setHoveredVehicleId(null),
                }}
              />
            );
          })}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <LayerPanel theme={theme} setTheme={setTheme} layer={layer} setLayer={setLayer} />
        <button
          onClick={() => {
            if (mapRef.current && bounds && bounds.length >= 2) {
              const latLngs = bounds.map((b) => L.latLng(b.lat, b.lng) as L.LatLngExpression);
              mapRef.current.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
            }
          }}
          className="w-10 h-10 rounded-[8px] bg-white border border-[#dddddd] text-[#222222] shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-[#f7f7f7] transition-all flex items-center justify-center"
        >
          <Crosshair className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          onClick={handleFullscreen}
          className="w-10 h-10 rounded-[8px] bg-white border border-[#dddddd] text-[#222222] shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-[#f7f7f7] transition-all flex items-center justify-center"
        >
          <Maximize className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Left-side Re-route button */}
      {!loading && (
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => {
              if (rerouting || !hoveredRouteId) return;
              setRerouting(true);
              setRerouteShipmentId(hoveredRouteId);
            }}
            disabled={rerouting || !hoveredRouteId}
            className={`flex items-center gap-2 px-3 h-10 rounded-[8px] border shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-all text-[12px] font-bold ${
              rerouting
                ? 'bg-[#f0f0f0] border-[#ddd] text-[#999] cursor-wait'
                : !hoveredRouteId
                  ? theme === 'dark'
                    ? 'bg-[#1a1a2e] border-[#333] text-[#555] cursor-default'
                    : 'bg-white border-[#dddddd] text-[#bbb] cursor-default'
                  : theme === 'dark'
                    ? 'bg-[#1a1a2e] border-[#333] text-white hover:bg-[#252540]'
                    : 'bg-white border-[#dddddd] text-[#222222] hover:bg-[#f7f7f7]'
            }`}
            title="Re-route with OSRM (OpenStreetMap)"
          >
            {rerouting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6" />
                <path d="M21.34 15.57a10 10 0 1 1-.57-8.38L21.5 8" />
              </svg>
            )}
            {rerouting ? 'Re-routing...' : 'Re-route'}
          </button>
        </div>
      )}

      {/* Legend */}
      {mode === 'dashboard' && !loading && (
        <div className={`absolute bottom-4 left-4 z-[1000] ${theme === 'dark' ? 'bg-[#1a1a2e]/95 border-[#333]' : 'bg-white/95 border-[#dddddd]'} backdrop-blur-sm border rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] px-4 py-3 pointer-events-none`}>
          <div className={`flex items-center gap-5 text-[11px] font-bold ${theme === 'dark' ? 'text-[#ccc]' : 'text-[#222222]'}`}>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-[4px] bg-[#222] flex items-center justify-center shadow-sm">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              Hub
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-[#888888] rounded" style={{ borderTop: '2px dashed #888' }} />
              In Transit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-[#ff385c] rounded" />
              Delayed
            </span>
          </div>
        </div>
      )}

      {mode === 'fleet' && !loading && (
        <div className={`absolute bottom-4 left-4 z-[1000] ${theme === 'dark' ? 'bg-[#1a1a2e]/95 border-[#333]' : 'bg-white/95 border-[#dddddd]'} backdrop-blur-sm border rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] px-4 py-3 pointer-events-none`}>
          <div className={`flex items-center gap-5 text-[11px] font-bold ${theme === 'dark' ? 'text-[#ccc]' : 'text-[#222222]'}`}>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[3px] bg-[#00a651] border border-white shadow-sm" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[3px] bg-[#0066cc] border border-white shadow-sm" />
              In Use
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[3px] bg-[#f2a600] border border-white shadow-sm" />
              Maintenance
            </span>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-[14px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#222222] border-t-transparent rounded-full animate-spin" />
            <span className="text-[12px] font-bold text-[#6a6a6a] tracking-tight">Loading map data...</span>
          </div>
        </div>
      )}

      {/* Hover cards - clipped within map bounds */}
      <div className="absolute inset-0 z-[999] overflow-hidden pointer-events-none">
        {hoveredRouteId && hoveredShipment && (
          <MapHoverCard shipment={hoveredShipment} theme={theme} />
        )}

        {hoveredWarehouseId && (() => {
          const wh = warehouses.find(w => w._id === hoveredWarehouseId);
          if (!wh) return null;
          return <HubHoverCard warehouse={wh} theme={theme} />;
        })()}

        {hoveredVehicleId && (() => {
          const v = vehicles.find(v => v._id === hoveredVehicleId);
          if (!v) return null;
          return <VehicleHoverCard vehicle={v} theme={theme} />;
        })()}
      </div>
    </div>
  );
}

function VehicleHoverCard({ vehicle, theme }: { vehicle: MapVehicleLocation; theme: MapTheme }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    available: { bg: '#e6f7e6', text: '#008a05' },
    in_use: { bg: '#e6f0ff', text: '#0066cc' },
    maintenance: { bg: '#fff8e6', text: '#f2a600' },
  };
  const sc = statusColors[vehicle.status] || { bg: '#f7f7f7', text: '#6a6a6a' };

  const shipmentColors: Record<string, { bg: string; text: string }> = {
    in_transit: { bg: '#e6f7e6', text: '#008a05' },
    delayed: { bg: '#fff0f3', text: '#ff385c' },
  };
  const shc = vehicle.shipmentStatus ? shipmentColors[vehicle.shipmentStatus] || null : null;
  const cardBg = theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#333]' : 'border-[#dddddd]';
  const textColor = theme === 'dark' ? 'text-[#eee]' : 'text-[#222]';
  const mutedColor = theme === 'dark' ? 'text-[#999]' : 'text-[#6a6a6a]';

  return (
    <div className="absolute pointer-events-none" style={{ left: '50%', top: 16, transform: 'translateX(-50%)' }}>
      <div className={`${cardBg} rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] border ${borderColor} p-4 w-[280px]`} style={{ animation: 'fadeIn 0.15s ease-out' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: sc.text }}>
              <Truck size={18} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <div className={`text-[14px] font-bold leading-tight ${textColor}`}>{vehicle.vehicleNumber}</div>
              <div className={`text-[11px] ${mutedColor} font-semibold capitalize`}>{vehicle.type}</div>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: sc.bg, color: sc.text }}>
            <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: sc.text }} />
            {vehicle.status.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-2 text-[12px]">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Health Score</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${vehicle.healthScore}%`, backgroundColor: vehicle.healthScore >= 80 ? '#00a651' : vehicle.healthScore >= 50 ? '#f2a600' : '#ff385c' }} />
              </div>
              <span className={`font-bold ${textColor}`}>{vehicle.healthScore}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Fuel Type</span>
            <span className={`font-bold capitalize ${textColor}`}>{vehicle.fuelType}</span>
          </div>

          {vehicle.trackingNumber && (
            <div className={`flex items-center justify-between pt-2 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#f0f0f0]'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Shipment</span>
              <span className={`font-bold ${textColor}`}>{vehicle.trackingNumber}</span>
            </div>
          )}

          {shc && (
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: shc.bg, color: shc.text }}>
                <span className="w-1.5 h-1.5 rounded-full mr-1 animate-pulse" style={{ backgroundColor: shc.text }} />
                {vehicle.shipmentStatus === 'in_transit' ? 'In Transit' : 'Delayed'}
              </span>
            </div>
          )}

          {vehicle.destinationAddress && (
            <div className={`flex items-start gap-2 pt-2 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#f0f0f0]'}`}>
              <MapPin size={12} className={`${mutedColor} mt-0.5 flex-shrink-0`} />
              <span className={`${mutedColor} leading-snug text-[11px]`}>{vehicle.destinationAddress}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MapHoverCard({ shipment, theme }: { shipment: MapShipment; theme: MapTheme }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    in_transit: { bg: '#e6f7e6', text: '#008a05' },
    delayed: { bg: '#fff0f3', text: '#ff385c' },
  };
  const sc = statusColors[shipment.status] || { bg: '#f7f7f7', text: '#6a6a6a' };

  const priorityColors: Record<string, string> = {
    critical: '#ff385c',
    high: '#f2a600',
    medium: '#0066cc',
    low: '#888888',
  };

  const cardBg = theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#333]' : 'border-[#dddddd]';
  const textColor = theme === 'dark' ? 'text-[#eee]' : 'text-[#222]';
  const mutedColor = theme === 'dark' ? 'text-[#999]' : 'text-[#6a6a6a]';

  return (
    <div className="absolute pointer-events-none" style={{ left: '50%', top: 16, transform: 'translateX(-50%)' }}>
      <div className={`${cardBg} rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] border ${borderColor} p-4 w-[300px]`} style={{ animation: 'fadeIn 0.15s ease-out' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: sc.bg, color: sc.text }}>
              <span className="w-1.5 h-1.5 rounded-full mr-1 animate-pulse" style={{ backgroundColor: sc.text }} />
              {shipment.status === 'in_transit' ? 'In Transit' : 'Delayed'}
            </span>
            {shipment.priority && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: `${priorityColors[shipment.priority]}15`, color: priorityColors[shipment.priority] }}>
                {shipment.priority}
              </span>
            )}
          </div>
          {shipment.riskScore > 0 && (
            <span className={`text-[11px] font-bold ${mutedColor}`}>Risk: {shipment.riskScore}%</span>
          )}
        </div>

        <div className={`text-[15px] font-bold mb-2 ${textColor}`}>{shipment.trackingNumber}</div>

        <div className={`flex items-center gap-2 text-[12px] ${mutedColor} mb-3`}>
          <span className={`font-semibold ${textColor}`}>{shipment.originName || 'Origin'}</span>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path d="M1 5h13M11 1l4 4-4 4" stroke={theme === 'dark' ? '#999' : '#222'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={`font-semibold ${textColor}`}>{shipment.destName || 'Dest'}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div>
            <span className={`${mutedColor} text-[10px] font-bold uppercase tracking-wider`}>Distance</span>
            <br />
            <span className={`font-bold ${textColor}`}>{shipment.distanceKm} km</span>
          </div>
          <div>
            <span className={`${mutedColor} text-[10px] font-bold uppercase tracking-wider`}>Vehicle</span>
            <br />
            <span className={`font-bold ${textColor}`}>{shipment.vehicle?.vehicleNumber || '\u2014'}</span>
          </div>
          <div>
            <span className={`${mutedColor} text-[10px] font-bold uppercase tracking-wider`}>Driver</span>
            <br />
            <span className={`font-bold ${textColor}`}>{shipment.driver?.name || '\u2014'}</span>
          </div>
          <div>
            <span className={`${mutedColor} text-[10px] font-bold uppercase tracking-wider`}>Packages</span>
            <br />
            <span className={`font-bold ${textColor}`}>{shipment.packageCount}</span>
          </div>
        </div>

        <div className={`flex gap-4 mt-3 pt-3 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#f0f0f0]'} text-[11px] ${mutedColor}`}>
          <span>{shipment.weightKg} kg</span>
          <span>{shipment.packageCount} packages</span>
        </div>
      </div>
    </div>
  );
}

function HubHoverCard({ warehouse, theme }: { warehouse: MapWarehouse; theme: MapTheme }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: '#e6f7e6', text: '#008a05' },
    inactive: { bg: '#fff0f3', text: '#ff385c' },
    maintenance: { bg: '#fff8e6', text: '#f2a600' },
  };
  const sc = statusColors[warehouse.status] || { bg: '#f7f7f7', text: '#6a6a6a' };
  const cardBg = theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#333]' : 'border-[#dddddd]';
  const textColor = theme === 'dark' ? 'text-[#eee]' : 'text-[#222]';
  const mutedColor = theme === 'dark' ? 'text-[#999]' : 'text-[#6a6a6a]';

  return (
    <div className="absolute pointer-events-none" style={{ left: '50%', top: 16, transform: 'translateX(-50%)' }}>
      <div className={`${cardBg} rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] border ${borderColor} p-4 w-[280px]`} style={{ animation: 'fadeIn 0.15s ease-out' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#222] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div className={`text-[14px] font-bold leading-tight ${textColor}`}>{warehouse.name}</div>
            <div className={`text-[11px] ${mutedColor} font-semibold`}>{warehouse.code}</div>
          </div>
        </div>

        <div className="space-y-2 text-[12px]">
          <div className="flex items-start gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? '#999' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className={`${mutedColor} leading-snug`}>{warehouse.address}</span>
          </div>

          <div className={`flex items-center justify-between pt-2 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-[#f0f0f0]'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedColor}`}>Status</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: sc.bg, color: sc.text }}>
              <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: sc.text }} />
              {warehouse.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
