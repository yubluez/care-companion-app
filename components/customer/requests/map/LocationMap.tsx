"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";

import { useEffect } from "react";
import L from "leaflet";

export type MapLocation = {
  lat: number;
  lng: number;
};

type Props = {
  value: MapLocation | null;
  onChange: (location: MapLocation) => void;
};

const DEFAULT_CENTER: MapLocation = {
  lat: 13.7563,
  lng: 100.5018,
};

// ใช้ไอคอนหมุดของ Leaflet
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// รับตำแหน่งเมื่อคลิกแผนที่
function LocationMarker({ value, onChange }: Props) {
  useMapEvents({
    click(event) {
      onChange({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  if (!value) return null;

  return <Marker position={[value.lat, value.lng]} icon={markerIcon} />;
}

// ย้ายแผนที่เมื่อพิกัดเปลี่ยนจากภายนอก
function MapController({ value }: { value: MapLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (value) {
      map.setView([value.lat, value.lng]);
    }
  }, [value, map]);

  return null;
}

// ช่วยปรับขนาดแผนที่อัตโนมัติเมื่อเปิด/ขยายขึ้นมา
function MapResizer() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function LocationMap({ value, onChange }: Props) {
  return (
    <div className="h-[350px] w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={[
          value?.lat ?? DEFAULT_CENTER.lat,
          value?.lng ?? DEFAULT_CENTER.lng,
        ]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapResizer />

        <MapController value={value} />

        <LocationMarker value={value} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
