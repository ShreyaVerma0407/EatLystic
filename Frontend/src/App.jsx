import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Signup from './Signup'; // Make sure the casing matches the actual file name
import Login from './Login';
import Welcome from './components/Welcome';
import Homepage from './Components/Homepage';
import LandingPage from "./Components/LandingPage";
import Pantry from './Components/Pantry';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/pantry" element={<Pantry />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;