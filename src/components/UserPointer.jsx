// src/components/UserPointer.jsx
import React from 'react';

const UserPointer = ({ position, isNavigating }) => {
  if (!position) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* User position circle with pulse animation */}
        <g>
          {/* Outer pulse ring */}
          <circle
            cx={position.x}
            cy={position.y}
            r="20"
            fill="rgba(59, 130, 246, 0.3)"
            className={isNavigating ? "animate-ping" : ""}
          />
          
          {/* Middle ring */}
          <circle
            cx={position.x}
            cy={position.y}
            r="12"
            fill="rgba(59, 130, 246, 0.6)"
          />
          
          {/* Inner dot (user position) */}
          <circle
            cx={position.x}
            cy={position.y}
            r="6"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="2"
          />
          
          {/* Direction indicator (optional) */}
          {position.heading && (
            <line
              x1={position.x}
              y1={position.y}
              x2={position.x + Math.sin(position.heading) * 15}
              y2={position.y - Math.cos(position.heading) * 15}
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
        </g>
        
        {/* Label */}
        <text
          x={position.x}
          y={position.y - 30}
          fontSize="12"
          fill="#1e40af"
          textAnchor="middle"
          fontWeight="bold"
        >
          YOU
        </text>
      </svg>
    </div>
  );
};

export default UserPointer;