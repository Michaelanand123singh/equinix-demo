// src/data/routes.js - Corrected coordinate mapping
// SVG Configuration - These should match your actual SVG dimensions
export const SVG_CONFIG = {
  width: 815.4284,
  height: 333.55614,
  viewBox: { x: 0, y: 0, width: 815.4284, height: 333.55614 }
};

// Geographic bounds for your building - These coordinates define the area where your SVG maps to
export const BUILDING_BOUNDS = {
  northEast: { lat: 28.4595, lng: 77.0266 }, // Top-right corner
  southWest: { lat: 28.4585, lng: 77.0256 }  // Bottom-left corner
};

// Get the center of your building
export const BUILDING_CENTER = [
  (BUILDING_BOUNDS.northEast.lat + BUILDING_BOUNDS.southWest.lat) / 2,
  (BUILDING_BOUNDS.northEast.lng + BUILDING_BOUNDS.southWest.lng) / 2
];

// Coordinate conversion function - This converts SVG coordinates to geographic coordinates
export const svgToLatLng = (x, y) => {
  // Normalize SVG coordinates to 0-1 range
  const normalizedX = x / SVG_CONFIG.width;
  const normalizedY = y / SVG_CONFIG.height;
  
  // Convert to geographic coordinates
  // SVG: (0,0) is top-left, Y increases downward
  // Geographic: latitude increases upward
  const lat = BUILDING_BOUNDS.northEast.lat - 
    normalizedY * (BUILDING_BOUNDS.northEast.lat - BUILDING_BOUNDS.southWest.lat);
  
  const lng = BUILDING_BOUNDS.southWest.lng + 
    normalizedX * (BUILDING_BOUNDS.northEast.lng - BUILDING_BOUNDS.southWest.lng);
  
  return [lat, lng]; // Return as [lat, lng] array for Leaflet
};

// Reverse conversion function - Convert geographic coordinates back to SVG
export const latLngToSvg = (lat, lng) => {
  // Calculate normalized position within building bounds
  const normalizedX = (lng - BUILDING_BOUNDS.southWest.lng) / 
    (BUILDING_BOUNDS.northEast.lng - BUILDING_BOUNDS.southWest.lng);
  
  const normalizedY = (BUILDING_BOUNDS.northEast.lat - lat) / 
    (BUILDING_BOUNDS.northEast.lat - BUILDING_BOUNDS.southWest.lat);
  
  // Convert to SVG coordinates
  const x = normalizedX * SVG_CONFIG.width;
  const y = normalizedY * SVG_CONFIG.height;
  
  return { x, y };
};

