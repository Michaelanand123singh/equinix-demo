// src/utils/gpsUtils.js

// Building configuration - Update these values based on your actual building
const BUILDING_CONFIG = {
  // GPS coordinates of building corners (you'll need to measure these)
  topLeft: { lat: 28.4595, lng: 77.0266 },     // Example coordinates
  bottomRight: { lat: 28.4585, lng: 77.0276 }, // Update with your building's actual coordinates
  
  // SVG dimensions (should match your SVG viewBox)
  svgWidth: 800,
  svgHeight: 600,
  
  // Building entrance GPS coordinates
  entranceGPS: { lat: 28.4590, lng: 77.0270 },
  entranceSVG: { x: 50, y: 500 }
};

/**
 * Convert GPS coordinates to building/SVG coordinates
 * @param {number} latitude - GPS latitude
 * @param {number} longitude - GPS longitude
 * @returns {object} - {x, y} coordinates on the SVG
 */
export const convertGPSToBuilding = (latitude, longitude) => {
  const { topLeft, bottomRight, svgWidth, svgHeight } = BUILDING_CONFIG;
  
  // Calculate GPS bounds
  const latRange = topLeft.lat - bottomRight.lat;
  const lngRange = bottomRight.lng - topLeft.lng;
  
  // Convert to normalized coordinates (0-1)
  const normalizedX = (longitude - topLeft.lng) / lngRange;
  const normalizedY = (topLeft.lat - latitude) / latRange;
  
  // Convert to SVG coordinates
  const x = normalizedX * svgWidth;
  const y = normalizedY * svgHeight;
  
  // Ensure coordinates are within bounds
  return {
    x: Math.max(0, Math.min(svgWidth, x)),
    y: Math.max(0, Math.min(svgHeight, y))
  };
};

/**
 * Convert building/SVG coordinates back to GPS coordinates
 * @param {number} x - X coordinate on SVG
 * @param {number} y - Y coordinate on SVG
 * @returns {object} - {lat, lng} GPS coordinates
 */
export const convertBuildingToGPS = (x, y) => {
  const { topLeft, bottomRight, svgWidth, svgHeight } = BUILDING_CONFIG;
  
  // Convert to normalized coordinates
  const normalizedX = x / svgWidth;
  const normalizedY = y / svgHeight;
  
  // Calculate GPS bounds
  const latRange = topLeft.lat - bottomRight.lat;
  const lngRange = bottomRight.lng - topLeft.lng;
  
  // Convert back to GPS
  const latitude = topLeft.lat - (normalizedY * latRange);
  const longitude = topLeft.lng + (normalizedX * lngRange);
  
  return { lat: latitude, lng: longitude };
};

/**
 * Calculate distance between two points
 * @param {object} point1 - {x, y} coordinates
 * @param {object} point2 - {x, y} coordinates
 * @returns {number} - Distance in pixels
 */
export const calculateDistance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
};

/**
 * Check if user has reached a waypoint
 * @param {object} userPos - Current user position {x, y}
 * @param {object} waypoint - Target waypoint {x, y}
 * @param {number} threshold - Distance threshold (default: 20 pixels)
 * @returns {boolean} - True if reached
 */
export const hasReachedWaypoint = (userPos, waypoint, threshold = 20) => {
  return calculateDistance(userPos, waypoint) <= threshold;
};