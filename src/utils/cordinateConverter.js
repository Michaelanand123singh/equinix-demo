// src/utils/coordinateConverter.js
// Utility functions for converting between SVG coordinates and geographic coordinates

// SVG Configuration based on your actual data center floor plan
export const SVG_CONFIG = {
  width: 815.4284,
  height: 333.55614,
  viewBox: { x: 0, y: 0, width: 815.4284, height: 333.55614 }
};

// Geographic bounds for your building (UPDATE THESE WITH ACTUAL COORDINATES)
export const BUILDING_BOUNDS = {
  northEast: { lat: 28.4595, lng: 77.0266 }, // Top-right corner
  southWest: { lat: 28.4585, lng: 77.0256 }  // Bottom-left corner
};

// Get the center of your building
export const BUILDING_CENTER = [
  (BUILDING_BOUNDS.northEast.lat + BUILDING_BOUNDS.southWest.lat) / 2,
  (BUILDING_BOUNDS.northEast.lng + BUILDING_BOUNDS.southWest.lng) / 2
];

/**
 * Convert SVG coordinates to geographic coordinates (lat/lng)
 * @param {number} x - SVG X coordinate
 * @param {number} y - SVG Y coordinate
 * @returns {Array} [latitude, longitude] array for Leaflet
 */
export const svgToLatLng = (x, y) => {
  // Validate input coordinates
  if (typeof x !== 'number' || typeof y !== 'number') {
    console.warn('Invalid coordinates provided to svgToLatLng:', { x, y });
    return [BUILDING_CENTER[0], BUILDING_CENTER[1]];
  }

  // Normalize SVG coordinates to 0-1 range
  const normalizedX = Math.max(0, Math.min(1, x / SVG_CONFIG.width));
  const normalizedY = Math.max(0, Math.min(1, y / SVG_CONFIG.height));
  
  // Convert to geographic coordinates
  // Note: SVG Y increases downward, but latitude increases upward
  const lat = BUILDING_BOUNDS.southWest.lat + 
    (1 - normalizedY) * (BUILDING_BOUNDS.northEast.lat - BUILDING_BOUNDS.southWest.lat);
  
  const lng = BUILDING_BOUNDS.southWest.lng + 
    normalizedX * (BUILDING_BOUNDS.northEast.lng - BUILDING_BOUNDS.southWest.lng);
  
  return [lat, lng]; // Return as [lat, lng] array for Leaflet
};

/**
 * Convert geographic coordinates (lat/lng) to SVG coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} {x, y} SVG coordinates
 */
export const latLngToSvg = (lat, lng) => {
  // Validate input coordinates
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    console.warn('Invalid coordinates provided to latLngToSvg:', { lat, lng });
    return { x: SVG_CONFIG.width / 2, y: SVG_CONFIG.height / 2 };
  }

  // Normalize geographic coordinates to 0-1 range
  const normalizedLat = (lat - BUILDING_BOUNDS.southWest.lat) / 
    (BUILDING_BOUNDS.northEast.lat - BUILDING_BOUNDS.southWest.lat);
  const normalizedLng = (lng - BUILDING_BOUNDS.southWest.lng) / 
    (BUILDING_BOUNDS.northEast.lng - BUILDING_BOUNDS.southWest.lng);
  
  // Convert to SVG coordinates
  // Note: SVG Y increases downward, but latitude increases upward
  const x = normalizedLng * SVG_CONFIG.width;
  const y = (1 - normalizedLat) * SVG_CONFIG.height;
  
  return { x, y };
};

/**
 * Check if geographic coordinates are within building bounds
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if coordinates are within bounds
 */
export const isWithinBounds = (lat, lng) => {
  return lat >= BUILDING_BOUNDS.southWest.lat &&
         lat <= BUILDING_BOUNDS.northEast.lat &&
         lng >= BUILDING_BOUNDS.southWest.lng &&
         lng <= BUILDING_BOUNDS.northEast.lng;
};

/**
 * Check if SVG coordinates are within SVG bounds
 * @param {number} x - SVG X coordinate
 * @param {number} y - SVG Y coordinate
 * @returns {boolean} True if coordinates are within SVG bounds
 */
export const isWithinSvgBounds = (x, y) => {
  return x >= 0 && x <= SVG_CONFIG.width && 
         y >= 0 && y <= SVG_CONFIG.height;
};

/**
 * Clamp geographic coordinates to building bounds
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Array} [latitude, longitude] clamped to bounds
 */
