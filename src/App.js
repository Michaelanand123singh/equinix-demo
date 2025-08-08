// src/App.jsx
import React, { useState } from 'react';
import MainPage from './components/MainPage';
import MapView from './components/MapView';
import NavigationView from './components/NavigationView';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'map', 'navigation'
  const [selectedCabinet, setSelectedCabinet] = useState(null);

  const handleCabinetSelect = (cabinetId) => {
    setSelectedCabinet(cabinetId);
    setCurrentView('map');
  };

  const handleStartNavigation = () => {
    setCurrentView('navigation');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedCabinet(null);
  };

  return (
    <div className="App">
      {currentView === 'main' && (
        <MainPage onCabinetSelect={handleCabinetSelect} />
      )}
      
      {currentView === 'map' && (
        <MapView 
          selectedCabinet={selectedCabinet}
          onStartNavigation={handleStartNavigation}
          onBack={handleBackToMain}
        />
      )}
      
      {currentView === 'navigation' && (
        <NavigationView 
          selectedCabinet={selectedCabinet}
          onBack={() => setCurrentView('map')}
        />
      )}
    </div>
  );
}

export default App;