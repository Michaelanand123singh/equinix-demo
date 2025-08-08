// src/hooks/useGPS.js
import { useState, useEffect, useCallback } from 'react';
import { convertGPSToBuilding } from '../utils/gpsUtils';

const useGPS = () => {
  const [position, setPosition] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);

  // Simulated movement for demo purposes
  // In real implementation, this would use actual GPS
  useEffect(() => {
    let interval;
    
    if (isTracking) {
      // Start with a demo position
      let currentPos = { x: 50, y: 500, heading: 0 };
      setPosition(currentPos);
      
      // Simulate movement every 2 seconds
      interval = setInterval(() => {
        setPosition(prev => {
          if (!prev) return { x: 50, y: 500, heading: 0 };
          
          // Simple simulation: move slightly in random direction
          const newX = prev.x + (Math.random() - 0.5) * 10;
          const newY = prev.y + (Math.random() - 0.5) * 10;
          const newHeading = prev.heading + (Math.random() - 0.5) * 0.2;
          
          return {
            x: Math.max(0, Math.min(800, newX)), // Keep within bounds
            y: Math.max(0, Math.min(600, newY)),
            heading: newHeading,
            timestamp: Date.now()
          };
        });
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  // Real GPS implementation (commented out - use this for actual GPS)
  /*
  useEffect(() => {
    let watchId;
    
    if (isTracking) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading } = position.coords;
          
          // Convert GPS to building coordinates
          const buildingPos = convertGPSToBuilding(latitude, longitude);
          
          setPosition({
            x: buildingPos.x,
            y: buildingPos.y,
            heading: heading || 0,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
          
          setError(null);
        },
        (error) => {
          setError(error.message);
          console.error('GPS Error:', error);
        },
        options
      );
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking]);
  */

  const startTracking = useCallback(() => {
    setIsTracking(true);
    setError(null);
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    setPosition(null);
  }, []);

  return {
    position,
    isTracking,
    error,
    startTracking,
    stopTracking
  };
};

export default useGPS;