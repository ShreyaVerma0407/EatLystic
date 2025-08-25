import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';

import Signup from './Signup';
import Login from './Login';
import Welcome from './Components/Welcome';
import Homepage from './Components/Homepage';
import LandingPage from './Components/LandingPage';
import Pantry from './Components/Pantry';
import CaloriePage from './Components/CaloriePage';
<<<<<<< HEAD
import NutrientPage from './Components/NutrientPage';
import Recipe from './Components/Recipe';
import Try from './Components/Try';
import PantryChef from './Components/PantryChef';
import Dishes from './Components/Dishes';
import Macroschef from './Components/MacrosChef';
import Liked from './Components/Liked';
import Customise from './Components/Customise';
import FitnessTrackerPremium from "./Components/FitnessTracker";

// Create and export the UserContext here
export const UserContext = createContext(null);
=======
import NutrientPage from './Components/NutrientPage'; // Import Calorie page component
import FitnessTrackerPremium from "./Components/FitnessTracker";
import { useState, useEffect } from 'react';
>>>>>>> 8f11c4efa5d86bd8ebbe6a7bd4da4d0332e7a6df

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
<<<<<<< HEAD
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/pantry" element={<Pantry />} />
          <Route path="/calorie" element={<CaloriePage />} />
          <Route path="/nutrient" element={<NutrientPage />} />
          <Route path="/recipe" element={<Recipe />} />
          <Route path="/try" element={<Try />} />
          <Route path="/recipe/pantrychef" element={<PantryChef />} />
          <Route path="/recipe/pantrychef/dishes/:id" element={<Dishes />} />
          <Route path="/recipe/macroschef" element={<Macroschef />} />
          <Route path="/recipe/likes" element={<Liked />} />
          <Route path="/recipe/customise" element={<Customise />} />
          <Route path="/fitness" element={<FitnessTrackerPremium />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
=======
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
>>>>>>> 8f11c4efa5d86bd8ebbe6a7bd4da4d0332e7a6df
  );
}

export default App;