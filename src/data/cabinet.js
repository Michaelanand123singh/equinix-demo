// src/data/cabinet.js - Corrected cabinet locations
import { svgToLatLng } from './routes';

// Cabinet definitions with proper SVG coordinates
// UPDATE THESE COORDINATES to match your actual SVG floor plan
export const cabinets = {
  'A1': {
    id: 'A1',
    name: 'Cabinet A1',
    description: 'Server Rack A1 - Primary Storage',
    zone: 'Zone A',
    svgCoords: { x: 350.813, y: 143.876 }, // Measure these from your SVG
    coords: svgToLatLng(350.813, 146.665),
    status: 'active',
    priority: 'high'
  },
  
  'B2': {
    id: 'B2',
    name: 'Cabinet B2',
    description: 'Network Equipment Rack B2',
    zone: 'Zone B',
    svgCoords: { x: 450, y: 150 }, // UPDATE: Measure from your SVG
    coords: svgToLatLng(450, 150),
    status: 'active',
    priority: 'medium'
  },
  
  'C3': {
    id: 'C3',
    name: 'Cabinet C3',
    description: 'Backup Server Rack C3',
    zone: 'Zone C',
    svgCoords: { x: 700, y: 100 }, // UPDATE: Measure from your SVG
    coords: svgToLatLng(700, 100),
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