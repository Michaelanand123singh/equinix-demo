// src/hooks/useGPS.js - Updated for React-Leaflet coordinates
import { useState, useEffect, useCallback } from 'react';
import { svgToLatLng } from '../data/routes';

const useGPS = () => {
  const [position, setPosition] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);

  // Simulated GPS tracking for demo (replace with real GPS)
  useEffect(() => {
    let interval;
    
    if (isTracking) {
      // Start with entrance position in lat/lng format
      let currentPos = svgToLatLng(50, 500); // Convert entrance SVG to lat/lng
      setPosition(currentPos);
      
      // Simulate movement every 2 seconds
      interval = setInterval(() => {
        setPosition(prev => {
          if (!prev) return svgToLatLng(50, 500);
          
          // Small random movement (very small for geographic coordinates)
          const latOffset = (Math.random() - 0.5) * 0.00001;
          const lngOffset = (Math.random() - 0.5) * 0.00001;
          
          return [
            Math.max(28.4585, Math.min(28.4595, prev[0] + latOffset)),
            Math.max(77.0256, Math.min(77.0266, prev[1] + lngOffset))
          ];
        });
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  // Real GPS implementation (uncomment for actual GPS tracking)
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
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
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