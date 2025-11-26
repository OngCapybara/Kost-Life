import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/Navbar.css"; 
import Swal from 'sweetalert2'; // <-- Import SweetAlert2

export default function Navbar() {
  const navigate = useNavigate();

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
            confirmButton: 'swal-custom-button delete-confirm-btn', // Menggunakan warna merah
            popup: 'swal-custom-popup',
        }
    });

    if (!result.isConfirmed) {
        return; // Batalkan aksi jika pengguna menekan 'Batal'
    }
    
    // 2. Lakukan Proses Logout
    try {
      await signOut(auth);
      
      // Notifikasi sukses (Opsional, karena langsung redirect)
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

      // Arahkan ke halaman login
      navigate("/login");
      
    } catch (error) {
      // Notifikasi gagal
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