export const clampToBounds = (lat, lng) => {
  const clampedLat = Math.max(
    BUILDING_BOUNDS.southWest.lat, 
    Math.min(BUILDING_BOUNDS.northEast.lat, lat)
  );
  const clampedLng = Math.max(
    BUILDING_BOUNDS.southWest.lng, 
    Math.min(BUILDING_BOUNDS.northEast.lng, lng)
  );
  
  return [clampedLat, clampedLng];
};

/**
 * Clamp SVG coordinates to SVG bounds
 * @param {number} x - SVG X coordinate
 * @param {number} y - SVG Y coordinate
 * @returns {Object} {x, y} clamped to SVG bounds
 */
export const clampToSvgBounds = (x, y) => {
  const clampedX = Math.max(0, Math.min(SVG_CONFIG.width, x));
  const clampedY = Math.max(0, Math.min(SVG_CONFIG.height, y));
  
  return { x: clampedX, y: clampedY };
};

/**
 * Calculate distance between two geographic points using Haversine formula
 * @param {number} lat1 - First point latitude
 * @param {number} lng1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lng2 - Second point longitude
 * @returns {number} Distance in meters
 */
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Calculate distance between two SVG points (in SVG units)
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} Distance in SVG units
 */
export const svgDistance = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Convert an array of SVG coordinates to geographic coordinates
 * @param {Array} svgPoints - Array of {x, y} objects or [x, y] arrays
 * @returns {Array} Array of [lat, lng] coordinates
 */
export const convertSvgPathToLatLng = (svgPoints) => {
  if (!Array.isArray(svgPoints)) {
    console.warn('Invalid SVG points array provided');
    return [];
  }

  return svgPoints.map(point => {
    if (Array.isArray(point)) {
      return svgToLatLng(point[0], point[1]);
    } else if (typeof point === 'object' && point.x !== undefined && point.y !== undefined) {
      return svgToLatLng(point.x, point.y);
    } else {
      console.warn('Invalid point format in SVG path:', point);
      return BUILDING_CENTER;
    }
  });
};

/**
 * Convert an array of geographic coordinates to SVG coordinates
 * @param {Array} latLngPoints - Array of [lat, lng] coordinates
 * @returns {Array} Array of {x, y} SVG coordinates
 */
export const convertLatLngPathToSvg = (latLngPoints) => {
  if (!Array.isArray(latLngPoints)) {
    console.warn('Invalid lat/lng points array provided');
    return [];
  }

  return latLngPoints.map(point => {
    if (Array.isArray(point) && point.length >= 2) {
      return latLngToSvg(point[0], point[1]);
    } else {
      console.warn('Invalid point format in lat/lng path:', point);
      return { x: SVG_CONFIG.width / 2, y: SVG_CONFIG.height / 2 };
    }
  });
};

/**
 * Get building dimensions in meters (approximate)
 * @returns {Object} {width, height} in meters
 */
export const getBuildingDimensions = () => {
  // Calculate approximate building dimensions using Haversine formula
  const width = haversineDistance(
    BUILDING_BOUNDS.southWest.lat, BUILDING_BOUNDS.southWest.lng,
    BUILDING_BOUNDS.southWest.lat, BUILDING_BOUNDS.northEast.lng
  );
  
  const height = haversineDistance(
    BUILDING_BOUNDS.southWest.lat, BUILDING_BOUNDS.southWest.lng,
    BUILDING_BOUNDS.northEast.lat, BUILDING_BOUNDS.southWest.lng
  );
  
  return { width, height };
};

/**
 * Get scale factor between SVG units and meters
 * @returns {Object} {x: scaleX, y: scaleY} scale factors
 */
export const getScaleFactors = () => {
  const dimensions = getBuildingDimensions();
  
  return {
    x: dimensions.width / SVG_CONFIG.width,   // meters per SVG unit (X)
    y: dimensions.height / SVG_CONFIG.height  // meters per SVG unit (Y)
  };
};

// Export default configuration object
export default {
  SVG_CONFIG,
  BUILDING_BOUNDS,
  BUILDING_CENTER,
  svgToLatLng,
  latLngToSvg,
  isWithinBounds,
  isWithinSvgBounds,
  clampToBounds,
  clampToSvgBounds,
  haversineDistance,
  svgDistance,
  convertSvgPathToLatLng,
  convertLatLngPathToSvg,
  getBuildingDimensions,
  getScaleFactors
};