import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom"; 
import "../styles/Login.css"; 
import Swal from 'sweetalert2'; // <-- Import SweetAlert2

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      
      // --- GANTI ALERT SUKSES DENGAN SWEETALERT2 ---
      Swal.fire({
        title: "Berhasil! 🥰",
        text: "Selamat datang di Kost-Life. \n~ Atmin",
        icon: "success",
        confirmButtonText: "Lanjut ke Dashboard",
        background: '#2c2c2c', // Tema Gelap
        color: '#f0f0f0',
        customClass: {
          confirmButton: 'swal-custom-button',
          popup: 'swal-custom-popup'
        }
      }).then(() => {
        navigate("/dashboard");
      });
      
    } catch (err) {
      
      // --- GANTI ALERT GAGAL DENGAN SWEETALERT2 ---
      Swal.fire({
        title: "Login Gagal! 😹",
        text: err.message, // Tampilkan pesan error dari Firebase
        icon: "error",
        confirmButtonText: "Email atau Pw mu salah wak. Coba Lagi🤓",
        background: '#2c2c2c',
        color: '#f0f0f0',
        customClass: {
          confirmButton: 'swal-custom-button',
          popup: 'swal-custom-popup'
        }
      });
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Login</button>
        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>
      </form>
    </div>
  );
}