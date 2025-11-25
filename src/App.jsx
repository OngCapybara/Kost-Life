import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import BudgetSettings from "./pages/BudgetSettings";

import { useAuth } from './context/AuthContext'; // <-- Import Auth Context

// ======================================
// Komponen Pelindung Rute (PROTECTED ROUTE)
// ======================================
const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Memverifikasi sesi...</div>;
    
    // Jika loading selesai dan tidak ada user, redirect ke /login
    if (!currentUser) return <Navigate to="/login" replace />; 
    
    return children;
};
// ======================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik: Selalu bisa diakses */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rute Private: Dibungkus oleh ProtectedRoute */}
        <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Navbar /><BudgetSettings /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><Navbar /><AddTransaction /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;