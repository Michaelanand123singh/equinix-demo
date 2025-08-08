// src/hooks/useGPS.js - Simplified
import { useState, useCallback } from 'react';
import { gpsToSvg } from '../data/routes';

const useGPS = () => {
  const [position, setPosition] = useState(null); // GPS coordinates [lat, lng]
  const [svgPosition, setSvgPosition] = useState(null); // SVG coordinates {x, y}
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // Start GPS tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: posAccuracy } = pos.coords;
        
        setPosition([latitude, longitude]);
        setAccuracy(posAccuracy);
        setError(null);
        
        // Convert to SVG coordinates
        const svgCoords = gpsToSvg(latitude, longitude);
        setSvgPosition(svgCoords);
      },
      (err) => {
        setError('GPS error: ' + err.message);
      },
      options
    );

    setWatchId(id);
    setIsTracking(true);
  }, []);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setIsTracking(false);
    setPosition(null);
    setSvgPosition(null);
    setAccuracy(null);
    setError(null);
  }, [watchId]);

  // Get current position once
  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const svgCoords = gpsToSvg(latitude, longitude);
          
          resolve({
            coords: [latitude, longitude],
            svgCoords,
            accuracy
          });
        },
        (err) => reject(new Error(err.message)),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  return {
    position,           // [lat, lng] GPS coordinates
    svgPosition,       // {x, y} SVG coordinates
    isTracking,
    error,
    accuracy,
    startTracking,
    stopTracking,
    getCurrentPosition
  };
};

export default useGPS;