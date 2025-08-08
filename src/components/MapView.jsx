// src/components/MapView.jsx - Simplified
import React, { useState } from 'react';
import { ArrowLeft, Navigation, Eye } from 'lucide-react';
import UserPointer from './UserPointer';
import useGPS from '../hooks/useGPS';
import { cabinets } from '../data/cabinet';
import { getRouteSvgCoords } from '../data/routes';

const MapView = ({ selectedCabinet, onStartNavigation, onBack }) => {
  const [showRoute, setShowRoute] = useState(true);

  const { svgPosition, isTracking, startTracking } = useGPS();
  const routeSvgCoords = getRouteSvgCoords(selectedCabinet);
  const cabinet = cabinets[selectedCabinet];

  const handleToggleRoute = () => {
    setShowRoute(!showRoute);
  };

  const handleStartTracking = async () => {
    if (!isTracking) {
      try {
        await startTracking();
      } catch (err) {
        console.error('Failed to start tracking:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            
            <h1 className="text-xl font-semibold text-gray-800">
              {cabinet?.name}
            </h1>
            
            <div className="flex gap-2">
              <button
                onClick={handleToggleRoute}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  showRoute 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Eye size={16} />
                Route
              </button>
              
              <button
                onClick={onStartNavigation}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
              >
                <Navigation size={16} />
                Navigate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Map */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative" style={{ height: '70vh' }}>
            <svg
              viewBox="0 0 815.4284 333.55614"
              className="w-full h-full"
              style={{ background: '#f8f9fa' }}
              onClick={handleStartTracking}
            >
              {/* Floor Plan */}
              <image
                href="/floor.svg"
                width="815.4284"
                height="333.55614"
                opacity="0.9"
              />

              {/* Route Path */}
              {showRoute && routeSvgCoords && routeSvgCoords.length > 0 && (
                <polyline
                  points={routeSvgCoords.map(coord => `${coord.x},${coord.y}`).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray="10,5"
                  opacity="0.8"
                />
              )}

              {/* Route Waypoints */}
              {showRoute && routeSvgCoords && routeSvgCoords.map((coord, index) => (
                <circle
                  key={index}
                  cx={coord.x}
                  cy={coord.y}
                  r={index === 0 || index === routeSvgCoords.length - 1 ? "8" : "6"}
                  fill={index === 0 ? "#10b981" : index === routeSvgCoords.length - 1 ? "#ef4444" : "#3b82f6"}
                  stroke="white"
                  strokeWidth="2"
                />
              ))}

              {/* User Position */}
              {svgPosition && (
                <UserPointer 
                  position={svgPosition}
                  isNavigating={isTracking}
                />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;