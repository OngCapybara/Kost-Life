import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth"; // <-- Import signOut
import { auth } from "../firebase"; // <-- Import auth
import "../styles/Navbar.css"; 

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert("Gagal logout: " + error.message);
    }
  };

  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li className="nav-item">
          <NavLink to="/dashboard">Dashboard</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/add">Tambah Transaksi</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/settings">Set Budget</NavLink>
        </li>
      </ul>
      
      {/* TOMBOL LOGOUT BARU DI SEBELAH KANAN */}
      <button onClick={handleLogout} className="logout-button">
        🚪 Logout
      </button>
    </nav>
  );
}