// src/App.jsx
import { useState } from 'react';
import LandingPage from './Components/LandingPage';
import SignLanguageApp from './Components/SignLanguageApp';

function App() {
  const [showLandingPage, setShowLandingPage] = useState(true);

  const handleStartLearning = () => {
    setShowLandingPage(false);
  };

  const handleBackToLanding = () => {
    setShowLandingPage(true);
  };

  return (
    <>
      {showLandingPage ? (
        <LandingPage onStartLearning={handleStartLearning} />
      ) : (
        <SignLanguageApp onBackToLanding={handleBackToLanding} />
      )}
    </>
  );
}

export default App;