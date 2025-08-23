import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Signup from './Signup'; 
import Login from './Login';
import Welcome from './Components/Welcome';
import Homepage from './Components/Homepage';
import LandingPage from "./Components/LandingPage";
import Pantry from './Components/Pantry';
import CaloriePage from './Components/CaloriePage';
import NutrientPage from './Components/NutrientPage'; // Import Calorie page component
import FitnessTrackerPremium from "./Components/FitnessTracker";
import { useState, useEffect } from 'react';

function App() {
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) {
      setCurrentUserId(savedUserId);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Signup setCurrentUserId={setCurrentUserId} />} />
        <Route path="/login" element={<Login setCurrentUserId={setCurrentUserId} />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/pantry" element={<Pantry currentUserId={currentUserId} />} />
        <Route path="/calorie" element={<CaloriePage currentUserId={currentUserId} />} /> 
        {/* Calorie route */}
        <Route path="/nutrient" element={<NutrientPage />} />
        <Route path="/fitness" element={<FitnessTrackerPremium />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;