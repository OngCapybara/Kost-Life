import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import BudgetSettings from "./pages/BudgetSettings";
import Footer from "./components/Footer";

import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Memverifikasi sesi...</div>;
    if (!currentUser) return <Navigate to="/login" replace />; 
    return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik: Selalu bisa diakses */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rute Private: Dibungkus oleh ProtectedRoute */}
        <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /><Footer /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Navbar /><BudgetSettings /><Footer /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><Navbar /><AddTransaction /><Footer /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;