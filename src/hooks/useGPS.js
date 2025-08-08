// src/hooks/useGPS.js - Live GPS Implementation
import { useState, useEffect, useCallback } from 'react';
import { svgToLatLng, latLngToSvg, BUILDING_BOUNDS } from '../data/routes';

const useGPS = () => {
  const [position, setPosition] = useState(null);
  const [svgPosition, setSvgPosition] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'granted', 'denied', 'prompt'
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

  // Request GPS permission and start tracking
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

  // Convert GPS coordinates to building coordinates
  const convertToSvgCoordinates = useCallback((lat, lng) => {
    // Check if coordinates are within building bounds
    if (lat < BUILDING_BOUNDS.southWest.lat || 
        lat > BUILDING_BOUNDS.northEast.lat ||
        lng < BUILDING_BOUNDS.southWest.lng || 
        lng > BUILDING_BOUNDS.northEast.lng) {
      
      // If outside building, use entrance coordinates as fallback
      return { x: 235.238, y: 110.773 }; // Entrance position
    }

    return latLngToSvg(lat, lng);
  }, []);

  // Start GPS tracking
  const startTracking = useCallback(async () => {
    try {
      setError(null);
      
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Check current permission
      const permission = await checkPermission();
      
      if (permission === 'denied') {
        throw new Error('Location access is denied. Please enable location services and refresh the page.');
      }

      // Request permission if needed
      if (permission === 'prompt') {
        await requestPermission();
      }

      // Start watching position
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000 // Cache for 1 second
      };

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy: posAccuracy } = position.coords;
          
          // Update state with new position
          setPosition([latitude, longitude]);
          setAccuracy(posAccuracy);
          setError(null);
          
          // Convert to SVG coordinates
          const svgCoords = convertToSvgCoordinates(latitude, longitude);
          setSvgPosition(svgCoords);
          
          console.log('GPS Update:', {
            lat: latitude,
            lng: longitude,
            accuracy: posAccuracy,
            svgCoords
          });
        },
        (error) => {
          const errorMsg = getGPSErrorMessage(error);
          setError(errorMsg);
          console.error('GPS Error:', error, errorMsg);
          
          // For demo purposes, fall back to simulated tracking if GPS fails
          if (process.env.NODE_ENV === 'development') {
            console.warn('GPS failed, falling back to simulation for demo');
            startSimulatedTracking();
          }
        },
        options
      );

      setWatchId(id);
      setIsTracking(true);
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to start GPS tracking:', err);
      
      // For demo purposes, fall back to simulation
      if (process.env.NODE_ENV === 'development') {
        console.warn('Starting simulated tracking for demo');
        startSimulatedTracking();
      }
    }
  }, [checkPermission, requestPermission, convertToSvgCoordinates]);

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

  // Simulated tracking for demo/testing purposes
  const startSimulatedTracking = useCallback(() => {
    console.log('Starting simulated GPS tracking');
    
    // Start at building entrance
    const entranceLatLng = svgToLatLng(235.238, 110.773);
    let currentPos = [...entranceLatLng];
    
    setPosition(currentPos);
    setSvgPosition({ x: 235.238, y: 110.773 });
    setIsTracking(true);
    setError(null);

    // Simulate movement every 3 seconds
    const interval = setInterval(() => {
      // Small random movement within building bounds
      const latOffset = (Math.random() - 0.5) * 0.00002; // ~2 meters
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
      
      console.log('Simulated GPS Update:', {
        lat: currentPos[0],
        lng: currentPos[1],
        svgCoords
      });
    }, 3000);

    // Store interval ID for cleanup
    setWatchId(interval);
  }, [convertToSvgCoordinates]);

  // Get current position once (for initial location)
  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const svgCoords = convertToSvgCoordinates(latitude, longitude);
          
          resolve({
            coords: [latitude, longitude],
            svgCoords,
            accuracy: position.coords.accuracy
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
  }, [convertToSvgCoordinates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        if (typeof watchId === 'number') {
          navigator.geolocation.clearWatch(watchId);
        } else {
          clearInterval(watchId); // For simulated tracking
        }
      }
    };
  }, [watchId]);

  return {
    position,           // [lat, lng] GPS coordinates
    svgPosition,       // {x, y} SVG coordinates
    isTracking,
    error,
    accuracy,
    permissionStatus,
    startTracking,
    stopTracking,
    getCurrentPosition,
    checkPermission
  };
};

// Helper function to get user-friendly GPS error messages
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