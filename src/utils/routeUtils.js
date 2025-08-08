// src/utils/routeUtils.js
import { calculateDistance } from './gpsUtils';

/**
 * Calculate total route distance
 * @param {array} routePoints - Array of {x, y} points
 * @returns {number} - Total distance in pixels
 */
export const calculateRouteDistance = (routePoints) => {
  if (!routePoints || routePoints.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < routePoints.length; i++) {
    totalDistance += calculateDistance(routePoints[i - 1], routePoints[i]);
  }
  return Math.round(totalDistance);
};

/**
 * Find the closest waypoint to current position
 * @param {object} currentPos - Current position {x, y}
 * @param {array} routePoints - Array of route waypoints
 * @returns {object} - {index, waypoint, distance}
 */
export const findClosestWaypoint = (currentPos, routePoints) => {
  if (!currentPos || !routePoints) return null;
  
  let closestIndex = 0;
  let closestDistance = Infinity;
  
  routePoints.forEach((point, index) => {
    const distance = calculateDistance(currentPos, point);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  
  return {
    index: closestIndex,
    waypoint: routePoints[closestIndex],
    distance: closestDistance
  };
};

/**
 * Calculate route progress percentage
 * @param {object} currentPos - Current position
 * @param {array} routePoints - Route waypoints
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateProgress = (currentPos, routePoints) => {
  if (!currentPos || !routePoints || routePoints.length < 2) return 0;
  
  const closest = findClosestWaypoint(currentPos, routePoints);
  if (!closest) return 0;
  
  // Simple progress calculation based on waypoint index
  const progress = (closest.index / (routePoints.length - 1)) * 100;
  return Math.min(100, Math.max(0, progress));
};