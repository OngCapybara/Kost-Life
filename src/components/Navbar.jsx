import React, { useState } from 'react'; // <-- Import useState
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/Navbar.css"; 
import Swal from 'sweetalert2'; 

export default function Navbar() {
  const navigate = useNavigate();
  // State untuk mengontrol status menu burger
  const [isMenuOpen, setIsMenuOpen] = useState(false); // <-- State baru

  // Fungsi untuk mengubah status menu
  const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    // 1. Konfirmasi Logout dengan SweetAlert2
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
    
    // 2. Lakukan Proses Logout
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
      {/* 1. Daftar Link Navigasi - Tambahkan class 'open' jika menu terbuka */}
      <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <li className="nav-item">
          {/* Tambahkan onClick={toggleMenu} agar menu tertutup setelah link diklik di mobile */}
          <NavLink to="/dashboard" onClick={toggleMenu}>Dashboard</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/add" onClick={toggleMenu}>Tambah Transaksi</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/settings" onClick={toggleMenu}>Set Budget</NavLink>
        </li>
      </ul>

      {/* 2. Tombol Burger Menu */}
      <div 
        className={`burger-menu ${isMenuOpen ? 'active' : ''}`} // <-- Tambahkan class 'active'
        onClick={toggleMenu} // <-- Fungsi untuk buka/tutup menu
      >
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      
      {/* 3. Tombol Logout di Sebelah Kanan */}
      <button onClick={handleLogout} className="logout-button">
        🚪 Logout
      </button>
    </nav>
  );
}