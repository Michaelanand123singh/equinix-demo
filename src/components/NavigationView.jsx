// src/components/NavigationView.jsx - CLEANED - Leaflet Only
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Target, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import LeafletMap from './LeafletMap';
import useGPS from '../hooks/useGPS';
import { cabinets } from '../data/cabinet';
import { getRouteCoords, getRoute, findClosestRoutePoint, getNextInstruction } from '../data/routes';

const NavigationView = ({ selectedCabinet, onBack }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(null);
  
  const {
    position,        // GPS coordinates [lat, lng] - ONLY coordinates we need!
    isTracking,
    error,
    accuracy,
    permissionStatus,
    startTracking,
    stopTracking,
    getCurrentPosition,
    checkPermission,
    isWithinBuilding
  } = useGPS();

  const routeCoords = getRouteCoords(selectedCabinet);
  const route = getRoute(selectedCabinet);
  const cabinet = cabinets[selectedCabinet];
  const cabinetLocation = cabinet?.coords;

  // Debug logging to see GPS coordinates updates
  useEffect(() => {
    console.log('🗺️ NavigationView GPS update:', {
      position,
      isNavigating,
      isTracking,
      accuracy,
      isWithinBuilding,
      timestamp: new Date().toISOString()
    });
  }, [position, isNavigating, isTracking, accuracy, isWithinBuilding]);

  // Check permission status on component mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Calculate progress and current instruction based on user position
  useEffect(() => {
    if (position && routeCoords.length > 0) {
      // Find closest point on route
      const closest = findClosestRoutePoint(position, selectedCabinet);
      
      if (closest) {
        setProgress(Math.min(100, Math.max(0, closest.progress)));
        
        // Get next instruction
        const instruction = getNextInstruction(position, selectedCabinet);
        setCurrentInstruction(instruction);
      }
    }
  }, [position, routeCoords, selectedCabinet]);

  const handleStartStop = async () => {
    if (isNavigating) {
      // Stop navigation
      stopTracking();
      setIsNavigating(false);
      setCurrentInstruction(null);
    } else {
      // Start navigation
      if (permissionStatus === 'denied') {
        setShowPermissionDialog(true);
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

  const handlePermissionDialog = async (retry = false) => {
    setShowPermissionDialog(false);
    
    if (retry) {
      try {
        await getCurrentPosition(); // This will trigger permission request
        await startTracking();
        setIsNavigating(true);
      } catch (err) {
        console.error('Permission request failed:', err);
      }
    }
  };

  const getStatusColor = () => {
    if (error) return 'red';
    if (isTracking && position) return 'green';
    if (isTracking && !position) return 'yellow';
    return 'gray';
  };

  const getStatusText = () => {
    if (error) return 'GPS Error';
    if (isTracking && position) return 'GPS Active';
    if (isTracking && !position) return 'Acquiring GPS...';
    return 'GPS Inactive';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap max-w-6xl mx-auto">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Map
          </button>
          
          <div className="text-center flex-1 min-w-[200px]">
            <h1 className="text-base sm:text-lg font-semibold">Navigating to</h1>
            <p className="text-blue-400 break-words">{cabinet?.name}</p>
          </div>
          
          <button
            onClick={handleStartStop}
            disabled={isTracking && !position && !error}
            className={`px-4 py-2 rounded font-semibold transition-colors flex items-center gap-2 ${
              isNavigating 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            } ${isTracking && !position && !error ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isTracking && !position && !error ? (
              <>
                <Loader size={16} className="animate-spin" />
                Acquiring GPS...
              </>
            ) : isNavigating ? (
              <>
                <Target size={16} />
                Stop Navigation
              </>
            ) : (
              <>
                <MapPin size={16} />
                Start Navigation
              </>
            )}
          </button>
        </div>
      </div>

      {/* GPS Status Bar */}
      <div className={`p-2 ${
        getStatusColor() === 'green' ? 'bg-green-600' :
        getStatusColor() === 'yellow' ? 'bg-yellow-600' :
        getStatusColor() === 'red' ? 'bg-red-600' : 'bg-gray-600'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getStatusColor() === 'green' && <CheckCircle size={16} />}
            {getStatusColor() === 'yellow' && <Loader size={16} className="animate-spin" />}
            {getStatusColor() === 'red' && <AlertTriangle size={16} />}
            <span>{getStatusText()}</span>
            {!isWithinBuilding && position && (
              <span className="text-orange-200 text-xs ml-2">
                ⚠️ Outside building area
              </span>
            )}
          </div>
          
          {accuracy && (
            <span>Accuracy: ±{Math.round(accuracy)}m</span>
          )}
          
          {error && (
            <span className="text-red-200 text-xs max-w-md truncate">{error}</span>
          )}
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
      <div className="p-2 sm:p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-lg overflow-hidden">
          <div style={{ height: '55vh' }}>
            <LeafletMap
              showRoute={true}
              routeCoords={routeCoords}
              userPosition={position}        // Only GPS coordinates needed!
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
        <div className="max-w-6xl mx-auto px-2 sm:px-4 mb-4">
          <div className="bg-blue-600 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Target size={16} />
              Next Instruction:
            </h3>
            <p className="text-blue-100 text-lg">
              {currentInstruction.next?.instruction || 'You have arrived at your destination!'}
            </p>
            {currentInstruction.distanceToNext && currentInstruction.distanceToNext < 50 && (
              <p className="text-blue-200 text-sm mt-2">
                {Math.round(currentInstruction.distanceToNext)}m away
              </p>
            )}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${
              isNavigating && position ? 'bg-green-500' : 
              isNavigating && !position ? 'bg-yellow-500' : 
              'bg-gray-600'
            }`}>
              {isNavigating && position ? <Target size={20} /> : 
               isNavigating && !position ? <Loader size={20} className="animate-spin" /> :
               <MapPin size={20} />}
            </div>
            <div>
              <p className="font-semibold">
                {isNavigating && position ? 'Navigation Active' : 
                 isNavigating && !position ? 'Acquiring Location...' :
                 'Navigation Stopped'}
              </p>
              <p className="text-gray-400 text-sm">
                {isNavigating && position
                  ? `Live tracking to ${cabinet?.name} • Accuracy: ±${accuracy ? Math.round(accuracy) : '?'}m`
                  : isNavigating && !position
                  ? 'Waiting for GPS signal...'
                  : 'Click "Start Navigation" to begin live GPS tracking'
                }
              </p>
            </div>
          </div>
          
          {position && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                Live GPS: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                {accuracy && ` • ±${Math.round(accuracy)}m`}
                {isWithinBuilding ? ' • Inside building' : ' • Outside building area'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Permission Dialog */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold">Location Permission Required</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              To provide navigation, this app needs access to your device's location. 
              Please enable location services and grant permission when prompted.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handlePermissionDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePermissionDialog(true)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Enable Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationView;