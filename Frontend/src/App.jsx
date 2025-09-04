import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './signup'; 
import Login from './login';
import Welcome from './Components/Welcome';
import Homepage from './Components/Homepage';
import LandingPage from "./Components/LandingPage";
import Pantry from './Components/Pantry';
import CaloriePage from './Components/CaloriePage';
import NutrientPage from './Components/NutrientPage';
import FitnessTrackerPremium from "./Components/FitnessTracker";
import PantryReport from "./Components/PantryReport";
import Recipe from './Components/Recipe.jsx';
import PantryChef from './Components/PantryChef.jsx';
import Try from './Components/Try.jsx';
import MacrosChef from './Components/MacrosChef.jsx';
import Liked from './Components/Liked';  {/* Liked component imported */}
import Customise from './Components/Customise.jsx';
import Dishes from './Components/Dishes.jsx';
import FoodList from './Components/FoodList.jsx';
import { useState, useEffect } from 'react';
import ErrorBoundary from './Components/ErrorBoundary';  {/* ErrorBoundary imported */}
import NotFound from "./Components/NotFound";

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
        {/* Public Routes */}
        <Route path="/register" element={<Signup setCurrentUserId={setCurrentUserId} />} />
        <Route path="/login" element={<Login setCurrentUserId={setCurrentUserId} />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/" element={<LandingPage />} />
        
        {/* Routes that require userId */}
        <Route path="/pantry" element={<Pantry currentUserId={currentUserId} />} />
        <Route path="/calorie" element={<CaloriePage currentUserId={currentUserId} />} />
        <Route path="/nutrient" element={<NutrientPage />} />
        <Route path="/fitness" element={<FitnessTrackerPremium />} />
        <Route path="/recipe" element={<Recipe />} />
        <Route path="/recipe/pantrychef" element={<PantryChef currentUserId={currentUserId} />} />
        <Route path="/try" element={<Try />} />
        <Route path="/recipe/pantrychef/dishes/:id" element={<Dishes />} />
        <Route path="/recipe/macroschef" element={<MacrosChef />} />
        <Route path="*" element={<NotFound />} />
        {/* Liked Recipes Route wrapped in ErrorBoundary */}
        <Route 
          path="/recipe/liked" 
          element={
            <ErrorBoundary>
              <Liked userId={currentUserId} />
            </ErrorBoundary>
          } 
        />
        
        {/* Customisation Route */}
        <Route path="/recipe/customise" element={<Customise />} />
        
        {/* Pantry Report Route */}
        <Route path="/pantryreport" element={<PantryReport userId={currentUserId} />} />
        
        {/* Food List Route */}
        <Route path="/food" element={<FoodList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
