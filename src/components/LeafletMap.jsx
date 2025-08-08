// src/components/LeafletMap.jsx - Leaflet-based User Pointer
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

// Custom icons for route waypoints
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

// Enhanced User Position Icon with Live Tracking Animation
const createLiveUserIcon = (isNavigating = false, accuracy = null) => {
  const timestamp = Date.now(); // Force unique animations
  
  return L.divIcon({
    className: `user-location-marker-live-${timestamp}`,
    html: `
      <div style="position: relative; width: 80px; height: 80px;">
        <style>
          .user-location-marker-live-${timestamp} {
            z-index: 1000 !important;
          }
          
          @keyframes liveUserPulse-${timestamp} {
            0% { 
              transform: scale(1); 
              opacity: 0.8; 
            }
            50% { 
              transform: scale(1.5); 
              opacity: 0.4; 
            }
            100% { 
              transform: scale(2); 
              opacity: 0; 
            }
          }
          
          @keyframes liveUserGlow-${timestamp} {
            0%, 100% { 
              box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4); 
            }
            50% { 
              box-shadow: 0 0 20px rgba(59, 130, 246, 1), 0 0 40px rgba(59, 130, 246, 0.8); 
            }
          }
          
          @keyframes liveBounce-${timestamp} {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
          
          .live-pulse-${timestamp} {
            animation: liveUserPulse-${timestamp} 2s infinite ease-out;
          }
          
          .live-glow-${timestamp} {
            animation: liveUserGlow-${timestamp} 2s ease-in-out infinite;
          }
          
          .live-bounce-${timestamp} {
            animation: liveBounce-${timestamp} 1s ease-in-out infinite;
          }
        </style>
        
        <!-- Accuracy Circle (if available) -->
        ${accuracy && accuracy < 50 ? `
        <div style="
          border: 2px solid rgba(34, 197, 94, 0.4);
          background: rgba(34, 197, 94, 0.1);
          border-radius: 50%; 
          width: ${Math.min(accuracy * 1.5, 60)}px; 
          height: ${Math.min(accuracy * 1.5, 60)}px; 
          position: absolute; 
          top: ${40 - Math.min(accuracy * 1.5, 60) / 2}px; 
          left: ${40 - Math.min(accuracy * 1.5, 60) / 2}px;
        "></div>
        ` : ''}
        
        <!-- Outer Pulse Ring (animated when navigating) -->
        <div class="${isNavigating ? `live-pulse-${timestamp}` : ''}" style="
          background: rgba(59, 130, 246, 0.3); 
          border: 2px solid rgba(59, 130, 246, 0.6);
          border-radius: 50%; 
          width: 50px; 
          height: 50px; 
          position: absolute; 
          top: 15px; 
          left: 15px;
        "></div>
        
        <!-- Middle Ring (glowing when navigating) -->
        <div class="${isNavigating ? `live-glow-${timestamp}` : ''}" style="
          background: rgba(59, 130, 246, 0.7); 
          border: 2px solid white;
          border-radius: 50%; 
          width: 30px; 
          height: 30px; 
          position: absolute; 
          top: 25px; 
          left: 25px;
        "></div>
        
        <!-- Inner Dot (User Position) - bouncing when navigating -->
        <div class="${isNavigating ? `live-bounce-${timestamp}` : ''}" style="
          background: #3b82f6; 
          border: 3px solid white; 
          border-radius: 50%; 
          width: 14px; 
          height: 14px; 
          position: absolute; 
          top: 33px; 
          left: 33px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        "></div>
        
        <!-- Live Status Indicator -->
        ${isNavigating ? `
        <div style="
          background: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          width: 8px;
          height: 8px;
          position: absolute;
          top: 18px;
          left: 55px;
          box-shadow: 0 0 6px #10b981;
          animation: liveUserPulse-${timestamp} 1s infinite;
        "></div>
        ` : ''}
        
        <!-- Direction Arrow (if heading available) -->
        ${isNavigating ? `
        <div style="
          position: absolute;
          top: 5px;
          left: 35px;
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 12px solid #3b82f6;
          transform-origin: center bottom;
        "></div>
        ` : ''}
      </div>
    `,
    iconSize: [80, 80],
    iconAnchor: [40, 40]
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

// Component to handle map centering and following user
const MapController = ({ userPosition, isNavigating, centerOnUser = false }) => {
  const map = useMap();
  const hasInitialized = useRef(false);
  const lastPosition = useRef(null);

  useEffect(() => {
    if (userPosition && Array.isArray(userPosition) && userPosition.length === 2) {
      const [lat, lng] = userPosition;
      
      // Check if position actually changed (avoid unnecessary updates)
      const positionChanged = !lastPosition.current || 
        Math.abs(lastPosition.current[0] - lat) > 0.000001 ||
        Math.abs(lastPosition.current[1] - lng) > 0.000001;
      
      if (positionChanged) {
        console.log('MapController: User position changed:', userPosition);
        lastPosition.current = userPosition;
        
        if (isNavigating) {
          // Smooth pan to new position when navigating
          map.panTo(userPosition, { animate: true, duration: 1.0 });
          
          // Set appropriate zoom level
          if (!hasInitialized.current) {
            map.setZoom(20);
            hasInitialized.current = true;
          }
        } else if (centerOnUser || !hasInitialized.current) {
          // Center once when not navigating
          map.setView(userPosition, 20);
          hasInitialized.current = true;
        }
      }
    }
  }, [userPosition, isNavigating, centerOnUser, map]);

  return null;
};

const LeafletMap = ({ 
  showRoute, 
  routeCoords, 
  userPosition, // GPS coordinates [lat, lng] - THIS IS ALL WE NEED
  cabinetLocation,
  cabinetName,
  isNavigating = false,
  accuracy,
  centerOnUser = false
}) => {
  // Debug logging
  useEffect(() => {
    console.log('LeafletMap render:', {
      userPosition,
      isNavigating,
      accuracy,
      showRoute,
      routeCoords: routeCoords?.length,
      timestamp: new Date().toISOString()
    });
  }, [userPosition, isNavigating, accuracy, showRoute, routeCoords]);

  // Calculate map bounds
  const bounds = useMemo(() => [
    [BUILDING_BOUNDS.southWest.lat, BUILDING_BOUNDS.southWest.lng],
    [BUILDING_BOUNDS.northEast.lat, BUILDING_BOUNDS.northEast.lng]
  ], []);

  // Custom icons - regenerate user icon when state changes
  const startIcon = useMemo(() => createCustomIcon('#10b981', 14), []);
  const endIcon = useMemo(() => createCustomIcon('#ef4444', 14), []);
  const waypointIcon = useMemo(() => createCustomIcon('#3b82f6', 10), []);
  const cabinetIcon = useMemo(() => createCabinetIcon(), []);
  
  // Create new user icon when navigation state or position changes
  const userIcon = useMemo(() => {
    console.log('Creating new user icon:', { isNavigating, accuracy, position: userPosition });
    return createLiveUserIcon(isNavigating, accuracy);
  }, [isNavigating, accuracy, userPosition ? `${userPosition[0]}-${userPosition[1]}` : null]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={BUILDING_CENTER}
        zoom={19}
        maxZoom={22}
        minZoom={17}
        style={{ height: '100%', width: '100%' }}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        zoomControl={true}
      >
        {/* Map Controller for following user */}
        <MapController 
          userPosition={userPosition} 
          isNavigating={isNavigating}
          centerOnUser={centerOnUser}
        />

        {/* Floor Plan Overlay */}
        <ImageOverlay
          url="/floor.svg"
          bounds={bounds}
          opacity={0.8}
        />

        {/* Route Polyline */}
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
            <Marker key={`waypoint-${index}`} position={coord} icon={icon} zIndexOffset={100}>
              <Popup>{popupText}</Popup>
            </Marker>
          );
        })}

        {/* USER POSITION MARKER - This is the main user pointer */}
        {userPosition && Array.isArray(userPosition) && userPosition.length === 2 && (
          <Marker 
            position={userPosition} 
            icon={userIcon} 
            zIndexOffset={1000}
            key={`user-${isNavigating ? 'nav' : 'static'}-${userPosition[0].toFixed(6)}-${userPosition[1].toFixed(6)}`}
          >
            <Popup>
              <div className="text-center">
                <div className="font-bold text-blue-600 text-lg">📍 YOUR LOCATION</div>
                {accuracy && (
                  <div className="text-sm text-gray-600 mt-1">
                    GPS Accuracy: ±{Math.round(accuracy)}m
                  </div>
                )}
                {isNavigating && (
                  <div className="text-xs text-green-600 mt-2 flex items-center gap-1 justify-center font-semibold">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    🚶‍♂️ LIVE TRACKING ACTIVE
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {userPosition[0].toFixed(6)}, {userPosition[1].toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Cabinet Location */}
        {cabinetLocation && (
          <Marker position={cabinetLocation} icon={cabinetIcon} zIndexOffset={200}>
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-orange-600">{cabinetName || 'Cabinet Location'}</div>
                <div className="text-xs text-gray-500 mt-1">📦 Destination</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Live GPS Status Overlay */}
      {userPosition && isNavigating && (
        <div className="absolute top-4 left-4 z-[1000] bg-green-600 bg-opacity-95 rounded-lg p-3 shadow-lg border border-green-400">
          <div className="flex items-center gap-2 text-sm text-white">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-bold">🛰️ LIVE GPS TRACKING</span>
          </div>
          {accuracy && (
            <div className="text-xs text-green-100 mt-1">
              Accuracy: ±{Math.round(accuracy)}m
            </div>
          )}
          <div className="text-xs text-green-100 mt-1">
            📍 {userPosition[0].toFixed(6)}, {userPosition[1].toFixed(6)}
          </div>
        </div>
      )}

      {/* Acquiring GPS Warning */}
      {isNavigating && !userPosition && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-yellow-500 bg-opacity-95 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 text-yellow-900">
            <div className="w-4 h-4 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-bold">🛰️ Acquiring GPS location...</span>
          </div>
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-black bg-opacity-80 text-white text-xs p-3 rounded">
          <div className="font-bold text-green-400">🐛 DEBUG INFO:</div>
          <div>Position: {userPosition ? `${userPosition[0].toFixed(6)}, ${userPosition[1].toFixed(6)}` : 'None'}</div>
          <div>Navigation: {isNavigating ? '✅ Active' : '❌ Inactive'}</div>
          <div>Accuracy: {accuracy ? `±${Math.round(accuracy)}m` : 'Unknown'}</div>
          <div>Route Points: {routeCoords?.length || 0}</div>
          <div>Timestamp: {new Date().toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;