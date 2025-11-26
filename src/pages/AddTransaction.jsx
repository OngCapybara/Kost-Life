import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
// Gunakan useLocation untuk membaca data edit
import { useNavigate, useLocation } from "react-router-dom"; 
import "../styles/AddTransaction.css"; 
import Swal from 'sweetalert2'; // <-- Import SweetAlert2

export default function AddTransaction() {
  const navigate = useNavigate();
  const location = useLocation(); 

  const transactionToEdit = location.state?.transactionToEdit;
  const isEditing = !!transactionToEdit; 
  
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    note: ""
  });
  
  useEffect(() => {
    if (isEditing) {
      setForm({
        type: transactionToEdit.type,
        amount: String(transactionToEdit.amount), 
        note: transactionToEdit.note
      });
    } else {
      setForm({ type: "expense", amount: "", note: "" });
    }
  }, [isEditing, transactionToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      // --- ALERT GAGAL OTENTIKASI ---
      Swal.fire({
          title: "Akses Ditolak! 😡",
          text: "Anda harus login untuk mencatat transaksi.",
          icon: "error",
          confirmButtonText: "Tutup",
          background: '#2c2c2c', color: '#f0f0f0',
          customClass: { confirmButton: 'swal-custom-button', popup: 'swal-custom-popup' }
      });
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      // --- ALERT GAGAL VALIDASI ---
      Swal.fire({
          title: "Gagal Validasi! 😡",
          text: "Jumlah harus diisi dengan angka positif!",
          icon: "warning",
          confirmButtonText: "Perbaiki",
          background: '#2c2c2c', color: '#f0f0f0',
          customClass: { confirmButton: 'swal-custom-button', popup: 'swal-custom-popup' }
      });
      return;
    }

    const amountNum = Number(form.amount);
    const userRef = doc(db, "users", user.uid);
    let successMessage = "";

    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("User tidak ditemukan");
      let newBalance = userSnap.data().balance;
      
      if (isEditing) {
        // --- MODE EDIT ---
        const transRef = doc(db, "transactions", transactionToEdit.id);
        const oldAmount = transactionToEdit.amount;
        const oldType = transactionToEdit.type;

        // 1. Reverse old balance
        if (oldType === "expense") {
            newBalance += oldAmount;
        } else {
            newBalance -= oldAmount;
        }

        // 2. Update transaction
        await updateDoc(transRef, {
          type: form.type,
          amount: amountNum,
          note: form.note,
          updatedAt: new Date()
        });
        successMessage = "Transaksi berhasil diperbarui! 🥶";
      } else {
        // --- MODE TAMBAH BARU ---
        
        // 1. Add new transaction
        await addDoc(collection(db, "transactions"), {
          uid: user.uid, 
          type: form.type,
          amount: amountNum,
          note: form.note,
          createdAt: new Date() 
        });
        successMessage = "Transaksi berhasil dicatat! 🤓☝️";
      }

      // 3. Apply new balance effect
      if (form.type === "expense") {
          newBalance -= amountNum;
      } else {
          newBalance += amountNum;
      }
      
      await updateDoc(userRef, { balance: newBalance });

      // --- ALERT SUKSES DENGAN SWEETALERT2 ---
      Swal.fire({
          title: "Berhasil!",
          text: successMessage,
          icon: "success",
          confirmButtonText: "OK",
          background: '#2c2c2c', color: '#f0f0f0',
          customClass: { confirmButton: 'swal-custom-button', popup: 'swal-custom-popup' }
      }).then(() => {
          navigate("/dashboard"); // Navigasi setelah alert ditutup
      });
      
    } catch (err) {
      console.error(err);
      // --- ALERT GAGAL DENGAN SWEETALERT2 ---
      Swal.fire({
          title: "Gagal Memproses!",
          text: "Terjadi kesalahan: " + err.message,
          icon: "error",
          confirmButtonText: "Tutup",
          background: '#2c2c2c', color: '#f0f0f0',
          customClass: { confirmButton: 'swal-custom-button', popup: 'swal-custom-popup' }
      });
    }
  };

  return (
    <div className="transaction-container">
      <form onSubmit={handleSubmit} className="transaction-form">
        <h2>{isEditing ? "Edit Transaksi" : "Tambah Transaksi Baru"}</h2>
        
        <select 
          value={form.type} 
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="income">Income (Pemasukan)</option>
          <option value="expense">Expense (Pengeluaran)</option>
        </select>

        <input
          type="number"
          placeholder="Jumlah (Rp)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Catatan"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        <button type="submit">{isEditing ? "Simpan Perubahan" : "Simpan Transaksi"}</button>
      </form>
    </div>
  );
}