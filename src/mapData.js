// Demo data for data center navigation
export const MAP_CONFIG = {
  center: [0, 0], // Center of the map
  zoom: 2,
  minZoom: 1,
  maxZoom: 5,
  bounds: [[-100, -200], [100, 200]] // Map boundaries
};

// Starting position (entrance)
export const ENTRANCE_POSITION = {
  lat: -80,
  lng: -150,
  name: "Main Entrance"
};

// Demo cabinet information
export const CABINETS = {
  "A-15": {
    id: "A-15",
    lat: 60,
    lng: 120,
    name: "Cabinet A-15",
    zone: "Zone A",
    power: "5kW",
    status: "Active"
  },
  "B-08": {
    id: "B-08", 
    lat: 20,
    lng: 80,
    name: "Cabinet B-08",
    zone: "Zone B", 
    power: "4.2kW",
    status: "Active"
  },
  "C-22": {
    id: "C-22",
    lat: -20,
    lng: 150,
    name: "Cabinet C-22",
    zone: "Zone C",
    power: "6.1kW", 
    status: "Maintenance"
  }
};

// Pre-calculated routes from entrance to cabinets
export const ROUTES = {
  "A-15": [
    { lat: -80, lng: -150 }, // Start at entrance
    { lat: -50, lng: -100 }, // Turn point 1
    { lat: -20, lng: -50 },  // Turn point 2
    { lat: 20, lng: 0 },     // Turn point 3
    { lat: 50, lng: 80 },    // Turn point 4
    { lat: 60, lng: 120 }    // Destination cabinet
  ],
  "B-08": [
    { lat: -80, lng: -150 },
    { lat: -50, lng: -100 },
    { lat: -20, lng: -50 },
    { lat: 0, lng: 20 },
    { lat: 20, lng: 80 }
  ],
  "C-22": [
    { lat: -80, lng: -150 },
    { lat: -50, lng: -100 },
    { lat: -30, lng: 0 },
    { lat: -20, lng: 80 },
    { lat: -20, lng: 150 }
  ]
};

// Navigation settings
export const NAVIGATION_CONFIG = {
  walkingSpeed: 1000, // milliseconds between position updates
  arrivalRadius: 5,   // how close to consider "arrived"
  routeColor: '#10B981', // Green route line
  userColor: '#EF4444',  // Red user position
  cabinetColor: '#3B82F6' // Blue cabinet marker
};

// Mock floor plan bounds (you'll replace this with your CAD data)
export const FLOOR_PLAN = {
  imageUrl: '/floor-plan.svg', // Your converted CAD file
  bounds: [[-100, -200], [100, 200]], // Image bounds
  opacity: 0.7
};