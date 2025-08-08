// src/data/cabinets.js

// Cabinet locations and information
// Adjust these coordinates to match your actual SVG floor plan
export const cabinets = {
  'A1': {
    name: 'Cabinet A1',
    description: 'Server Rack - Network Equipment',
    zone: 'Zone A',
    x: 200,  // X coordinate on your SVG
    y: 150,  // Y coordinate on your SVG
  },
  'B2': {
    name: 'Cabinet B2', 
    description: 'Storage Array - Database Servers',
    zone: 'Zone B',
    x: 400,
    y: 250,
  },
  'C3': {
    name: 'Cabinet C3',
    description: 'Power Distribution Unit',
    zone: 'Zone C', 
    x: 600,
    y: 180,
  }
};

// Helper function to get cabinet by ID
export const getCabinet = (id) => cabinets[id];

// Get all cabinet IDs
export const getCabinetIds = () => Object.keys(cabinets);