// src/components/NavigationView.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Target } from 'lucide-react';
import UserPointer from './UserPointer';
import RouteOverlay from './RouteOverlay';
import useGPS from '../hooks/useGPS';
import { cabinets } from '../data/cabinet';
import { routes } from '../data/routes';

const NavigationView = ({ selectedCabinet, onBack }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { position, startTracking, stopTracking } = useGPS();

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
    if (position && routes[selectedCabinet]) {
      const routePoints = routes[selectedCabinet];
      const totalDistance = routePoints.length - 1;
      
      // Simple progress calculation (you can make this more sophisticated)
      const currentProgress = Math.min((Date.now() % 10000) / 10000 * 100, 100);
      setProgress(currentProgress);
    }
  }, [position, selectedCabinet]);

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
            <p className="text-blue-400">{cabinets[selectedCabinet]?.name}</p>
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
          <div className="relative" style={{ height: '60vh' }}>
            {/* SVG Floor Plan Background */}
            <div className="absolute inset-0">
              <object
                data="/floor.svg"
                type="image/svg+xml"
                className="w-full h-full"
                style={{ pointerEvents: 'none' }}
              >
                <img src="/floor.svg" alt="Floor Plan" className="w-full h-full object-contain" />
              </object>
            </div>
            
            {/* Route Overlay */}
            <RouteOverlay selectedCabinet={selectedCabinet} />
            
            {/* User Position */}
            {isNavigating && position && (
              <UserPointer 
                position={position} 
                isNavigating={isNavigating}
              />
            )}
          </div>
        </div>
      </div>

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
                  ? `Following route to ${cabinets[selectedCabinet]?.name}`
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

export default NavigationView;