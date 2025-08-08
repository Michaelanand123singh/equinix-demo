// src/data/cabinet.js - CLEANED - Only GPS coordinates for Leaflet
// Remove SVG coordinate dependencies

// Cabinet definitions with GPS coordinates only
// UPDATE THESE COORDINATES to match your actual real-world cabinet locations
export const cabinets = {
  'A1': {
    id: 'A1',
    name: 'Cabinet A1',
    description: 'Server Rack A1 - Primary Storage',
    zone: 'Zone A',
    coords: [28.4594, 77.0264], // Real GPS coordinates of Cabinet A1
    status: 'active',
    priority: 'high'
  },
  
  'B2': {
    id: 'B2',
    name: 'Cabinet B2',
    description: 'Network Equipment Rack B2',
    zone: 'Zone B',
    coords: [28.4593, 77.0263], // Real GPS coordinates of Cabinet B2
    status: 'active',
    priority: 'medium'
  },
  
  'C3': {
    id: 'C3',
    name: 'Cabinet C3',
    description: 'Backup Server Rack C3',
    zone: 'Zone C',
    coords: [28.4595, 77.0265], // Real GPS coordinates of Cabinet C3
    status: 'maintenance',
    priority: 'low'
  }
};

// Helper function to get cabinet by ID
export const getCabinet = (cabinetId) => cabinets[cabinetId];

// Get all cabinets as array
export const getAllCabinets = () => Object.values(cabinets);

// Get cabinets by zone
export const getCabinetsByZone = (zone) => 
  Object.values(cabinets).filter(cabinet => cabinet.zone === zone);

// Get cabinets by status
export const getCabinetsByStatus = (status) => 
  Object.values(cabinets).filter(cabinet => cabinet.status === status);

// Get cabinet coordinates for Leaflet
export const getCabinetCoords = (cabinetId) => {
  const cabinet = cabinets[cabinetId];
  return cabinet ? cabinet.coords : null;
};

// Calculate distance to cabinet from user position
export const getDistanceToCabinet = (userPosition, cabinetId) => {
  const cabinetCoords = getCabinetCoords(cabinetId);
  if (!userPosition || !cabinetCoords) return null;
  
  return haversineDistance(
    userPosition[0], userPosition[1],
    cabinetCoords[0], cabinetCoords[1]
  );
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