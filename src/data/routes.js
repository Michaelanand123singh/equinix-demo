// src/data/routes.js - Updated for React-Leaflet
// Removed the import since we're defining svgToLatLng here

// SVG Configuration based on your floor plan
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

// Coordinate conversion function
export const svgToLatLng = (x, y) => {
  // Normalize SVG coordinates (0-1 range)
  const normalizedX = x / SVG_CONFIG.width;
  const normalizedY = y / SVG_CONFIG.height;
  
  // Convert to geographic coordinates
  // Note: SVG Y increases downward, but latitude increases upward
  const lat = BUILDING_BOUNDS.southWest.lat + 
    (1 - normalizedY) * (BUILDING_BOUNDS.northEast.lat - BUILDING_BOUNDS.southWest.lat);
  
  const lng = BUILDING_BOUNDS.southWest.lng + 
    normalizedX * (BUILDING_BOUNDS.northEast.lng - BUILDING_BOUNDS.southWest.lng);
  
  return [lat, lng]; // Return as [lat, lng] array for Leaflet
};

// Updated routes with React-Leaflet coordinates
export const routes = {
  'A1': [
    { coords: svgToLatLng(235.238, 110.773), instruction: "Starting point" },
    { coords: svgToLatLng(236.491, 79.910), instruction: "Walk towards & take right turn" },
    { coords: svgToLatLng(246.949, 78.878), instruction: "Turn right again" },
    { coords: svgToLatLng(246.850, 146.939), instruction: "Go straight & take a left turn" },
    { coords: svgToLatLng(350.813, 146.665), instruction: "You've reached the destination" }
  ],
  
  'B2': [
    { coords: svgToLatLng(50, 500), instruction: "Start from main entrance" },
    { coords: svgToLatLng(100, 500), instruction: "Walk towards reception" },
    { coords: svgToLatLng(250, 500), instruction: "Continue straight past reception" },
    { coords: svgToLatLng(250, 350), instruction: "Turn left towards Zone B" },
    { coords: svgToLatLng(350, 350), instruction: "Walk down Zone B corridor" },
    { coords: svgToLatLng(350, 250), instruction: "Turn right" },
    { coords: svgToLatLng(400, 250), instruction: "Cabinet B2 reached!" }
  ],
  
  'C3': [
    { coords: svgToLatLng(50, 500), instruction: "Start from main entrance" },
    { coords: svgToLatLng(200, 500), instruction: "Walk straight through main hall" },
    { coords: svgToLatLng(400, 500), instruction: "Continue towards far end" },
    { coords: svgToLatLng(500, 500), instruction: "Turn left towards Zone C" },
    { coords: svgToLatLng(500, 300), instruction: "Walk up Zone C corridor" },
    { coords: svgToLatLng(550, 250), instruction: "Turn right" },
    { coords: svgToLatLng(600, 180), instruction: "Cabinet C3 reached!" }
  ]
};

// Export route coordinates for polylines
export const getRouteCoords = (cabinetId) => {
  const route = routes[cabinetId];
  return route ? route.map(point => point.coords) : [];
};

// Export route with instructions
export const getRoute = (cabinetId) => routes[cabinetId];

// Calculate route distance using Haversine formula
export const getRouteDistance = (cabinetId) => {
  const routeCoords = getRouteCoords(cabinetId);
  if (routeCoords.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < routeCoords.length; i++) {
    totalDistance += haversineDistance(
      routeCoords[i-1][0], routeCoords[i-1][1],
      routeCoords[i][0], routeCoords[i][1]
    );
  }
  return Math.round(totalDistance);
};

// Haversine formula for distance calculation
const haversineDistance = (lat1, lng1, lat2, lng2) => {
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