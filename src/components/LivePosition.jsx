import React, { useEffect, useState } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NAVIGATION_CONFIG } from '../mapData';

// Create custom user position icon
const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: ${NAVIGATION_CONFIG.userColor};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      " class="pulse-animation">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    className: 'custom-user-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const LivePosition = ({ route, onArrival, isNavigating }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const map = useMap();

  useEffect(() => {
    if (!route || route.length === 0 || !isNavigating) {
      setCurrentPosition(null);
      setCurrentIndex(0);
      setProgress(0);
      return;
    }

    // Start at the first position
    setCurrentPosition(route[0]);
    setCurrentIndex(0);
    setProgress(0);

    let intervalId;
    let currentIdx = 0;

    const moveToNextPosition = () => {
      if (currentIdx >= route.length - 1) {
        // Arrived at destination
        clearInterval(intervalId);
        onArrival();
        return;
      }

      currentIdx++;
      const nextPosition = route[currentIdx];
      setCurrentPosition(nextPosition);
      setCurrentIndex(currentIdx);
      setProgress((currentIdx / (route.length - 1)) * 100);

      // Center map on current position
      map.setView([nextPosition.lat, nextPosition.lng], map.getZoom());
    };

    // Start moving after a short delay
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(moveToNextPosition, NAVIGATION_CONFIG.walkingSpeed);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [route, isNavigating, onArrival, map]);

  if (!currentPosition || !isNavigating) {
    return null;
  }

  return (
    <>
      <Marker
        position={[currentPosition.lat, currentPosition.lng]}
        icon={createUserIcon()}
        zIndexOffset={1000}
      />
      
      {/* Progress indicator */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Walking to destination...
            </span>
            <span className="text-sm text-blue-600 font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Step {currentIndex + 1} of {route?.length || 0}
          </div>
        </div>
      </div>
    </>
  );
};

export default LivePosition;