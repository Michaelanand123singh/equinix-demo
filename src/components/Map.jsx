import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import LivePosition from './LivePosition';
import { 
  MAP_CONFIG, 
  CABINETS, 
  ROUTES, 
  ENTRANCE_POSITION, 
  NAVIGATION_CONFIG,
  FLOOR_PLAN 
} from '../mapData';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom cabinet icon
const createCabinetIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${NAVIGATION_CONFIG.cabinetColor};
        border: 3px solid white;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="color: white; font-size: 10px; font-weight: bold;">📦</div>
      </div>
    `,
    className: 'custom-cabinet-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Entrance icon
const createEntranceIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #10B981;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="color: white; font-size: 8px;">🚪</div>
      </div>
    `,
    className: 'custom-entrance-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const Map = ({ selectedCabinet, onBackToInput }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const cabinet = CABINETS[selectedCabinet];
  const route = ROUTES[selectedCabinet];

  useEffect(() => {
    // Auto-hide instructions after 3 seconds
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setHasArrived(false);
    setShowInstructions(false);
  };

  const handleArrival = () => {
    setIsNavigating(false);
    setHasArrived(true);
  };

  const handleReset = () => {
    setIsNavigating(false);
    setHasArrived(false);
    setShowInstructions(true);
  };

  if (!cabinet || !route) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Cabinet not found!</p>
          <button
            onClick={onBackToInput}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={false}
      >
        {/* Floor plan background - you'll replace this with your CAD file */}
        <ImageOverlay
          url={FLOOR_PLAN.imageUrl}
          bounds={FLOOR_PLAN.bounds}
          opacity={FLOOR_PLAN.opacity}
        />
        
        {/* Simple tile layer as fallback */}
        <TileLayer
          url="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PC9zdmc+"
          opacity={0.1}
        />

        {/* Entrance marker */}
        <Marker
          position={[ENTRANCE_POSITION.lat, ENTRANCE_POSITION.lng]}
          icon={createEntranceIcon()}
        />

        {/* Destination cabinet marker */}
        <Marker
          position={[cabinet.lat, cabinet.lng]}
          icon={createCabinetIcon()}
        />

        {/* Route line */}
        <Polyline
          positions={route.map(point => [point.lat, point.lng])}
          color={NAVIGATION_CONFIG.routeColor}
          weight={4}
          opacity={0.8}
          dashArray="5, 10"
        />

        {/* Live position component */}
        <LivePosition
          route={route}
          onArrival={handleArrival}
          isNavigating={isNavigating}
        />
      </MapContainer>

      {/* Navigation controls overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-black/20 to-transparent p-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Cabinet {selectedCabinet}
              </h2>
              <p className="text-sm text-gray-600">
                {cabinet.zone} • {cabinet.power} • {cabinet.status}
              </p>
            </div>
            <button
              onClick={onBackToInput}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Instructions overlay */}
      {showInstructions && !isNavigating && !hasArrived && (
        <div className="absolute bottom-20 left-4 right-4 z-[1000]">
          <div className="bg-blue-500 text-white rounded-lg p-4 shadow-lg">
            <p className="text-center mb-3">
              Ready to navigate to Cabinet {selectedCabinet}?
            </p>
            <button
              onClick={handleStartNavigation}
              className="w-full bg-white text-blue-500 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              🚀 Start Live Navigation
            </button>
          </div>
        </div>
      )}

      {/* Arrival message */}
      {hasArrived && (
        <div className="absolute bottom-20 left-4 right-4 z-[1000]">
          <div className="bg-green-500 text-white rounded-lg p-4 shadow-lg text-center">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="text-lg font-bold mb-2">
              Arrived at Cabinet {selectedCabinet}!
            </h3>
            <p className="mb-4">Navigation completed successfully</p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 bg-white text-green-500 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                Navigate Again
              </button>
              <button
                onClick={onBackToInput}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                New Cabinet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Your Position</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>Destination</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-1 bg-green-500 mr-2"></div>
            <span>Route</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;