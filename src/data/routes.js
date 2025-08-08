// src/data/routes.js

// Pre-defined routes to each cabinet
// Adjust these coordinates to match your actual SVG floor plan and building layout

export const routes = {
  'A1': [
    { x: 50, y: 500, instruction: "Start from main entrance" },
    { x: 100, y: 500, instruction: "Walk towards reception" },
    { x: 100, y: 400, instruction: "Turn left at reception" },
    { x: 150, y: 400, instruction: "Continue down corridor" },
    { x: 150, y: 200, instruction: "Turn right towards Zone A" },
    { x: 200, y: 150, instruction: "Cabinet A1 reached!" }
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