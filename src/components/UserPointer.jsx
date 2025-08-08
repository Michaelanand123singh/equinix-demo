// src/components/UserPointer.jsx - Live GPS position pointer for SVG
import React from 'react';

const UserPointer = ({ position, isNavigating = false, accuracy = null }) => {
  if (!position) return null;

  // Create unique IDs for animations to avoid conflicts
  const uniqueId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <g className="user-pointer-group">
      {/* CSS Animations */}
      <defs>
        <style>
          {`
            @keyframes userPulse-${uniqueId} {
              0% { 
                transform: scale(1); 
                opacity: 0.8; 
              }
              50% { 
                transform: scale(1.8); 
                opacity: 0.3; 
              }
              100% { 
                transform: scale(2.5); 
                opacity: 0; 
              }
            }
            
            @keyframes userGlow-${uniqueId} {
              0%, 100% { 
                filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
              }
              50% { 
                filter: drop-shadow(0 0 15px rgba(59, 130, 246, 1));
              }
            }
            
            @keyframes userBounce-${uniqueId} {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-2px); }
            }
            
            .user-pulse-${uniqueId} {
              animation: userPulse-${uniqueId} 2.5s infinite ease-out;
            }
            
            .user-glow-${uniqueId} {
              animation: userGlow-${uniqueId} 2s ease-in-out infinite;
            }
            
            .user-bounce-${uniqueId} {
              animation: userBounce-${uniqueId} 1.5s ease-in-out infinite;
            }
          `}
        </style>
      </defs>

      {/* Accuracy Circle (if available and reasonable) */}
      {accuracy && accuracy < 50 && (
        <circle
          cx={position.x}
          cy={position.y}
          r={Math.min(Math.max(accuracy / 2, 10), 30)} // Scale accuracy to reasonable size
          fill="rgba(34, 197, 94, 0.15)"
          stroke="rgba(34, 197, 94, 0.5)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      )}

      {/* Outer Pulse Ring */}
      <circle
        cx={position.x}
        cy={position.y}
        r="25"
        fill="rgba(59, 130, 246, 0.4)"
        stroke="rgba(59, 130, 246, 0.8)"
        strokeWidth="2"
        className={isNavigating ? `user-pulse-${uniqueId}` : ''}
      />

      {/* Middle Ring */}
      <circle
        cx={position.x}
        cy={position.y}
        r="15"
        fill="rgba(59, 130, 246, 0.8)"
        stroke="white"
        strokeWidth="2"
        className={isNavigating ? `user-glow-${uniqueId}` : ''}
      />

      {/* Inner Core (User Position) */}
      <circle
        cx={position.x}
        cy={position.y}
        r="8"
        fill="#1d4ed8"
        stroke="white"
        strokeWidth="2"
        className={isNavigating ? `user-bounce-${uniqueId}` : ''}
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}
      />

      {/* Live Status Indicator */}
      {isNavigating && (
        <circle
          cx={position.x + 18}
          cy={position.y - 18}
          r="4"
          fill="#10b981"
          stroke="white"
          strokeWidth="1"
          className={`user-pulse-${uniqueId}`}
        />
      )}

      {/* Direction Arrow for Navigation */}
      {isNavigating && (
        <polygon
          points={`${position.x},${position.y - 35} ${position.x - 5},${position.y - 25} ${position.x + 5},${position.y - 25}`}
          fill="#1d4ed8"
          stroke="white"
          strokeWidth="1"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
        />
      )}

      {/* YOU Label */}
      <text
        x={position.x}
        y={position.y - 40}
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#1d4ed8"
        stroke="white"
        strokeWidth="2"
        paintOrder="stroke"
      >
        📍 YOU
      </text>

      {/* Live indicator text */}
      {isNavigating && (
        <text
          x={position.x}
          y={position.y + 45}
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill="#10b981"
          stroke="white"
          strokeWidth="1"
          paintOrder="stroke"
        >
          🛰️ LIVE
        </text>
      )}

      {/* Coordinates tooltip (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <text
          x={position.x}
          y={position.y + 60}
          textAnchor="middle"
          fontSize="6"
          fill="#666"
          stroke="white"
          strokeWidth="1"
          paintOrder="stroke"
        >
          SVG: {position.x.toFixed(1)}, {position.y.toFixed(1)}
        </text>
      )}
    </g>
  );
};

export default UserPointer;