// src/components/NavigationView.jsx - Updated for React-Leaflet
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Target } from 'lucide-react';
import LeafletMap from './LeafletMap';
import useGPS from '../hooks/useGPS';
import { cabinets } from '../data/cabinet';
import { getRouteCoords, getRoute } from '../data/routes';

const NavigationView = ({ selectedCabinet, onBack }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { position, startTracking, stopTracking } = useGPS();

  const routeCoords = getRouteCoords(selectedCabinet);
  const route = getRoute(selectedCabinet);
  const cabinet = cabinets[selectedCabinet];
  const cabinetLocation = cabinet?.coords;

  useEffect(() => {
    if (isNavigating) {
      startTracking();
    } else {
      stopTracking();
    }
    
    return () => stopTracking();
  }, [isNavigating, startTracking, stopTracking]);

  // Calculate progress based on user position
  useEffect(() => {
    if (position && routeCoords.length > 0) {
      // Find closest waypoint to calculate progress
      let closestIndex = 0;
      let closestDistance = Infinity;

      routeCoords.forEach((coord, index) => {
        const distance = getDistanceBetweenPoints(position, coord);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      const calculatedProgress = (closestIndex / (routeCoords.length - 1)) * 100;
      setProgress(Math.min(100, Math.max(0, calculatedProgress)));
    }
  }, [position, routeCoords]);

  const handleStartStop = () => {
    setIsNavigating(!isNavigating);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-white">
            <ArrowLeft size={20} />
            Back to Map
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-semibold">Navigating to</h1>
            <p className="text-blue-400">{cabinet?.name}</p>
          </div>
          
          <button
            onClick={handleStartStop}
            className={`px-4 py-2 rounded font-semibold ${
              isNavigating 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isNavigating ? 'Stop Navigation' : 'Start Navigation'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-700 p-2">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-sm">Progress:</span>
            <div className="flex-1 bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-lg overflow-hidden">
          <div style={{ height: '60vh' }}>
            <LeafletMap
              showRoute={true}
              routeCoords={routeCoords}
              userPosition={position}
              cabinetLocation={cabinetLocation}
              cabinetName={cabinet?.name}
              isNavigating={isNavigating}
            />
          </div>
        </div>
      </div>

      {/* Current Instruction */}
      {isNavigating && route && (
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <div className="bg-blue-600 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Next Instruction:</h3>
            <p className="text-blue-100">
              {route[Math.min(Math.floor(progress / 100 * route.length), route.length - 1)]?.instruction}
            </p>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${isNavigating ? 'bg-green-500' : 'bg-gray-600'}`}>
              {isNavigating ? <Target size={20} /> : <MapPin size={20} />}
            </div>
            <div>
              <p className="font-semibold">
                {isNavigating ? 'Navigation Active' : 'Navigation Stopped'}
              </p>
              <p className="text-gray-400 text-sm">
                {isNavigating 
                  ? `Following route to ${cabinet?.name}`
                  : 'Click "Start Navigation" to begin live tracking'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate distance between two points
const getDistanceBetweenPoints = (point1, point2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1[0] * Math.PI / 180;
  const φ2 = point2[0] * Math.PI / 180;
  const Δφ = (point2[0] - point1[0]) * Math.PI / 180;
  const Δλ = (point2[1] - point1[1]) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export default NavigationView;
