import React, { useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/Navbar.css"; 
import Swal from 'sweetalert2'; 

export default function Navbar() {
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    // ... (Logika handleLogout sama, tidak perlu diubah) ...
    const result = await Swal.fire({
        title: 'Yakin mau keluar?',
        text: "Anda akan diarahkan ke halaman login.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal',
        background: '#2c2c2c',
        color: '#f0f0f0',
        customClass: {
            confirmButton: 'swal-custom-button delete-confirm-btn',
            popup: 'swal-custom-popup',
        }
    });

    if (!result.isConfirmed) {
        return; 
    }
    
    try {
        await signOut(auth);
        
        Swal.fire({
            title: "Sampai Jumpa!",
            text: "Anda telah berhasil logout.",
            icon: "info",
            showConfirmButton: false,
            timer: 1500,
            background: '#2c2c2c',
            color: '#f0f0f0',
            customClass: { popup: 'swal-custom-popup' }
        });

        navigate("/login");
        
    } catch (error) {
        Swal.fire({
            title: "Gagal Logout!",
            text: `Terjadi error: ${error.message}`,
            icon: "error",
            confirmButtonText: "Tutup",
            background: '#2c2c2c',
            color: '#f0f0f0',
            customClass: { confirmButton: 'swal-custom-button', popup: 'swal-custom-popup' }
        });
    }
  };

  return (
    <nav className="navbar">
      {/* 1. Daftar Link Navigasi - Class 'open' untuk mobile menu */}
      <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <li className="nav-item">
          {/* PATH Disesuaikan: /dashboard */}
          <NavLink to="/Dashboard" onClick={toggleMenu}>Dashboard</NavLink>
        </li>
        <li className="nav-item">
          {/* PATH Disesuaikan: /add-transaction */}
          <NavLink to="/AddTransaction" onClick={toggleMenu}>Tambah Transaksi</NavLink>
        </li>
        <li className="nav-item">
          {/* PATH Disesuaikan: /budget-settings */}
          <NavLink to="/BudgetSettings" onClick={toggleMenu}>Set Budget</NavLink>
        </li>
        <li className="nav-item">
          {/* PATH Disesuaikan: /profile */}
          <NavLink to="/Profile" onClick={toggleMenu}>Profile</NavLink>
        </li>
      </ul>

      {/* 2. Tombol Burger Menu */}
      <div 
        className={`burger-menu ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      >
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      
      {/* 3. Tombol Logout */}
      <button onClick={handleLogout} className="logout-button">
        🚪 Logout
      </button>
    </nav>
  );
}