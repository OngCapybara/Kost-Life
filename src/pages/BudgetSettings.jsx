import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import "../styles/BudgetSettings.css"; // <-- Import CSS

export default function BudgetSettings() {
  const [budgetForm, setBudgetForm] = useState({ budgetTotal: "", budgetDuration: "" });
  const [user, setUser] = useState(null);
  
  // Ambil data dari Firestore saat komponen dimuat
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
    
    // Validasi sederhana
    if (!budgetForm.budgetTotal || Number(budgetForm.budgetTotal) <= 0 || !budgetForm.budgetDuration || Number(budgetForm.budgetDuration) <= 0) {
        alert("Total Budget dan Durasi harus diisi dengan angka positif!");
        return;
    }

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      budgetTotal: Number(budgetForm.budgetTotal),
      budgetDuration: Number(budgetForm.budgetDuration),
      budgetStart: new Date(), // Mulai countdown dari sekarang
      balance: Number(budgetForm.budgetTotal) // Saldo awal diatur sama dengan total budget
    });

    alert("Budget berhasil disimpan dan dimulai! 🎉");
  };

  return (
    <div className="budget-container"> {/* Ganti style={{ padding: 20 }} */}
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