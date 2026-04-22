import { useEffect, useRef } from 'react';
import type { Map, Marker, TileLayer } from 'leaflet';
import { HiOutlineLocationMarker, HiOutlineCursorClick } from 'react-icons/hi';

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}

// Leaflet CSS is injected once via this module
let cssInjected = false;
function ensureLeafletCss() {
  if (cssInjected) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  cssInjected = true;
}

// Colombia center as default
const DEFAULT_LAT = 4.5709;
const DEFAULT_LNG = -74.2973;
const DEFAULT_ZOOM = 6;
const PLACED_ZOOM = 15;

export function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const tileRef = useRef<TileLayer | null>(null);

  useEffect(() => {
    ensureLeafletCss();

    // Lazy-load leaflet only when component mounts
    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return;

      const initialLat = lat ?? DEFAULT_LAT;
      const initialLng = lng ?? DEFAULT_LNG;
      const initialZoom = lat && lng ? PLACED_ZOOM : DEFAULT_ZOOM;

      const map = L.map(containerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: true,
        attributionControl: false,
      });
      mapRef.current = map;

      tileRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ).addTo(map);

      // Place initial marker if coordinates exist
      if (lat && lng) {
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;background:#2563eb;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
      }

      map.on('click', (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;

        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        // Add new marker
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;background:#2563eb;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        markerRef.current = L.marker([clickLat, clickLng], { icon }).addTo(map);

        onChange(clickLat, clickLng);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker when lat/lng change externally (e.g. geolocate button)
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then((L) => {
      if (!mapRef.current) return;
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (lat && lng) {
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;background:#2563eb;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        markerRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current);
        mapRef.current.setView([lat, lng], PLACED_ZOOM);
      }
    });
  }, [lat, lng]);

  return (
    <div className="space-y-1.5">
      <div
        ref={containerRef}
        className="w-full rounded-control overflow-hidden border border-line"
        style={{ height: 280 }}
      />
      <div className="flex items-center gap-1.5 text-[11px] text-muted">
        <HiOutlineCursorClick className="w-3.5 h-3.5 shrink-0" />
        <span>Toca cualquier punto del mapa para ubicar la granja</span>
        {lat && lng && (
          <>
            <span className="mx-1">·</span>
            <HiOutlineLocationMarker className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-primary font-medium">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
