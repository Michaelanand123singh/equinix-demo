// src/utils/gpsUtils.js - Enhanced GPS utilities with live tracking
import { svgToLatLng, latLngToSvg, BUILDING_BOUNDS, SVG_CONFIG } from '../data/routes';

/**
 * GPS Utility functions for live tracking
 */

// Validate if GPS coordinates are within reasonable building bounds
export const isWithinBuildingBounds = (lat, lng, bufferMeters = 50) => {
  // Add buffer zone around building
  const latBuffer = (bufferMeters / 111000); // Roughly 1 degree lat = 111km
  const lngBuffer = (bufferMeters / (111000 * Math.cos(lat * Math.PI / 180)));
  
  const bounds = {
    north: BUILDING_BOUNDS.northEast.lat + latBuffer,
    south: BUILDING_BOUNDS.southWest.lat - latBuffer,
    east: BUILDING_BOUNDS.northEast.lng + lngBuffer,
    west: BUILDING_BOUNDS.southWest.lng - lngBuffer
  };
  
  return lat >= bounds.south && lat <= bounds.north && 
         lng >= bounds.west && lng <= bounds.east;
};

/**
 * Convert GPS coordinates to SVG coordinates with validation
 * @param {number} latitude - GPS latitude
 * @param {number} longitude - GPS longitude
 * @returns {object} - {x, y, isValid} SVG coordinates
 */
export const convertGPSToSVG = (latitude, longitude) => {
  const isValid = isWithinBuildingBounds(latitude, longitude);
  
  if (!isValid) {
    // Return entrance coordinates if outside building
    console.warn('GPS coordinates outside building bounds, using entrance position');
    return {
      x: 235.238,
      y: 110.773,
      isValid: false
    };
  }
  
  const svgCoords = latLngToSvg(latitude, longitude);
  
  // Ensure coordinates are within SVG bounds
  const clampedCoords = {
    x: Math.max(0, Math.min(SVG_CONFIG.width, svgCoords.x)),
    y: Math.max(0, Math.min(SVG_CONFIG.height, svgCoords.y)),
    isValid: true
  };
  
  return clampedCoords;
};

/**
 * Convert SVG coordinates to GPS coordinates
 * @param {number} x - SVG x coordinate
 * @param {number} y - SVG y coordinate
 * @returns {object} - {lat, lng} GPS coordinates
 */
export const convertSVGToGPS = (x, y) => {
  const latLng = svgToLatLng(x, y);
  return {
    lat: latLng[0],
    lng: latLng[1]
  };
};

/**
 * Calculate distance between two GPS points (Haversine formula)
 * @param {array} point1 - [lat, lng]
 * @param {array} point2 - [lat, lng]
 * @returns {number} - Distance in meters
 */
export const calculateGPSDistance = (point1, point2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1[0] * Math.PI / 180;
  const φ2 = point2[0] * Math.PI / 180;
  const Δφ = (point2[0] - point1[0]) * Math.PI / 180;
  const Δλ = (point2[1] - point1[1]) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Calculate distance between two SVG points
 * @param {object} point1 - {x, y}
 * @param {object} point2 - {x, y}
 * @returns {number} - Distance in SVG units
 */
export const calculateSVGDistance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
};

/**
 * Check if user has reached a waypoint
 * @param {array} userGPS - [lat, lng] current GPS position
 * @param {array} waypointGPS - [lat, lng] target waypoint
 * @param {number} thresholdMeters - Distance threshold in meters (default: 5m)
 * @returns {boolean} - True if reached
 */
export const hasReachedWaypoint = (userGPS, waypointGPS, thresholdMeters = 5) => {
  const distance = calculateGPSDistance(userGPS, waypointGPS);
  return distance <= thresholdMeters;
};

/**
 * Find closest waypoint to current GPS position
 * @param {array} currentGPS - [lat, lng] current position
 * @param {array} routeCoords - Array of [lat, lng] waypoints
 * @returns {object} - {index, waypoint, distance}
 */
