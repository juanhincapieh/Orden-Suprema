import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../context/AuthContext';
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
      {/* Rutas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/assassins" element={<Assassins />} />
      <Route path="/missions" element={<Missions />} />

      {/* Rutas protegidas por rol */}
      <Route
        path="/contractor"
        element={
          <ProtectedRoute allowedRoles={['contractor', 'admin']}>
            <Contractor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assasin"
        element={
          <ProtectedRoute allowedRoles={['assassin', 'admin']}>
            <Assasin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;