// CORRECTED ROUTES - Update these with your actual SVG coordinates
// These coordinates should be measured directly from your SVG floor plan
export const routes = {
  'A1': [
    { coords: svgToLatLng(235.238, 110.773), instruction: "Starting point at entrance", svgCoords: {x: 235.238, y: 110.773} },
    { coords: svgToLatLng(236.491, 79.910), instruction: "Walk towards corridor & take right turn", svgCoords: {x: 236.491, y: 79.910} },
    { coords: svgToLatLng(246.949, 78.878), instruction: "Continue straight then turn right", svgCoords: {x: 246.949, y: 78.878} },
    { coords: svgToLatLng(246.850, 146.939), instruction: "Walk straight & take left turn", svgCoords: {x: 246.850, y: 146.939} },
    { coords: svgToLatLng(350.813, 146.665), instruction: "You've reached Cabinet A1", svgCoords: {x: 350.813, y: 146.665} }
  ],
  
  'B2': [
    // Start from entrance - you should measure this from your actual SVG
    { coords: svgToLatLng(100, 300), instruction: "Start from main entrance", svgCoords: {x: 100, y: 300} },
    { coords: svgToLatLng(150, 300), instruction: "Walk towards reception area", svgCoords: {x: 150, y: 300} },
    { coords: svgToLatLng(300, 300), instruction: "Continue past reception", svgCoords: {x: 300, y: 300} },
    { coords: svgToLatLng(300, 200), instruction: "Turn left towards Zone B", svgCoords: {x: 300, y: 200} },
    { coords: svgToLatLng(400, 200), instruction: "Walk down Zone B corridor", svgCoords: {x: 400, y: 200} },
    { coords: svgToLatLng(400, 150), instruction: "Turn right to cabinet area", svgCoords: {x: 400, y: 150} },
    { coords: svgToLatLng(450, 150), instruction: "Cabinet B2 reached!", svgCoords: {x: 450, y: 150} }
  ],
  
  'C3': [
    // Start from entrance
    { coords: svgToLatLng(100, 300), instruction: "Start from main entrance", svgCoords: {x: 100, y: 300} },
    { coords: svgToLatLng(200, 300), instruction: "Walk through main hall", svgCoords: {x: 200, y: 300} },
    { coords: svgToLatLng(500, 300), instruction: "Continue towards far end", svgCoords: {x: 500, y: 300} },
    { coords: svgToLatLng(600, 300), instruction: "Turn left towards Zone C", svgCoords: {x: 600, y: 300} },
    { coords: svgToLatLng(600, 200), instruction: "Walk up Zone C corridor", svgCoords: {x: 600, y: 200} },
    { coords: svgToLatLng(650, 150), instruction: "Turn right to cabinet", svgCoords: {x: 650, y: 150} },
    { coords: svgToLatLng(700, 100), instruction: "Cabinet C3 reached!", svgCoords: {x: 700, y: 100} }
  ]
};

// Export route coordinates for polylines
export const getRouteCoords = (cabinetId) => {
  const route = routes[cabinetId];
  return route ? route.map(point => point.coords) : [];
};

// Export route with instructions
export const getRoute = (cabinetId) => routes[cabinetId];

// Get SVG coordinates for debugging
export const getRouteSvgCoords = (cabinetId) => {
  const route = routes[cabinetId];
  return route ? route.map(point => point.svgCoords) : [];
};

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

// Utility function to validate coordinates are within SVG bounds
export const validateSvgCoordinates = (x, y) => {
  return x >= 0 && x <= SVG_CONFIG.width && y >= 0 && y <= SVG_CONFIG.height;
};

// Debug function to test coordinate conversion
export const debugCoordinateConversion = () => {
  console.log('=== Coordinate Conversion Debug ===');
  console.log('SVG Config:', SVG_CONFIG);
  console.log('Building Bounds:', BUILDING_BOUNDS);
  console.log('Building Center:', BUILDING_CENTER);
  
  // Test corner conversions
  const corners = [
    { name: 'Top-Left', svg: { x: 0, y: 0 } },
    { name: 'Top-Right', svg: { x: SVG_CONFIG.width, y: 0 } },
    { name: 'Bottom-Left', svg: { x: 0, y: SVG_CONFIG.height } },
    { name: 'Bottom-Right', svg: { x: SVG_CONFIG.width, y: SVG_CONFIG.height } },
    { name: 'Center', svg: { x: SVG_CONFIG.width/2, y: SVG_CONFIG.height/2 } }
  ];
  
  corners.forEach(corner => {
    const latLng = svgToLatLng(corner.svg.x, corner.svg.y);
    const backToSvg = latLngToSvg(latLng[0], latLng[1]);
    console.log(`${corner.name}:`, {
      original: corner.svg,
      latLng: latLng,
      backToSvg: backToSvg,
      isValid: validateSvgCoordinates(corner.svg.x, corner.svg.y)
    });
  });
  
  // Test route coordinates
  Object.entries(routes).forEach(([cabinetId, route]) => {
    console.log(`\nRoute ${cabinetId}:`);
    route.forEach((point, index) => {
      const isValid = validateSvgCoordinates(point.svgCoords.x, point.svgCoords.y);
      console.log(`  Step ${index + 1}: SVG(${point.svgCoords.x}, ${point.svgCoords.y}) -> LatLng(${point.coords[0].toFixed(6)}, ${point.coords[1].toFixed(6)}) Valid: ${isValid}`);
    });
  });
};