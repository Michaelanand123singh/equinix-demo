import React, { useState } from 'react';
import CabinetInput from './components/CabinetInput';
import Map from './components/Map';

function App() {
  const [selectedCabinet, setSelectedCabinet] = useState(null);
  const [currentView, setCurrentView] = useState('input'); // 'input' or 'map'

  const handleStartNavigation = (cabinetId) => {
    setSelectedCabinet(cabinetId);
    setCurrentView('map');
  };

  const handleBackToInput = () => {
    setSelectedCabinet(null);
    setCurrentView('input');
  };

  return (
    <div className="App">
      {currentView === 'input' ? (
        <CabinetInput onStartNavigation={handleStartNavigation} />
      ) : (
        <Map 
          selectedCabinet={selectedCabinet} 
          onBackToInput={handleBackToInput}
        />
      )}
    </div>
  );
}

export default App;