import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import "../styles/BudgetSettings.css"; 
import Swal from 'sweetalert2'; // <-- Import SweetAlert2

export default function BudgetSettings() {
  const [budgetForm, setBudgetForm] = useState({ budgetTotal: "", budgetDuration: "" });
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setUser(currentUser);

    const fetchData = async () => {
      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setBudgetForm({
          // Menggunakan "" agar placeholder muncul jika 0
          budgetTotal: data.budgetTotal || "", 
          budgetDuration: data.budgetDuration || ""
        });
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!budgetForm.budgetTotal || Number(budgetForm.budgetTotal) <= 0 || !budgetForm.budgetDuration || Number(budgetForm.budgetDuration) <= 0) {
      // --- GANTI ALERT GAGAL VALIDASI DENGAN SWEETALERT2 ---
      Swal.fire({
          title: "Aduh, Gagal! 😹",
          text: "Total Budget dan Durasi harus diisi dengan angka positif!",
          icon: "warning",
          confirmButtonText: "Perbaiki",
          background: '#2c2c2c',
          color: '#f0f0f0',
          customClass: { confirmButton: 'swal-custom-button', popup: 'swal-custom-popup' }
      });
      return;
    }

    const userRef = doc(db, "users", user.uid);
    try {
        await updateDoc(userRef, {
            budgetTotal: Number(budgetForm.budgetTotal),
            budgetDuration: Number(budgetForm.budgetDuration),
            budgetStart: new Date(),
            balance: Number(budgetForm.budgetTotal) 
        });

        // --- GANTI ALERT SUKSES DENGAN SWEETALERT2 ---
        Swal.fire({
            title: "Tersimpan! 🤓",
            text: "Budgetmu udah disimpan dan countdown dimulai! 💸",
            icon: "success",
            confirmButtonText: "OK",
            background: '#2c2c2c',
            color: '#f0f0f0',
            customClass: { confirmButton: 'swal-custom-button', popup: 'swal-custom-popup' }
        });
        
    } catch (error) {
        Swal.fire({
            title: "Gagal Menyimpan!",
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
    <div className="budget-container"> 
      <form onSubmit={handleSubmit} className="budget-form">
        <h2>Set Budget & Durasi</h2>
        
        <input
          type="number"
          placeholder="Total Budget (Rp)"
          value={budgetForm.budgetTotal}
          onChange={(e) => setBudgetForm({ ...budgetForm, budgetTotal: e.target.value })}
          required
        />
        
        <input
          type="number"
          placeholder="Durasi Budget (Hari)"
          value={budgetForm.budgetDuration}
          onChange={(e) => setBudgetForm({ ...budgetForm, budgetDuration: e.target.value })}
          required
        />
        
        <button type="submit">Simpan & Mulai Budget</button>
      </form>
    </div>
  );
}