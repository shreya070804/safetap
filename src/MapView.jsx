import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";

// 🔴 Custom RED marker
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function MapView({ onLocationUpdate }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        console.log("LIVE LOCATION:", lat, lng);

        setPosition([lat, lng]);
        if (onLocationUpdate) {
          onLocationUpdate([lat, lng]);
        }
      },
      (err) => {
        console.log("LOCATION ERROR:", err);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // ⛔ Premium Loading State
  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-[20px] border-2 border-dashed border-slate-200 dark:border-slate-700 h-[350px] w-full">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
        <p className="text-slate-500 font-bold text-sm tracking-tight">Locking GPS Coordinates...</p>
      </div>
    );
  }

  return (
    <MapContainer
      key={position.toString()}
      center={position}
      zoom={16}
      style={{ height: "350px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 🔴 RED CURRENT LOCATION MARKER */}
      <Marker position={position} icon={redIcon}>
        <Popup>🚨 You are here (Live Location)</Popup>
      </Marker>
    </MapContainer>
  );
}