import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Signup from './signup'; 
import Login from './Login';
import Welcome from './Components/Welcome';
import Homepage from './Components/Homepage';
import LandingPage from "./Components/LandingPage";
import Pantry from './Components/Pantry';
import CaloriePage from './Components/CaloriePage';
import NutrientPage from './Components/NutrientPage'; // Import Calorie page component
import FitnessTrackerPremium from "./Components/FitnessTracker";
import PantryReport from "./Components/PantryReport";
import Recipe from './Components/Recipe.jsx';
import PantryChef from './Components/PantryChef.jsx';
import Try from './Components/Try.jsx';
import MacrosChef from './Components/MacrosChef.jsx';
// import Liked from './Components/Liked.jsx';
import Customise from './Components/Customise.jsx';
import Dishes from './Components/Dishes.jsx';
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
        <Route path="/recipe" element={<Recipe/>}/>
        <Route path="/recipe/pantrychef" element={<PantryChef/>}/>
        <Route path="/try" element={<Try/>}/>
        <Route path ="recipe/pantrychef/dishes" element={<Dishes/>}/>
        <Route path="/recipe/macroschef" element ={<MacrosChef/>}/>
         {/* <Route path="/recipe/like" element ={<Liked/>}/> */}
        <Route path="/recipe/customise" element ={<Customise/>}/>
        <Route path="/pantryreport" element={<PantryReport userId={currentUserId} />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;