import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";


import Signup from "./signup";
import Login from "./login";
import Welcome from "./Components/Welcome";
import Homepage from "./Components/Homepage";
import LandingPage from "./Components/LandingPage";
import Pantry from "./Components/Pantry";
import CaloriePage from "./Components/CaloriePage";
import NutrientPage from "./Components/NutrientPage";
import FitnessTrackerPremium from "./Components/FitnessTracker";
import PantryReport from "./Components/PantryReport";
import Recipe from "./Components/Recipe.jsx";
import PantryChef from "./Components/PantryChef.jsx";
import Try from "./Components/Try.jsx";
import Liked from "./Components/Liked";
import Customise from "./Components/Customise.jsx";
import Dishes from "./Components/Dishes.jsx";
import FoodList from "./Components/FoodList.jsx";
import { useState, useEffect, Suspense } from "react";
import ErrorBoundary from "./Components/ErrorBoundary";
import NotFound from "./Components/NotFound";
import ShoppingCart from "./Components/shopping.jsx";
import MealChef from "./Components/MealChef.jsx";
import Dishes_meal from "./Components/Dishes_meal.jsx";
import HelpDesk from "./Components/HelpDesk.jsx";
import ContactUs from "./Components/ContactUs.jsx";
import Trending from "./Components/trending.jsx";
import MacrosLanding from "./Components/MacrosLanding.jsx";
import MacrosDash from "./Components/MacrosDash.jsx";
import MacrosQuiz from "./Components/MacrosQuiz.jsx";
import Profile from "./Components/Profile";
import Nutrient from "./Components/Nutrient";
import Logout from "./Logout";
import Feedback from "./Components/Feedback.jsx";
import Faq from "./Components/Faq.jsx";
import Macrosintake from "./Components/Macrosintake.jsx";
import MacrosRecipe from "./Components/MacrosRecipe.jsx";
import Loader from "./Components/Loader";
import Chatbot from "./Components/Chatbot";
import Home from "./Components/Home";
// Layout component for MacrosChef nested routes
function MacrosChefLayout() {
  return (
    <div>
      {/* Optionally shared header or nav can go here */}
      <Outlet />
    </div>
  );
}

// Custom loader handler using navigation state (for React Router v6.4+)
function AppWithLoader() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) setCurrentUserId(savedUserId);
    // Simulate load time (replace logic for prod as needed)
    setTimeout(() => setLoading(false), 800);
  }, []);

  // Loader on first app load
  if (loading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      {/* You can also wrap Routes with <Suspense fallback={<Loader />}> for lazy loading */}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/register"
          element={<Signup setCurrentUserId={setCurrentUserId} />}
        />
        <Route
          path="/login"
          element={<Login setCurrentUserId={setCurrentUserId} />}
        />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/" element={<LandingPage />} />
        
<Route path ="/ahome" element={<Home/>}/>
        {/* Routes requiring userId */}
        <Route
          path="/pantry"
          element={<Pantry currentUserId={currentUserId} />}
        />
        <Route
          path="/calorie"
          element={<CaloriePage currentUserId={currentUserId} />}
        />
        <Route path="/nutrient" element={<NutrientPage />} />
        <Route path="/fitness" element={<FitnessTrackerPremium />} />
        <Route path="/recipe" element={<Recipe />} />
        <Route path="/recipe/chatbot" element={<Chatbot/>}/>
        <Route
          path="/recipe/pantrychef"
          element={<PantryChef currentUserId={currentUserId} />}
        />
        <Route path="/try" element={<Try />} />
        <Route path="/recipe/pantrychef/dishes/:id" element={<Dishes />} />

        {/* MacrosChef routes nested */}
        <Route path="/recipe/macroschef" element={<MacrosLanding />} />
        <Route path="/recipe/macroschef/dash" element={<MacrosDash />} />
        <Route path="/recipe/macroschef/quiz" element={<MacrosQuiz />} />
        <Route path="/recipe/macroschef/profile" element={<Profile />} />
        <Route path="/recipe/macroschef/nutrient" element={<Nutrient />} />
        <Route path="/recipe/macroschef/intake" element={<Macrosintake />} />
           <Route path="/recipe/macroschef/recipe" element={<MacrosRecipe />} />
           
        <Route path="/helpdesk" element={<HelpDesk />} />
        <Route path="/helpdesk/contactus" element={<ContactUs />} />
        <Route path="/helpdesk/feedback" element={<Feedback />} />
        <Route path="/helpdesk/faq" element={<Faq />} />

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

        {/* Customisation Route with userId prop */}
        <Route
          path="/recipe/customise"
          element={<Customise userId={currentUserId} />}
        />

        {/* Pantry Report Route */}
        <Route
          path="/pantryreport"
          element={<PantryReport userId={currentUserId} />}
        />

        {/* Food List Route */}
        <Route path="/food" element={<FoodList />} />
        <Route path="/shoppingcart" element={<ShoppingCart />} />
        <Route
          path="/recipe/mealchef"
          element={<MealChef currentUserId={currentUserId} />}
        />
        <Route path="/recipe/mealchef/dishes/:id" element={<Dishes_meal />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/recipe/trending" element={<Trending />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppWithLoader;