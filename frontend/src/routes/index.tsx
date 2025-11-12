import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import AboutUs from '../pages/AboutUs';
import Reviews from '../pages/Reviews';
import Leaderboard from '../pages/Leaderboard';
import Login from '../pages/login';
import Register from '../pages/register';
import Contractor from '../pages/contractor';
import Assasin from '../pages/assasin';
import Assassins from '../pages/Assassins';
import Missions from '../pages/Missions';
import Admin from '../pages/admin';

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contractor" element={<Contractor />} />
        <Route path="/assasin" element={<Assasin />} />
        <Route path="/assassins" element={<Assassins />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/admin" element={<Admin />} />
    </Routes>
  );
};

export default AppRoutes;