// src/data/cabinets.js - Updated for React-Leaflet
import { svgToLatLng } from './routes';

// Updated cabinet locations with React-Leaflet coordinates
export const cabinets = {
  'A1': {
    name: 'Cabinet A1',
    description: 'Server Rack - Network Equipment',
    zone: 'Zone A',
    coords: svgToLatLng(350.813, 146.665), // Destination coordinates from route
    svgCoords: { x: 350.813, y: 146.665 }  // Keep original for reference
  },
  'B2': {
    name: 'Cabinet B2', 
    description: 'Storage Array - Database Servers',
    zone: 'Zone B',
    coords: svgToLatLng(400, 250),
    svgCoords: { x: 400, y: 250 }
  },
  'C3': {
    name: 'Cabinet C3',
    description: 'Power Distribution Unit',
    zone: 'Zone C',
    coords: svgToLatLng(600, 180),
    svgCoords: { x: 600, y: 180 }
  }
};

export const getCabinet = (id) => cabinets[id];
export const getCabinetIds = () => Object.keys(cabinets);