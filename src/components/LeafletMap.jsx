// src/components/LeafletMap.jsx - React-Leaflet Implementation
import React, { useMemo } from 'react';
import { MapContainer, ImageOverlay, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BUILDING_BOUNDS, BUILDING_CENTER } from '../data/routes';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color, size = 12) => {
  return L.divIcon({
    className: `custom-marker-${color}`,
    html: `<div style="
      background: ${color}; 
      border: 2px solid white; 
      border-radius: 50%; 
      width: ${size}px; 
      height: ${size}px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

const createUserIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="position: relative;">
        <div style="
          background: rgba(59, 130, 246, 0.3); 
          border-radius: 50%; 
          width: 40px; 
          height: 40px; 
          position: absolute; 
          top: -20px; 
          left: -20px;
          animation: pulse 2s infinite;
        "></div>
        <div style="
          background: rgba(59, 130, 246, 0.6); 
          border-radius: 50%; 
          width: 24px; 
          height: 24px; 
          position: absolute; 
          top: -12px; 
          left: -12px;
        "></div>
        <div style="
          background: #3b82f6; 
          border: 2px solid white; 
          border-radius: 50%; 
          width: 12px; 
          height: 12px; 
          position: absolute; 
          top: -6px; 
          left: -6px;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const createCabinetIcon = () => {
  return L.divIcon({
    className: 'cabinet-marker',
    html: `<div style="
      background: #f59e0b; 
      border: 2px solid white; 
      border-radius: 3px; 
      width: 16px; 
      height: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const LeafletMap = ({ 
  showRoute, 
  routeCoords, 
  userPosition, 
  cabinetLocation,
  cabinetName,
  isNavigating 
}) => {
  // Calculate map bounds
  const bounds = useMemo(() => [
    [BUILDING_BOUNDS.southWest.lat, BUILDING_BOUNDS.southWest.lng],
    [BUILDING_BOUNDS.northEast.lat, BUILDING_BOUNDS.northEast.lng]
  ], []);

  // Custom icons
  const startIcon = useMemo(() => createCustomIcon('#10b981', 14), []);
  const endIcon = useMemo(() => createCustomIcon('#ef4444', 14), []);
  const waypointIcon = useMemo(() => createCustomIcon('#3b82f6', 10), []);
  const userIcon = useMemo(() => createUserIcon(), []);
  const cabinetIcon = useMemo(() => createCabinetIcon(), []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={BUILDING_CENTER}
        zoom={19}
        maxZoom={22}
        minZoom={17}
        style={{ height: '100%', width: '100%' }}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
      >
        {/* Floor Plan Overlay */}
        <ImageOverlay
          url="/floor.svg"
          bounds={bounds}
          opacity={0.8}
        />

        {/* Route Polyline */}
        {showRoute && routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
            dashArray="10, 5"
          />
        )}

        {/* Route Waypoints */}
        {showRoute && routeCoords.length > 0 && routeCoords.map((coord, index) => {
          let icon, popupText;
          
          if (index === 0) {
            icon = startIcon;
            popupText = 'START';
          } else if (index === routeCoords.length - 1) {
            icon = endIcon;
            popupText = 'DESTINATION';
          } else {
            icon = waypointIcon;
            popupText = `Waypoint ${index}`;
          }

          return (
            <Marker key={`waypoint-${index}`} position={coord} icon={icon}>
              <Popup>{popupText}</Popup>
            </Marker>
          );
        })}

        {/* User Position */}
        {isNavigating && userPosition && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Cabinet Location */}
        {cabinetLocation && (
          <Marker position={cabinetLocation} icon={cabinetIcon}>
            <Popup>{cabinetName || 'Cabinet Location'}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;