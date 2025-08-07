import React, { useState } from 'react';
import { CABINETS } from '../mapData';

const CabinetInput = ({ onStartNavigation }) => {
  const [cabinetNumber, setCabinetNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const upperCaseInput = cabinetNumber.toUpperCase().trim();
    
    if (!upperCaseInput) {
      setError('Please enter a cabinet number');
      return;
    }
    
    if (!CABINETS[upperCaseInput]) {
      setError('Cabinet not found. Try: A-15, B-08, or C-22');
      return;
    }
    
    setError('');
    onStartNavigation(upperCaseInput);
  };

  const handleQuickSelect = (cabinetId) => {
    setCabinetNumber(cabinetId);
    setError('');
    onStartNavigation(cabinetId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Center Navigation</h1>
          <p className="text-gray-600">Enter your cabinet number to start navigation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="cabinet" className="block text-sm font-medium text-gray-700 mb-2">
              Cabinet Number
            </label>
            <input
              type="text"
              id="cabinet"
              value={cabinetNumber}
              onChange={(e) => setCabinetNumber(e.target.value)}
              placeholder="e.g., A-15"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center font-mono uppercase"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Start Navigation
          </button>
        </form>

        <div className="mt-8">
          <p className="text-sm text-gray-500 text-center mb-4">Quick Demo Options:</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(CABINETS).map((cabinetId) => (
              <button
                key={cabinetId}
                onClick={() => handleQuickSelect(cabinetId)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors duration-200"
              >
                {cabinetId}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Demo: Real-time navigation with live tracking
          </p>
        </div>
      </div>
    </div>
  );
};

export default CabinetInput;