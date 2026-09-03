import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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

        {/* ========================================= */}
        {/* HOME */}
        {/* ========================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* ========================================= */}
        {/* LOGIN */}
        {/* ========================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ========================================= */}
        {/* REGISTER */}
        {/* ========================================= */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ========================================= */}
        {/* ADMIN */}
        {/* ========================================= */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        {/* ========================================= */}
        {/* PROFILE */}
        {/* ========================================= */}

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* ========================================= */}
        {/* TOOL DETAILS */}
        {/* ========================================= */}

        <Route
          path="/tool/:id"
          element={<ToolDetails />}
        />

        {/* ========================================= */}
        {/* CHATS SIDEBAR PAGE */}
        {/* ========================================= */}

        <Route
          path="/chats"
          element={<Chats />}
        />

        {/* ========================================= */}
        {/* INDIVIDUAL CHAT */}
        {/* ========================================= */}

        <Route
          path="/chat/:userId"
          element={<Chat />}
        />

        {/* ========================================= */}
        {/* SAVED TOOLS */}
        {/* ========================================= */}

        <Route
          path="/saved-tools"
          element={<SavedTools />}
        />

      </Routes>

    </Router>

  );

}

export default App;