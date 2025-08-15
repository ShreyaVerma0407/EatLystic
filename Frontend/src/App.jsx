// App.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Signup from './Signup'; 
import Login from './Login';
import Welcome from './components/Welcome';
import Homepage from './Components/Homepage';
import LandingPage from "./Components/LandingPage";
import Pantry from './Components/Pantry';
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
