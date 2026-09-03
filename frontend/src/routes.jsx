import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ToolDetails from './pages/ToolDetails';
import AdminDashboard from './pages/AdminDashboard';

export default function RoutesConfig() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tool/:id" element={<ToolDetails />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}