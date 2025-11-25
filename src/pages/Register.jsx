import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css"; 

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await setDoc(doc(db, "users", res.user.uid), {
        name: form.name,
        email: form.email,
        uid: res.user.uid,
        balance: 0,
      });

      alert("Registermu berhasil!. Silakan Login🥰");
      navigate("/login"); 
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container"> 
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Register Akun Baru</h2>

        <input
          type="text"
          placeholder="Nama Lengkap"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password (min. 6 karakter)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button type="submit">Daftar</button>
        {}
        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          Sudah punya akun? <Link to="/login">Login di sini</Link>
        </p>
      </form>
    </div>
  );
}