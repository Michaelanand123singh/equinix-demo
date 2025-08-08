// src/components/GPSPermissionHandler.jsx - Handle GPS permissions gracefully
import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, CheckCircle, Settings, RefreshCw } from 'lucide-react';

const GPSPermissionHandler = ({ 
  permissionStatus, 
  onRequestPermission, 
  onClose, 
  error 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRequestPermission();
    } catch (err) {
      console.error('Permission retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const getPermissionMessage = () => {
    switch (permissionStatus) {
      case 'denied':
        return {
          title: 'Location Access Denied',
          message: 'Location permission has been denied. To enable navigation, please:',
          steps: [
            'Click the location icon in your browser\'s address bar',
            'Select "Allow" for location access',
            'Refresh the page and try again'
          ],
          icon: <AlertTriangle className="text-red-500" size={24} />,
          showRetry: true
        };
      case 'granted':
        return {
          title: 'Location Access Granted',
          message: 'Great! Location services are enabled.',
          icon: <CheckCircle className="text-green-500" size={24} />,
          showRetry: false
        };
      default:
        return {
          title: 'Location Permission Required',
          message: 'To provide accurate navigation, this app needs access to your device\'s location.',
          steps: [
            'Click "Enable Location" below',
            'When prompted, select "Allow" in your browser',
            'Your location will be used only for navigation'
          ],
          icon: <MapPin className="text-blue-500" size={24} />,
          showRetry: true
        };
    }
  };

  const permissionInfo = getPermissionMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          {permissionInfo.icon}
          <h3 className="text-lg font-semibold text-gray-900">
            {permissionInfo.title}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          {permissionInfo.message}
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={16} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Steps */}
        {permissionInfo.steps && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Steps:</p>
            <ol className="space-y-1">
              {permissionInfo.steps.map((step, index) => (
                <li key={index} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-blue-500 font-medium">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Browser-specific instructions */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="text-gray-500" size={16} />
            <p className="text-sm font-medium text-gray-700">Browser Settings</p>
          </div>
          <p className="text-xs text-gray-600">
            If you accidentally denied location access, look for a location icon (📍) in your browser's address bar and click it to change permissions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          
          {permissionInfo.showRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Requesting...
                </>
              ) : (
                <>
                  <MapPin size={16} />
                  Enable Location
                </>
              )}
            </button>
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Your location data is only used for navigation and is not stored or shared.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GPSPermissionHandler;