// src/components/LeafletMap.jsx - Simplified Leaflet Map with Live GPS
import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, ImageOverlay, Polyline, Marker, Popup, useMap } from 'react-leaflet';
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

// Simple waypoint icons
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

// Simplified User Position Icon
const createUserIcon = (isNavigating = false) => {
  return L.divIcon({
    className: 'user-location',
    html: `
      <div style="position: relative; width: 50px; height: 50px;">
        ${isNavigating ? `
        <div style="
          background: rgba(59, 130, 246, 0.3); 
          border: 2px solid rgba(59, 130, 246, 0.6);
          border-radius: 50%; 
          width: 50px; 
          height: 50px; 
          position: absolute;
          animation: pulse 2s infinite;
        "></div>
        ` : ''}
        
        <div style="
          background: #3b82f6; 
          border: 3px solid white; 
          border-radius: 50%; 
          width: 20px; 
          height: 20px; 
          position: absolute; 
          top: 15px; 
          left: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.5); opacity: 0.4; }
            100% { transform: scale(2); opacity: 0; }
          }
        </style>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25]
  });
};

// Map controller for following user
const MapController = ({ userPosition, isNavigating }) => {
  const map = useMap();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (userPosition && Array.isArray(userPosition) && userPosition.length === 2) {
      if (isNavigating) {
        map.panTo(userPosition, { animate: true });
        if (!hasInitialized.current) {
          map.setZoom(20);
          hasInitialized.current = true;
        }
      }
    }
  }, [userPosition, isNavigating, map]);

  return null;
};

const LeafletMap = ({ 
  showRoute, 
  routeCoords, 
  userPosition,
  cabinetLocation,
  cabinetName,
  isNavigating = false
}) => {
  // Calculate map bounds
  const bounds = useMemo(() => [
    [BUILDING_BOUNDS.southWest.lat, BUILDING_BOUNDS.southWest.lng],
    [BUILDING_BOUNDS.northEast.lat, BUILDING_BOUNDS.northEast.lng]
  ], []);

  // Icons
  const startIcon = useMemo(() => createCustomIcon('#10b981', 14), []);
  const endIcon = useMemo(() => createCustomIcon('#ef4444', 14), []);
  const waypointIcon = useMemo(() => createCustomIcon('#3b82f6', 10), []);
  const userIcon = useMemo(() => createUserIcon(isNavigating), [isNavigating]);

  const hasValidUserPosition = userPosition && 
    Array.isArray(userPosition) && 
    userPosition.length === 2 && 
    !isNaN(userPosition[0]) && 
    !isNaN(userPosition[1]);

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
        <MapController 
          userPosition={userPosition} 
          isNavigating={isNavigating}
        />

        {/* Floor Plan */}
        <ImageOverlay
          url="/floor.svg"
          bounds={bounds}
          opacity={0.8}
        />

        {/* Route */}
        {showRoute && routeCoords && routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
            dashArray="10, 5"
          />
        )}

        {/* Route Waypoints */}
        {showRoute && routeCoords && routeCoords.length > 0 && routeCoords.map((coord, index) => {
          let icon;
          if (index === 0) {
            icon = startIcon;
          } else if (index === routeCoords.length - 1) {
            icon = endIcon;
          } else {
            icon = waypointIcon;
          }

          return (
            <Marker key={`waypoint-${index}`} position={coord} icon={icon}>
            </Marker>
          );
        })}

        {/* User Position */}
        {hasValidUserPosition && (
          <Marker 
            position={userPosition} 
            icon={userIcon}
            zIndexOffset={1000}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Cabinet Location */}
        {cabinetLocation && (
          <Marker position={cabinetLocation}>
            <Popup>{cabinetName || 'Destination'}</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Simple GPS Status */}
      {hasValidUserPosition && isNavigating && (
        <div className="absolute top-4 left-4 z-[1000] bg-green-600 text-white p-2 rounded shadow">
          🛰️ Live GPS Active
        </div>
      )}

      {/* Acquiring Signal */}
      {isNavigating && !hasValidUserPosition && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-yellow-500 text-white p-4 rounded shadow">
          Acquiring GPS Signal...
        </div>
      )}
    </div>
  );
};

export default LeafletMap;