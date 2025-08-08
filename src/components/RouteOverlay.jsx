// src/components/RouteOverlay.jsx
import React from 'react';
import { routes } from '../data/routes';

const RouteOverlay = ({ selectedCabinet }) => {
  const routePoints = routes[selectedCabinet];
  
  if (!routePoints) return null;

  // Create path string for SVG
  const pathData = routePoints.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Route Path */}
        <path
          d={pathData}
          stroke="#3b82f6"
          strokeWidth="4"
          fill="none"
          strokeDasharray="8,4"
          className="animate-pulse"
        />
        
        {/* Waypoints */}
        {routePoints.map((point, index) => (
          <g key={index}>
            {/* Waypoint circle */}
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill={index === 0 ? "#10b981" : index === routePoints.length - 1 ? "#ef4444" : "#3b82f6"}
              stroke="white"
              strokeWidth="2"
            />
            
            {/* Step number */}
            {index > 0 && index < routePoints.length - 1 && (
              <text
                x={point.x}
                y={point.y + 2}
                fontSize="10"
                fill="white"
                textAnchor="middle"
                fontWeight="bold"
              >
                {index}
              </text>
            )}
          </g>
        ))}
        
        {/* Start label */}
        <text
          x={routePoints[0].x}
          y={routePoints[0].y - 15}
          fontSize="12"
          fill="#10b981"
          textAnchor="middle"
          fontWeight="bold"
        >
          START
        </text>
        
        {/* End label */}
        <text
          x={routePoints[routePoints.length - 1].x}
          y={routePoints[routePoints.length - 1].y - 15}
          fontSize="12"
          fill="#ef4444"
          textAnchor="middle"
          fontWeight="bold"
        >
          CABINET
        </text>
      </svg>
    </div>
  );
};

export default RouteOverlay;