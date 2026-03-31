import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SafetyHotspot } from '../types';

// Fix for default marker icons in Leaflet with React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapProps {
  center: [number, number];
  hotspots: SafetyHotspot[];
  routePolyline?: [number, number][];
  isJam?: boolean;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export const Map: React.FC<MapProps> = ({ center, hotspots, routePolyline, isJam }) => {
  return (
    <div className="w-full h-full relative">
      <MapContainer center={center} zoom={13} scrollWheelZoom={true}>
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {hotspots.map((spot) => (
          <Marker key={spot.id} position={[spot.lat, spot.lng]}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm">{spot.locationName}</h3>
                <p className="text-xs text-red-600">Risk: {spot.riskLevel}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {routePolyline && (
          <Polyline 
            positions={routePolyline} 
            color={isJam ? '#ef4444' : '#22c55e'} 
            weight={6}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
};
