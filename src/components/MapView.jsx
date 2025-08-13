// src/components/MapView.jsx - SVG Map with Live GPS Pointer
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Navigation, Eye, MapPin, Route, Zap, Clock, Target, Loader } from 'lucide-react';
import UserPointer from './UserPointer';
import useGPS from '../hooks/useGPS';
import { cabinets, getDistanceToCabinet } from '../data/cabinet';
import { getRouteSvgCoords, getRoute } from '../data/routes';

const MapView = ({ selectedCabinet, onStartNavigation, onBack }) => {
  const [showRoute, setShowRoute] = useState(true);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [cabinetDistance, setCabinetDistance] = useState(null);

  // GPS Hook - provides both GPS coordinates and SVG coordinates
  const {
    position: gpsPosition,        // [lat, lng] GPS coordinates
    svgPosition,                  // {x, y} SVG coordinates - THIS IS WHAT WE NEED!
    isTracking,
    error,
    accuracy,
    startTracking,
    stopTracking,
    
    isWithinBuilding
  } = useGPS();

  const routeSvgCoords = getRouteSvgCoords(selectedCabinet);  // SVG route coordinates
  const route = getRoute(selectedCabinet);
  const cabinet = cabinets[selectedCabinet];

  // Calculate distance when GPS position changes
  useEffect(() => {
    if (gpsPosition && cabinet) {
      const distance = getDistanceToCabinet(gpsPosition, selectedCabinet);
      setCabinetDistance(distance);
    }
  }, [gpsPosition, selectedCabinet, cabinet]);

  // Debug logging
  useEffect(() => {
    console.log('🗺️ MapView GPS Update:', {
      gpsPosition,
      svgPosition,
      isTracking,
      accuracy,
      isWithinBuilding,
      timestamp: new Date().toISOString()
    });
  }, [gpsPosition, svgPosition, isTracking, accuracy, isWithinBuilding]);

  const handleToggleRoute = () => {
    setShowRoute(!showRoute);
  };

  const handleStartLiveTracking = async () => {
    if (isLiveTracking) {
      // Stop live tracking
      stopTracking();
      setIsLiveTracking(false);
    } else {
      // Start live tracking
      try {
        await startTracking();
        setIsLiveTracking(true);
      } catch (err) {
        console.error('Failed to start live tracking:', err);
      }
    }
  };

  const handleStartNavigation = () => {
    onStartNavigation();
  };

  const formatDistance = (distance) => {
    if (!distance) return 'Unknown';
    return distance < 1000 
      ? `${Math.round(distance)}m` 
      : `${(distance / 1000).toFixed(1)}km`;
  };

  const getEstimatedTime = (distance) => {
    if (!distance) return 'Unknown';
    const timeSeconds = distance / 1.4; // 1.4 m/s walking speed
    const minutes = Math.round(timeSeconds / 60);
    return minutes < 1 ? '< 1 min' : `${minutes} min`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Cabinets
            </button>
            
            <div className="text-center flex-1 min-w-[220px]">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                Route to {cabinet?.name}
              </h1>
              <p className="text-sm text-gray-500">{cabinet?.description}</p>
            </div>
            
            <div className="flex gap-2 flex-wrap justify-end">
              <button
                onClick={handleToggleRoute}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  showRoute 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Eye size={16} />
                {showRoute ? 'Hide Route' : 'Show Route'}
              </button>

              <button
                onClick={handleStartLiveTracking}
                disabled={isTracking && !svgPosition && !error}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isLiveTracking 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                } ${isTracking && !svgPosition && !error ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isTracking && !svgPosition && !error ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Acquiring GPS...
                  </>
                ) : isLiveTracking ? (
                  <>
                    <Target size={16} />
                    Stop Live Tracking
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Start Live Tracking
                  </>
                )}
              </button>
              
              <button
                onClick={handleStartNavigation}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm"
              >
                <Navigation size={16} />
                Navigate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GPS Status Panel */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Live GPS Status */}
          <div className={`rounded-lg p-4 shadow-sm border ${
            svgPosition ? 'bg-green-50 border-green-200' : 
            isTracking ? 'bg-yellow-50 border-yellow-200' : 
            'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                svgPosition ? 'bg-green-100' : 
                isTracking ? 'bg-yellow-100' : 
                'bg-gray-100'
              }`}>
                {svgPosition ? <Zap className="text-green-600" size={20} /> : 
                 isTracking ? <Loader className="text-yellow-600 animate-spin" size={20} /> :
                 <MapPin className="text-gray-600" size={20} />}
              </div>
              <div>
                <p className="text-sm text-gray-500">Live GPS</p>
                <p className={`text-sm font-semibold ${
                  svgPosition ? 'text-green-700' : 
                  isTracking ? 'text-yellow-700' : 
                  'text-gray-700'
                }`}>
                  {svgPosition ? '🟢 ACTIVE' : 
                   isTracking ? '🟡 ACQUIRING...' : 
                   '⚫ INACTIVE'}
                </p>
              </div>
            </div>
          </div>

          {/* GPS Accuracy */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">GPS Accuracy</p>
                <p className="text-sm font-semibold text-gray-800">
                  {accuracy ? `±${Math.round(accuracy)}m` : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Route className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Distance</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatDistance(cabinetDistance)}
                </p>
              </div>
            </div>
          </div>

          {/* Walking Time */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Est. Time</p>
                <p className="text-sm font-semibold text-gray-800">
                  {getEstimatedTime(cabinetDistance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live GPS Status Banner */}
        {svgPosition && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-green-800 font-medium">
                  🛰️ Live GPS tracking active - Your position is shown on the map
                </p>
                <p className="text-green-600 text-sm">
                  GPS: {gpsPosition?.[0]?.toFixed(6)}, {gpsPosition?.[1]?.toFixed(6)} → 
                  SVG: ({Math.round(svgPosition.x)}, {Math.round(svgPosition.y)})
                  {isWithinBuilding ? ' • Inside building' : ' • Outside building area'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-red-800 font-medium">GPS Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SVG MAP CONTAINER - THIS IS YOUR MAIN MAP */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="relative" style={{ height: '60vh' }}>
            <svg
              viewBox="0 0 815.4284 333.55614"
              className="w-full h-full"
              style={{ background: '#f8f9fa' }}
            >
              {/* Floor Plan Background */}
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
                <g key={`waypoint-${index}`}>
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={index === 0 ? "8" : index === routeSvgCoords.length - 1 ? "8" : "6"}
                    fill={index === 0 ? "#10b981" : index === routeSvgCoords.length - 1 ? "#ef4444" : "#3b82f6"}
                    stroke="white"
                    strokeWidth="2"
                  />
                  {index === 0 && (
                    <text
                      x={coord.x}
                      y={coord.y - 15}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#10b981"
                    >
                      START
                    </text>
                  )}
                  {index === routeSvgCoords.length - 1 && (
                    <text
                      x={coord.x}
                      y={coord.y - 15}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#ef4444"
                    >
                      {cabinet?.name}
                    </text>
                  )}
                </g>
              ))}

              {/* LIVE GPS USER POINTER - THE MAIN FEATURE YOU WANT */}
              {svgPosition && (
                <UserPointer 
                  position={svgPosition}  // SVG coordinates {x, y}
                  isNavigating={isLiveTracking}
                  accuracy={accuracy}
                />
              )}
            </svg>

            {/* Live Tracking Overlay */}
            {isLiveTracking && svgPosition && (
              <div className="absolute top-4 left-4 bg-green-600 bg-opacity-95 rounded-lg p-3 shadow-xl border border-green-400">
                <div className="flex items-center gap-2 text-sm text-white">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="font-bold">🛰️ LIVE GPS TRACKING</span>
                </div>
                <div className="text-xs text-green-100 mt-1">
                  Position: SVG ({Math.round(svgPosition.x)}, {Math.round(svgPosition.y)})
                </div>
                <div className="text-xs text-green-100">
                  Accuracy: ±{Math.round(accuracy || 0)}m
                </div>
              </div>
            )}

            {/* Acquiring GPS Overlay */}
            {isTracking && !svgPosition && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 bg-opacity-95 rounded-lg p-6 shadow-xl">
                <div className="flex items-center gap-3 text-yellow-900">
                  <Loader className="w-6 h-6 animate-spin" />
                  <div>
                    <div className="font-bold text-lg">🛰️ Acquiring GPS Signal...</div>
                    <div className="text-sm mt-1">Please wait while we locate you</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Route Instructions */}
      {showRoute && route && route.length > 0 && (
        <div className="max-w-6xl mx-auto px-2 sm:px-4 mt-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Route size={20} className="text-blue-600" />
              Route Instructions
            </h3>
            <div className="space-y-2">
              {route.map((step, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-green-500' : 
                    index === route.length - 1 ? 'bg-red-500' : 'bg-blue-500'
                  }`}>
                    {index === 0 ? 'S' : index === route.length - 1 ? 'E' : index}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">{step.instruction}</p>
                    {process.env.NODE_ENV === 'development' && (
                      <p className="text-xs text-gray-500 mt-1">
                        SVG: ({Math.round(step.svgCoords.x)}, {Math.round(step.svgCoords.y)})
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Instructions */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Zap className="text-blue-600" size={24} />
            <div>
              <p className="text-blue-800 font-medium">
                {isLiveTracking 
                  ? '🎯 Live GPS tracking is active - Your blue pointer shows your real-time location!'
                  : '📍 Click "Start Live Tracking" to see your live GPS position on the SVG map'
                }
              </p>
              <p className="text-blue-600 text-sm">
                {svgPosition 
                  ? `Your current position: SVG (${Math.round(svgPosition.x)}, ${Math.round(svgPosition.y)})`
                  : 'GPS coordinates will be converted to SVG map coordinates automatically'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;