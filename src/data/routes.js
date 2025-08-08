// src/data/routes.js

// Pre-defined routes to each cabinet
// Adjust these coordinates to match your actual SVG floor plan and building layout

export const routes = {
  'A1': [
    { x: 235.238, y: 110.773, instruction: "Starting point" },
    { x: 236.491, y: 79.910, instruction: "Walk towards & take right turn" },
    { x: 246.949, y: 78.878, instruction: "Turn right again" },
    { x: 246.850, y: 146.939, instruction: "Go straight & take a left turn" },
    { x: 350.813, y: 146.665, instruction: "You've reached the destination" },
    
  ],
  
  'B2': [
    { x: 50, y: 500, instruction: "Start from main entrance" },
    { x: 100, y: 500, instruction: "Walk towards reception" },
    { x: 250, y: 500, instruction: "Continue straight past reception" },
    { x: 250, y: 350, instruction: "Turn left towards Zone B" },
    { x: 350, y: 350, instruction: "Walk down Zone B corridor" },
    { x: 350, y: 250, instruction: "Turn right" },
    { x: 400, y: 250, instruction: "Cabinet B2 reached!" }
  ],
  
  'C3': [
    { x: 50, y: 500, instruction: "Start from main entrance" },
    { x: 200, y: 500, instruction: "Walk straight through main hall" },
    { x: 400, y: 500, instruction: "Continue towards far end" },
    { x: 500, y: 500, instruction: "Turn left towards Zone C" },
    { x: 500, y: 300, instruction: "Walk up Zone C corridor" },
    { x: 550, y: 250, instruction: "Turn right" },
    { x: 600, y: 180, instruction: "Cabinet C3 reached!" }
  ]
};

// Helper functions
export const getRoute = (cabinetId) => routes[cabinetId];

export const getRouteDistance = (cabinetId) => {
  const route = routes[cabinetId];
  if (!route) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < route.length; i++) {
    const prev = route[i - 1];
    const curr = route[i];
    const distance = Math.sqrt(
      Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
    );
    totalDistance += distance;
  }
  return Math.round(totalDistance);
};