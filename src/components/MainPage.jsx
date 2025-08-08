// src/components/MainPage.jsx
import React from 'react';
import { MapPin } from 'lucide-react';
import { cabinets } from '../data/cabinet';

const MainPage = ({ onCabinetSelect }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Data Center Navigation</h1>
        <p className="text-gray-600 text-center mb-8">Select a cabinet to view route</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(cabinets).map(([id, cabinet]) => (
            <button
              key={id}
              onClick={() => onCabinetSelect(id)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
            >
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="text-blue-500" size={24} />
                <h3 className="text-xl font-semibold">{cabinet.name}</h3>
              </div>
              <p className="text-gray-600">{cabinet.description}</p>
              <p className="text-sm text-gray-500 mt-2">Zone: {cabinet.zone}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;