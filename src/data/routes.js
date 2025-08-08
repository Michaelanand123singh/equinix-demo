// src/data/routes.js - UPDATED with GPS to SVG coordinate mapping
// This version supports BOTH Leaflet (GPS) and SVG coordinate systems

// SVG Configuration - Match your actual SVG dimensions
export const SVG_CONFIG = {
  width: 815.4284,
  height: 333.55614,
  viewBox: { x: 0, y: 0, width: 815.4284, height: 333.55614 }
};

// Geographic bounds for your building
export const BUILDING_BOUNDS = {
  northEast: { lat: 28.4595, lng: 77.0266 }, // Top-right corner
  southWest: { lat: 28.4585, lng: 77.0256 }  // Bottom-left corner
};

// Get the center of your building
export const BUILDING_CENTER = [
  (BUILDING_BOUNDS.northEast.lat + BUILDING_BOUNDS.southWest.lat) / 2,
  (BUILDING_BOUNDS.northEast.lng + BUILDING_BOUNDS.southWest.lng) / 2
];

// REFERENCE POINT MAPPING
// Map known GPS coordinate to known SVG coordinate
export const REFERENCE_POINTS = {
  // GPS coordinate [28.4590, 77.0260] maps to SVG coordinate [235.238, 110.773]
  gps: [28.4590, 77.0260],
  svg: [235.238, 110.773]
};

// Convert GPS coordinates to SVG coordinates
export const gpsToSvg = (lat, lng) => {
  // Calculate the scale factor based on building bounds and SVG dimensions
  const latRange = BUILDING_BOUNDS.northEast.lat - BUILDING_BOUNDS.southWest.lat;
  const lngRange = BUILDING_BOUNDS.northEast.lng - BUILDING_BOUNDS.southWest.lng;
  
  // Calculate the offset from reference point
  const latOffset = lat - REFERENCE_POINTS.gps[0];
  const lngOffset = lng - REFERENCE_POINTS.gps[1];
  
  // Convert offset to SVG scale
  const svgLatScale = SVG_CONFIG.height / latRange;
  const svgLngScale = SVG_CONFIG.width / lngRange;
  
  // Calculate SVG position
  // Note: SVG Y increases downward, GPS latitude increases upward
  const svgX = REFERENCE_POINTS.svg[0] + (lngOffset * svgLngScale);
  const svgY = REFERENCE_POINTS.svg[1] - (latOffset * svgLatScale); // Subtract because Y is inverted
  
  return { x: svgX, y: svgY };
};

// Convert SVG coordinates to GPS coordinates (for routes)
export const svgToGps = (x, y) => {
  // Calculate the scale factor
  const latRange = BUILDING_BOUNDS.northEast.lat - BUILDING_BOUNDS.southWest.lat;
  const lngRange = BUILDING_BOUNDS.northEast.lng - BUILDING_BOUNDS.southWest.lng;
  
  const svgLatScale = SVG_CONFIG.height / latRange;
  const svgLngScale = SVG_CONFIG.width / lngRange;
  
  // Calculate offset from reference point in SVG
  const svgXOffset = x - REFERENCE_POINTS.svg[0];
  const svgYOffset = y - REFERENCE_POINTS.svg[1];
  
  // Convert to GPS offset
  const lngOffset = svgXOffset / svgLngScale;
  const latOffset = -svgYOffset / svgLatScale; // Negative because Y is inverted
  
  // Calculate final GPS coordinates
  const lat = REFERENCE_POINTS.gps[0] + latOffset;
  const lng = REFERENCE_POINTS.gps[1] + lngOffset;
  
  return [lat, lng];
};

// ROUTES with both GPS and SVG coordinates
export const routes = {
  'A1': [
    { 
      coords: [28.4590, 77.0260], 
      svgCoords: { x: 235.238, y: 110.773 },
      instruction: "Starting point at entrance"
    },
    { 
      coords: svgToGps(236.491, 79.910),
      svgCoords: { x: 236.491, y: 79.910 },
      instruction: "Walk towards corridor & take right turn"
    },
    { 
      coords: svgToGps(246.949, 78.878),
      svgCoords: { x: 246.949, y: 78.878 },
      instruction: "Continue straight then turn right"
    },
    { 
      coords: svgToGps(246.850, 146.939),
      svgCoords: { x: 246.850, y: 146.939 },
      instruction: "Walk straight & take left turn"
    },
    { 
      coords: svgToGps(350.813, 146.665),
      svgCoords: { x: 350.813, y: 146.665 },
      instruction: "You've reached Cabinet A1"
    }
  ],
  
  'B2': [
    { 
      coords: [28.4590, 77.0260], 
      svgCoords: { x: 235.238, y: 110.773 },
      instruction: "Start from main entrance"
    },
    { 
      coords: svgToGps(300, 100),
      svgCoords: { x: 300, y: 100 },
      instruction: "Walk towards reception area"
    },
    { 
      coords: svgToGps(400, 150),
      svgCoords: { x: 400, y: 150 },
      instruction: "Continue past reception"
    },
    { 
      coords: svgToGps(500, 200),
      svgCoords: { x: 500, y: 200 },
      instruction: "Turn left towards Zone B"
    },
    { 
      coords: svgToGps(600, 180),
      svgCoords: { x: 600, y: 180 },
      instruction: "Cabinet B2 reached!"
    }
  ],
  
  'C3': [
    { 
      coords: [28.4590, 77.0260], 
      svgCoords: { x: 235.238, y: 110.773 },
      instruction: "Start from main entrance"
    },
    { 
      coords: svgToGps(400, 200),
      svgCoords: { x: 400, y: 200 },
      instruction: "Walk through main hall"
    },
    { 
      coords: svgToGps(600, 150),
      svgCoords: { x: 600, y: 150 },
      instruction: "Continue towards far end"
    },
    { 
      coords: svgToGps(700, 100),
      svgCoords: { x: 700, y: 100 },
      instruction: "Cabinet C3 reached!"
    }
  ]
};

// Export route coordinates for Leaflet (GPS coordinates)
export const getRouteCoords = (cabinetId) => {
  const route = routes[cabinetId];
  return route ? route.map(point => point.coords) : [];
};

// Export route with instructions
export const getRoute = (cabinetId) => routes[cabinetId];

// Export SVG coordinates for SVG overlay
export const getRouteSvgCoords = (cabinetId) => {
  const route = routes[cabinetId];
  return route ? route.map(point => point.svgCoords) : [];
};

// Validate SVG coordinates are within bounds
export const validateSvgCoordinates = (x, y) => {
  return x >= 0 && x <= SVG_CONFIG.width && y >= 0 && y <= SVG_CONFIG.height;
};

// Find closest point on route to user position
export const findClosestRoutePoint = (userPosition, cabinetId) => {
  const routeCoords = getRouteCoords(cabinetId);
  if (!userPosition || !routeCoords.length) return null;
  
  let closestIndex = 0;
  let closestDistance = Infinity;
  
  routeCoords.forEach((coord, index) => {
    const distance = haversineDistance(
      userPosition[0], userPosition[1],
      coord[0], coord[1]
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  
  return {
    index: closestIndex,
    distance: closestDistance,
    coords: routeCoords[closestIndex],
    progress: (closestIndex / (routeCoords.length - 1)) * 100
  };
};

// Get next instruction based on user position
export const getNextInstruction = (userPosition, cabinetId) => {
  const route = getRoute(cabinetId);
  const closest = findClosestRoutePoint(userPosition, cabinetId);
  
  if (!route || !closest) return null;
  
  const nextIndex = Math.min(closest.index + 1, route.length - 1);
  return {
    current: route[closest.index],
    next: route[nextIndex],
    progress: closest.progress,
    distanceToNext: closest.distance
  };
};

// Calculate route distance
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

// Debug function to test coordinate conversion
export const debugCoordinateConversion = () => {
  console.log('=== GPS to SVG Coordinate Debug ===');
  console.log('Reference GPS:', REFERENCE_POINTS.gps);
  console.log('Reference SVG:', REFERENCE_POINTS.svg);
  
  // Test the reference point conversion
  const testSvg = gpsToSvg(REFERENCE_POINTS.gps[0], REFERENCE_POINTS.gps[1]);
  const testGps = svgToGps(REFERENCE_POINTS.svg[0], REFERENCE_POINTS.svg[1]);
  
  console.log('Reference point test:');
  console.log('  GPS->SVG:', testSvg, '(should match reference SVG)');
  console.log('  SVG->GPS:', testGps, '(should match reference GPS)');
  
  // Test your specific coordinate
  const yourGps = [28.4590, 77.0260];
  const yourSvg = gpsToSvg(yourGps[0], yourGps[1]);
  console.log(`GPS ${yourGps} maps to SVG:`, yourSvg);
};