// src/components/MapView.jsx
import React, { useState } from 'react';
import { ArrowLeft, Navigation, Eye } from 'lucide-react';
import RouteOverlay from './RouteOverlay';
import { cabinets } from '../data/cabinet';

const MapView = ({ selectedCabinet, onStartNavigation, onBack }) => {
  const [showRoute, setShowRoute] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft size={20} />
            Back
          </button>
          
          <h1 className="text-xl font-semibold">
            Route to {cabinets[selectedCabinet]?.name}
          </h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowRoute(!showRoute)}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                showRoute ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Eye size={16} />
              {showRoute ? 'Hide Route' : 'Show Route'}
            </button>
            
            <button
              onClick={onStartNavigation}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Navigation size={16} />
              Start Navigation
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative" style={{ height: '70vh' }}>
            {/* SVG Floor Plan Background */}
            <div className="absolute inset-0">
              <object
                data="/floor.svg"
                type="image/svg+xml"
                className="w-full h-full"
                style={{ pointerEvents: 'none' }}
              >
                <img src="/floor.svg" alt="Floor Plan" className="w-full h-full object-contain" />
              </object>
            </div>
            
            {/* Route Overlay */}
            {showRoute && (
              <RouteOverlay selectedCabinet={selectedCabinet} />
            )}
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            {showRoute 
              ? `Route displayed to ${cabinets[selectedCabinet]?.name}. Click "Start Navigation" to begin live tracking.`
              : `Click "Show Route" to view the path to ${cabinets[selectedCabinet]?.name}.`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapView;