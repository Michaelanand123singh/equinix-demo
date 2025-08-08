// src/hooks/useGPS.js - Updated to provide both GPS and SVG coordinates
import { useState, useEffect, useCallback } from 'react';
import { BUILDING_BOUNDS, BUILDING_CENTER, gpsToSvg, validateSvgCoordinates } from '../data/routes';

const useGPS = () => {
  const [position, setPosition] = useState(null); // GPS coordinates [lat, lng]
  const [svgPosition, setSvgPosition] = useState(null); // SVG coordinates {x, y}
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [accuracy, setAccuracy] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // Check GPS permission status
  const checkPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return 'denied';
    }

    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state);
        return result.state;
      }
      return 'prompt';
    } catch (err) {
      console.warn('Permission API not available:', err);
      return 'prompt';
    }
  }, []);

  // Request GPS permission
  const requestPermission = useCallback(() => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionStatus('granted');
          resolve(position);
        },
        (error) => {
          setPermissionStatus('denied');
          setError(getGPSErrorMessage(error));
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  // Convert GPS to SVG coordinates
  const convertToSvgCoordinates = useCallback((lat, lng) => {
    const svgCoords = gpsToSvg(lat, lng);
    
    // Validate SVG coordinates are within bounds
    if (!validateSvgCoordinates(svgCoords.x, svgCoords.y)) {
      console.warn('⚠️ GPS position is outside SVG bounds:', { lat, lng, svgCoords });
      // Clamp to SVG bounds
      svgCoords.x = Math.max(0, Math.min(815.4284, svgCoords.x));
      svgCoords.y = Math.max(0, Math.min(333.55614, svgCoords.y));
    }
    
    return svgCoords;
  }, []);

  // Check if coordinates are within building bounds
  const isWithinBuilding = useCallback((lat, lng) => {
    return lat >= BUILDING_BOUNDS.southWest.lat && 
           lat <= BUILDING_BOUNDS.northEast.lat &&
           lng >= BUILDING_BOUNDS.southWest.lng && 
           lng <= BUILDING_BOUNDS.northEast.lng;
  }, []);

  // Start GPS tracking
  const startTracking = useCallback(async () => {
    try {
      setError(null);
      
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const permission = await checkPermission();
      
      if (permission === 'denied') {
        throw new Error('Location access is denied. Please enable location services and refresh the page.');
      }

      if (permission === 'prompt') {
        await requestPermission();
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000
      };

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy: posAccuracy } = position.coords;
          
          // Update GPS position
          setPosition([latitude, longitude]);
          setAccuracy(posAccuracy);
          setError(null);
          
          // Convert to SVG coordinates for display
          const svgCoords = convertToSvgCoordinates(latitude, longitude);
          setSvgPosition(svgCoords);
          
          console.log('🛰️ GPS Update:', {
            gps: { lat: latitude, lng: longitude },
            svg: svgCoords,
            accuracy: posAccuracy,
            withinBuilding: isWithinBuilding(latitude, longitude),
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          const errorMsg = getGPSErrorMessage(error);
          setError(errorMsg);
          console.error('❌ GPS Error:', error, errorMsg);
          
          // For demo purposes, fall back to simulated tracking
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ GPS failed, starting simulation for demo');
            startSimulatedTracking();
          }
        },
        options
      );

      setWatchId(id);
      setIsTracking(true);
      
    } catch (err) {
      setError(err.message);
      console.error('❌ Failed to start GPS tracking:', err);
      
      // For demo, start simulation
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Starting simulated tracking for demo');
        startSimulatedTracking();
      }
    }
  }, [checkPermission, requestPermission, convertToSvgCoordinates, isWithinBuilding]);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    if (watchId) {
      if (typeof watchId === 'number') {
        navigator.geolocation.clearWatch(watchId);
      } else {
        clearInterval(watchId); // For simulated tracking
      }
      setWatchId(null);
    }
    
    setIsTracking(false);
    setPosition(null);
    setSvgPosition(null);
    setAccuracy(null);
    setError(null);
    
    console.log('🛑 GPS tracking stopped');
  }, [watchId]);

  // Simulated tracking for demo
  const startSimulatedTracking = useCallback(() => {
    console.log('🎭 Starting simulated GPS tracking from reference point');
    
    // Start at your reference point: GPS [28.4590, 77.0260] -> SVG [235.238, 110.773]
    let currentPos = [28.4590, 77.0260];
    
    setPosition(currentPos);
    setSvgPosition({ x: 235.238, y: 110.773 });
    setAccuracy(5);
    setIsTracking(true);
    setError(null);

    // Simulate movement every 3 seconds
    const interval = setInterval(() => {
      // Small random movement (about 1-2 meters)
      const latOffset = (Math.random() - 0.5) * 0.00002;
      const lngOffset = (Math.random() - 0.5) * 0.00002;
      
      currentPos = [
        Math.max(BUILDING_BOUNDS.southWest.lat, 
          Math.min(BUILDING_BOUNDS.northEast.lat, currentPos[0] + latOffset)),
        Math.max(BUILDING_BOUNDS.southWest.lng, 
          Math.min(BUILDING_BOUNDS.northEast.lng, currentPos[1] + lngOffset))
      ];
      
      setPosition([...currentPos]);
      
      // Convert to SVG coordinates
      const svgCoords = convertToSvgCoordinates(currentPos[0], currentPos[1]);
      setSvgPosition(svgCoords);
      setAccuracy(Math.random() * 10 + 3); // 3-13m accuracy
      
      console.log('🎭 Simulated GPS Update:', {
        gps: { lat: currentPos[0], lng: currentPos[1] },
        svg: svgCoords,
        timestamp: new Date().toISOString()
      });
    }, 3000);

    setWatchId(interval);
  }, [convertToSvgCoordinates]);

  // Get current position once
  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const svgCoords = convertToSvgCoordinates(latitude, longitude);
          
          resolve({
            coords: [latitude, longitude],
            svgCoords,
            accuracy,
            withinBuilding: isWithinBuilding(latitude, longitude)
          });
        },
        (error) => {
          reject(new Error(getGPSErrorMessage(error)));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, [convertToSvgCoordinates, isWithinBuilding]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        if (typeof watchId === 'number') {
          navigator.geolocation.clearWatch(watchId);
        } else {
          clearInterval(watchId);
        }
      }
    };
  }, [watchId]);

  return {
    position,           // [lat, lng] GPS coordinates for Leaflet
    svgPosition,       // {x, y} SVG coordinates for SVG display
    isTracking,
    error,
    accuracy,
    permissionStatus,
    startTracking,
    stopTracking,
    getCurrentPosition,
    checkPermission,
    isWithinBuilding: position ? isWithinBuilding(position[0], position[1]) : false
  };
};

// Helper function for GPS error messages
const getGPSErrorMessage = (error) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access denied. Please allow location access and try again.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable. Please check your GPS/WiFi connection.';
    case error.TIMEOUT:
      return 'Location request timed out. Please try again.';
    default:
      return `GPS Error: ${error.message}`;
  }
};

export default useGPS;