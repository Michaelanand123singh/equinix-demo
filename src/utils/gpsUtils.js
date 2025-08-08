// src/utils/gpsUtils.js - Simplified
import { latLngToSvg } from '../data/routes';

/**
 * Convert GPS coordinates to SVG coordinates
 */
export const convertGPSToSVG = (latitude, longitude) => {
  const svgCoords = latLngToSvg(latitude, longitude);
  return {
    x: svgCoords.x,
    y: svgCoords.y
  };
};

/**
 * Calculate distance between two GPS points (Haversine formula)
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
 * Find closest waypoint to current GPS position
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
 */
export const calculateRouteProgress = (currentGPS, routeCoords) => {
  if (!currentGPS || !routeCoords || routeCoords.length < 2) {
    return { progress: 0, closestWaypoint: null };
  }
  
  const closest = findClosestWaypoint(currentGPS, routeCoords);
  if (!closest) return { progress: 0, closestWaypoint: null };
  
  // Calculate progress as percentage
  const progress = (closest.index / (routeCoords.length - 1)) * 100;
  
  return {
    progress: Math.min(100, Math.max(0, progress)),
    closestWaypoint: closest
  };
};

/**
 * Get navigation instruction based on current position
 */
export const getCurrentInstruction = (currentGPS, route, progressPercent) => {
  if (!route || route.length === 0) {
    return { instruction: "Route not available" };
  }
  
  if (progressPercent >= 100) {
    return { instruction: "You have arrived at your destination!" };
  }
  
  const stepIndex = Math.min(
    Math.floor((progressPercent / 100) * route.length),
    route.length - 1
  );
  
  return {
    instruction: route[stepIndex]?.instruction || "Continue following the route"
  };
};

export default {
  convertGPSToSVG,
  calculateGPSDistance,
  findClosestWaypoint,
  calculateRouteProgress,
  getCurrentInstruction
};