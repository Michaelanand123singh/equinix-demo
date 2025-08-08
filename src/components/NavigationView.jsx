// src/components/NavigationView.jsx - Simplified
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Target, AlertTriangle } from 'lucide-react';
import LeafletMap from './LeafletMap';
import useGPS from '../hooks/useGPS';
import { cabinets } from '../data/cabinet';
import { getRouteCoords, findClosestRoutePoint, getNextInstruction } from '../data/routes';

const NavigationView = ({ selectedCabinet, onBack }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState(null);
  
  const {
    position,
    isTracking,
    error,
    accuracy,
    permissionStatus,
    startTracking,
    stopTracking,
    getCurrentPosition
  } = useGPS();

  const routeCoords = getRouteCoords(selectedCabinet);
  const cabinet = cabinets[selectedCabinet];
  const cabinetLocation = cabinet?.coords;

  // Calculate progress and instruction based on user position
  useEffect(() => {
    if (position && routeCoords.length > 0) {
      const closest = findClosestRoutePoint(position, selectedCabinet);
      
      if (closest) {
        setProgress(Math.min(100, Math.max(0, closest.progress)));
        const instruction = getNextInstruction(position, selectedCabinet);
        setCurrentInstruction(instruction);
      }
    }
  }, [position, routeCoords, selectedCabinet]);

  const handleStartStop = async () => {
    if (isNavigating) {
      stopTracking();
      setIsNavigating(false);
      setCurrentInstruction(null);
    } else {
      if (permissionStatus === 'denied') {
        alert('Location permission is required for navigation');
        return;
      }
      
      try {
        await startTracking();
        setIsNavigating(true);
      } catch (err) {
        console.error('Failed to start navigation:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <h1 className="text-lg font-semibold">{cabinet?.name}</h1>
          
          <button
            onClick={handleStartStop}
            className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${
              isNavigating 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isNavigating ? (
              <>
                <Target size={16} />
                Stop
              </>
            ) : (
              <>
                <MapPin size={16} />
                Navigate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isNavigating && (
        <div className="bg-gray-700 p-2">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <span className="text-sm">Progress:</span>
              <div className="flex-1 bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
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
              accuracy={accuracy}
              centerOnUser={isNavigating && position}
            />
          </div>
        </div>
      </div>

      {/* Current Instruction */}
      {isNavigating && currentInstruction && (
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-blue-600 rounded-lg p-4">
            <p className="text-lg">
              {currentInstruction.next?.instruction || 'You have arrived!'}
            </p>
            {currentInstruction.distanceToNext && currentInstruction.distanceToNext < 50 && (
              <p className="text-blue-200 text-sm mt-2">
                {Math.round(currentInstruction.distanceToNext)}m away
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-red-600 rounded-lg p-4 flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationView;