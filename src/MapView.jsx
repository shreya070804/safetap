import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔴 Custom RED marker
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to handle map center updates without re-mounting
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom]);
  return null;
}

export default function MapView({ onLocationUpdate, theme = 'dark' }) {
  // Use localStorage for instant load if available, default to Mumbai/NYC fallback
  const lastPos = JSON.parse(localStorage.getItem('lastKnownLocation'));
  const [position, setPosition] = useState(lastPos || [19.0760, 72.8777]); 
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const newPos = [lat, lng];

        setPosition(newPos);
        setLocked(true);
        localStorage.setItem('lastKnownLocation', JSON.stringify(newPos));
        
        if (onLocationUpdate) {
          onLocationUpdate(newPos);
        }
      },
      (err) => console.log("LOCATION ERROR:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[400px] rounded-[inherit] overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
      {!locked && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className={`${theme === 'dark' ? 'bg-slate-900/80 text-white border-white/10' : 'bg-white/80 text-slate-900 border-slate-200'} backdrop-blur-md px-4 py-2 rounded-full border flex items-center gap-2 shadow-xl`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-amber-500' : 'bg-blue-600'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Optimizing GPS...</span>
          </div>
        </div>
      )}

      <MapContainer
        center={position}
        zoom={16}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <ChangeView center={position} zoom={16} />
        
        {/* Dynamic Tile Server based on theme */}
        <TileLayer 
          url={theme === 'dark' 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
          subdomains='abcd'
          maxZoom={20}
        />

        <Marker position={position} icon={redIcon}>
          <Popup>🚨 You are here (Live Location)</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}