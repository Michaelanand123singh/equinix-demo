// src/hooks/useGPS.js - Updated to provide both GPS and SVG coordinates
import { useState, useEffect, useCallback, useRef } from 'react';
import { BUILDING_BOUNDS, SVG_CONFIG, REFERENCE_POINTS, gpsToSvg, validateSvgCoordinates } from '../data/routes';

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

  // Rolling GPS samples for 3s averaging
  const gpsSamplesRef = useRef([]); // [{ t: ms, lat, lng, acc }]
  const SMOOTHING_WINDOW_MS = 800;
  // Offsite mapping calibration so movement still shows on SVG when outside building bounds
  const offsiteCalibrationRef = useRef(null); // { baseGPS: {lat, lng}, baseSVG: {x, y} }
  const METERS_TO_PIXELS = 2.0; // increase scale when offsite so 1m is more visible

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

  // Compute average of last 3 seconds of samples
  const computeAveragedFix = useCallback((nowMs) => {
    const cutoff = nowMs - SMOOTHING_WINDOW_MS;
    // prune old samples
    gpsSamplesRef.current = gpsSamplesRef.current.filter(s => s.t >= cutoff);
    const n = gpsSamplesRef.current.length;
    if (n === 0) return null;
    const sum = gpsSamplesRef.current.reduce((acc, s) => {
      acc.lat += s.lat;
      acc.lng += s.lng;
      if (typeof s.acc === 'number') acc.accSum += s.acc;
      acc.countAcc += typeof s.acc === 'number' ? 1 : 0;
      return acc;
    }, { lat: 0, lng: 0, accSum: 0, countAcc: 0 });
    return {
      lat: sum.lat / n,
      lng: sum.lng / n,
      accuracy: sum.countAcc > 0 ? (sum.accSum / sum.countAcc) : null,
      samples: n
    };
  }, []);
  
  // Convert GPS to SVG when user is outside building bounds by anchoring to SVG center
  const convertOffsiteToSvg = useCallback((lat, lng) => {
    if (!offsiteCalibrationRef.current) {
      offsiteCalibrationRef.current = {
        baseGPS: { lat, lng },
        // Anchor to the known START point on the SVG (cabinet A1 start)
        baseSVG: { x: REFERENCE_POINTS.svg[0], y: REFERENCE_POINTS.svg[1] }
      };
    }
    const { baseGPS, baseSVG } = offsiteCalibrationRef.current;

    const meanLatRad = ((lat + baseGPS.lat) / 2) * Math.PI / 180;
    const metersPerDegLat = 111_132;
    const metersPerDegLng = 111_320 * Math.cos(meanLatRad);

    const deltaLatMeters = (lat - baseGPS.lat) * metersPerDegLat;
    const deltaLngMeters = (lng - baseGPS.lng) * metersPerDegLng;

    let x = baseSVG.x + (deltaLngMeters * METERS_TO_PIXELS);
    let y = baseSVG.y - (deltaLatMeters * METERS_TO_PIXELS);

    x = Math.max(0, Math.min(SVG_CONFIG.width, x));
    y = Math.max(0, Math.min(SVG_CONFIG.height, y));

    return { x, y };
  }, []);

  // Check if coordinates are within building bounds
  const isWithinBuilding = useCallback((lat, lng) => {
    return lat >= BUILDING_BOUNDS.southWest.lat && 
           lat <= BUILDING_BOUNDS.northEast.lat &&
           lng >= BUILDING_BOUNDS.southWest.lng && 
           lng <= BUILDING_BOUNDS.northEast.lng;
  }, []);

  // Simulated tracking for demo (move above to satisfy dependency ordering)
  const startSimulatedTracking = useCallback(() => {
    console.log('🎭 Starting simulated GPS tracking from reference point');
    
    // Start at your reference point: GPS [28.4590, 77.0260] -> SVG [235.238, 110.773]
    let currentPos = [28.4590, 77.0260];
    
    // feed initial sample into buffer and compute average
    const now0 = Date.now();
    gpsSamplesRef.current.push({ t: now0, lat: currentPos[0], lng: currentPos[1], acc: 5 });
    const avg0 = computeAveragedFix(now0) || { lat: currentPos[0], lng: currentPos[1], accuracy: 5 };

    setPosition([avg0.lat, avg0.lng]);
    setSvgPosition({ x: 235.238, y: 110.773 });
    setAccuracy(avg0.accuracy ?? 5);
    setIsTracking(true);
    setError(null);

    // Simulate movement every 1 second
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
      
      // sample -> average
      const now = Date.now();
      const simAcc = Math.random() * 10 + 3;
      gpsSamplesRef.current.push({ t: now, lat: currentPos[0], lng: currentPos[1], acc: simAcc });
      const averaged = computeAveragedFix(now) || { lat: currentPos[0], lng: currentPos[1], accuracy: simAcc };

      setPosition([averaged.lat, averaged.lng]);
      
      // Convert to SVG coordinates using averaged coords
      const svgCoords = convertToSvgCoordinates(averaged.lat, averaged.lng);
      setSvgPosition(svgCoords);
      setAccuracy(averaged.accuracy ?? simAcc);
      
      console.log('🎭 Simulated GPS Update (avg 3s):', {
        gps: { lat: averaged.lat, lng: averaged.lng },
        svg: svgCoords,
        timestamp: new Date().toISOString()
      });
    }, 1000);

    setWatchId(interval);
  }, [convertToSvgCoordinates, computeAveragedFix]);

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
        maximumAge: 0
      };

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy: posAccuracy } = position.coords;
          const now = Date.now();
          // push sample and compute 3s average
          gpsSamplesRef.current.push({ t: now, lat: latitude, lng: longitude, acc: posAccuracy });
          const averaged = computeAveragedFix(now) || { lat: latitude, lng: longitude, accuracy: posAccuracy, samples: 1 };

          // Update GPS position (averaged)
          setPosition([averaged.lat, averaged.lng]);
          setAccuracy(averaged.accuracy ?? posAccuracy);
          setError(null);
          
          // Convert to SVG coordinates for display using averaged coords
          const within = isWithinBuilding(averaged.lat, averaged.lng);
          const svgCoords = within
            ? (offsiteCalibrationRef.current = null, convertToSvgCoordinates(averaged.lat, averaged.lng))
            : convertOffsiteToSvg(averaged.lat, averaged.lng);
          setSvgPosition(svgCoords);
          
          console.log('🛰️ GPS Update (avg 3s):', {
            gps: { lat: averaged.lat, lng: averaged.lng },
            svg: svgCoords,
            accuracy: averaged.accuracy ?? posAccuracy,
            samples: averaged.samples,
            withinBuilding: within,
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
  }, [checkPermission, requestPermission, convertToSvgCoordinates, convertOffsiteToSvg, isWithinBuilding, computeAveragedFix, startSimulatedTracking]);

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
    gpsSamplesRef.current = [];
    offsiteCalibrationRef.current = null;
    
    console.log('🛑 GPS tracking stopped');
  }, [watchId]);

  // (moved earlier)

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