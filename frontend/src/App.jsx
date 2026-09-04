import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import WebsiteServices from './pages/WebsiteServices';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ToolDetails from './pages/ToolDetails';
import Chat from './pages/chat';
import Chats from './pages/Chats';
import SavedTools from './pages/SavedTools';

function App() {
  return (
    <Router>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* WEBSITE SERVICES */}
        <Route path="/website-services" element={<WebsiteServices />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* REGISTER */}
        <Route path="/register" element={<Register />} />

        {/* RESET PASSWORD */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* PROFILE */}
        <Route path="/profile" element={<Profile />} />

        {/* TOOL DETAILS */}
        <Route path="/tool/:id" element={<ToolDetails />} />

        {/* CHATS SIDEBAR PAGE */}
        <Route path="/chats" element={<Chats />} />

        {/* INDIVIDUAL CHAT */}
        <Route path="/chat/:userId" element={<Chat />} />

        {/* SAVED TOOLS */}
        <Route path="/saved-tools" element={<SavedTools />} />
      </Routes>
    </Router>
  );
}

export default App;