export const findClosestWaypoint = (currentGPS, routeCoords) => {
  if (!currentGPS || !routeCoords || routeCoords.length === 0) return null;
  
  let closestIndex = 0;
  let closestDistance = Infinity;
  
  routeCoords.forEach((waypoint, index) => {
    const distance = calculateGPSDistance(currentGPS, waypoint);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  
  return {
    index: closestIndex,
    waypoint: routeCoords[closestIndex],
    distance: closestDistance
  };
};

/**
 * Calculate route progress based on GPS position
 * @param {array} currentGPS - [lat, lng] current position
 * @param {array} routeCoords - Array of [lat, lng] waypoints
 * @returns {object} - {progress, closestWaypoint, distanceToNext}
 */
export const calculateRouteProgress = (currentGPS, routeCoords) => {
  if (!currentGPS || !routeCoords || routeCoords.length < 2) {
    return { progress: 0, closestWaypoint: null, distanceToNext: null };
  }
  
  const closest = findClosestWaypoint(currentGPS, routeCoords);
  if (!closest) return { progress: 0, closestWaypoint: null, distanceToNext: null };
  
  // Calculate progress as percentage
  let progress = (closest.index / (routeCoords.length - 1)) * 100;
  
  // If not at the end, calculate more precise progress between waypoints
  if (closest.index < routeCoords.length - 1) {
    const currentWaypoint = routeCoords[closest.index];
    const nextWaypoint = routeCoords[closest.index + 1];
    
    const totalSegmentDistance = calculateGPSDistance(currentWaypoint, nextWaypoint);
    const distanceToNext = calculateGPSDistance(currentGPS, nextWaypoint);
    const distanceFromStart = calculateGPSDistance(currentWaypoint, currentGPS);
    
    // Calculate progress within current segment
    const segmentProgress = Math.min(1, distanceFromStart / totalSegmentDistance);
    const segmentWeight = 100 / (routeCoords.length - 1);
    
    progress = (closest.index * segmentWeight) + (segmentProgress * segmentWeight);
    
    return {
      progress: Math.min(100, Math.max(0, progress)),
      closestWaypoint: closest,
      distanceToNext: distanceToNext,
      currentSegment: {
        from: closest.index,
        to: closest.index + 1,
        progress: segmentProgress
      }
    };
  }
  
  return {
    progress: Math.min(100, Math.max(0, progress)),
    closestWaypoint: closest,
    distanceToNext: 0
  };
};

/**
 * Get navigation instruction based on current position
 * @param {array} currentGPS - [lat, lng] current position
 * @param {array} route - Route array with instructions
 * @param {number} progressPercent - Current progress percentage
 * @returns {object} - {instruction, stepIndex, isComplete}
 */
export const getCurrentInstruction = (currentGPS, route, progressPercent) => {
  if (!route || route.length === 0) {
    return { instruction: "Route not available", stepIndex: 0, isComplete: false };
  }
  
  if (progressPercent >= 100) {
    return { 
      instruction: "You have arrived at your destination!", 
      stepIndex: route.length - 1, 
      isComplete: true 
    };
  }
  
  const stepIndex = Math.min(
    Math.floor((progressPercent / 100) * route.length),
    route.length - 1
  );
  
  return {
    instruction: route[stepIndex]?.instruction || "Continue following the route",
    stepIndex,
    isComplete: false
  };
};

/**
 * Smooth GPS coordinates to reduce jitter
 * @param {array} newPosition - [lat, lng] new GPS position
 * @param {array} lastPosition - [lat, lng] previous GPS position
 * @param {number} smoothingFactor - Smoothing factor (0-1, default: 0.3)
 * @returns {array} - [lat, lng] smoothed position
 */
export const smoothGPSPosition = (newPosition, lastPosition, smoothingFactor = 0.3) => {
  if (!lastPosition) return newPosition;
  
  const smoothedLat = lastPosition[0] + smoothingFactor * (newPosition[0] - lastPosition[0]);
  const smoothedLng = lastPosition[1] + smoothingFactor * (newPosition[1] - lastPosition[1]);
  
  return [smoothedLat, smoothedLng];
};

/**
 * Check GPS accuracy and provide feedback
 * @param {number} accuracy - GPS accuracy in meters
 * @returns {object} - {level, message, color}
 */
export const getGPSAccuracyInfo = (accuracy) => {
  if (accuracy <= 5) {
    return {
      level: 'excellent',
      message: 'Excellent GPS accuracy',
      color: 'green'
    };
  } else if (accuracy <= 10) {
    return {
      level: 'good',
      message: 'Good GPS accuracy',
      color: 'green'
    };
  } else if (accuracy <= 20) {
    return {
      level: 'fair',
      message: 'Fair GPS accuracy',
      color: 'yellow'
    };
  } else {
    return {
      level: 'poor',
      message: 'Poor GPS accuracy - consider moving outdoors',
      color: 'red'
    };
  }
};

/**
 * Validate GPS position quality
 * @param {object} position - GPS position object with coords and timestamp
 * @param {number} maxAge - Maximum age in milliseconds (default: 30 seconds)
 * @returns {object} - {isValid, reason}
 */
export const validateGPSPosition = (position, maxAge = 30000) => {
  if (!position || !position.coords) {
    return { isValid: false, reason: 'No GPS data available' };
  }
  
  const now = Date.now();
  const positionAge = now - position.timestamp;
  
  if (positionAge > maxAge) {
    return { isValid: false, reason: 'GPS data is too old' };
  }
  
  if (position.coords.accuracy > 100) {
    return { isValid: false, reason: 'GPS accuracy is too poor' };
  }
  
  const { lat, lng } = position.coords;
  if (!isWithinBuildingBounds(lat, lng, 100)) {
    return { isValid: false, reason: 'Position is too far from building' };
  }
  
  return { isValid: true, reason: 'GPS position is valid' };
};

/**
 * Format GPS coordinates for display
 * @param {array} coords - [lat, lng]
 * @param {number} precision - Decimal places (default: 6)
 * @returns {string} - Formatted coordinates
 */
export const formatGPSCoordinates = (coords, precision = 6) => {
  if (!coords || coords.length !== 2) return 'N/A';
  return `${coords[0].toFixed(precision)}, ${coords[1].toFixed(precision)}`;
};

/**
 * Debug function to log GPS tracking information
 * @param {object} gpsData - GPS data object
 */
export const debugGPSTracking = (gpsData) => {
  const {
    position,
    svgPosition,
    accuracy,
    timestamp,
    isTracking
  } = gpsData;
  
  console.group('🛰️ GPS Tracking Debug');
  console.log('Tracking Status:', isTracking ? '✅ Active' : '❌ Inactive');
  
  if (position) {
    console.log('GPS Coordinates:', formatGPSCoordinates(position));
    console.log('Accuracy:', accuracy ? `±${Math.round(accuracy)}m` : 'Unknown');
    console.log('Within Building:', isWithinBuildingBounds(position[0], position[1]));
    
    if (svgPosition) {
      console.log('SVG Coordinates:', `(${Math.round(svgPosition.x)}, ${Math.round(svgPosition.y)})`);
    }
    
    if (timestamp) {
      const age = (Date.now() - timestamp) / 1000;
      console.log('Data Age:', `${age.toFixed(1)}s`);
    }
  } else {
    console.log('GPS Position:', 'Not available');
  }
  
  console.groupEnd();
};

export default {
  isWithinBuildingBounds,
  convertGPSToSVG,
  convertSVGToGPS,
  calculateGPSDistance,
  calculateSVGDistance,
  hasReachedWaypoint,
  findClosestWaypoint,
  calculateRouteProgress,
  getCurrentInstruction,
  smoothGPSPosition,
  getGPSAccuracyInfo,
  validateGPSPosition,
  formatGPSCoordinates,
  debugGPSTracking
};