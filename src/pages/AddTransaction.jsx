import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
// Gunakan useLocation untuk membaca data edit
import { useNavigate, useLocation } from "react-router-dom"; 
import "../styles/AddTransaction.css"; 

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
        alert("Anda harus login untuk mencatat transaksi😡");
        return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
        alert("Jumlah harus diisi dan lebih dari nol!😡");
        return;
    }

    const amountNum = Number(form.amount);
    const userRef = doc(db, "users", user.uid);

    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("User tidak ditemukan");
      let newBalance = userSnap.data().balance;
      
      if (isEditing) {
        const transRef = doc(db, "transactions", transactionToEdit.id);
        const oldAmount = transactionToEdit.amount;
        const oldType = transactionToEdit.type;

        if (oldType === "expense") {
            newBalance += oldAmount;
        } else {
            newBalance -= oldAmount;
        }

        await updateDoc(transRef, {
          type: form.type,
          amount: amountNum,
          note: form.note,
          updatedAt: new Date()
        });
        alert("Transaksi berhasil diperbarui!🥶");
      } else {
        await addDoc(collection(db, "transactions"), {
          uid: user.uid, 
          type: form.type,
          amount: amountNum,
          note: form.note,
          createdAt: new Date() 
        });
        alert("Transaksi berhasil dicatat!🤓☝️");
      }

      if (form.type === "expense") {
          newBalance -= amountNum;
      } else {
          newBalance += amountNum;
      }
      
      await updateDoc(userRef, { balance: newBalance });

      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Gagal memproses transaksi: " + err.message);
    }
  };

  return (
    <div className="transaction-container">
      <form onSubmit={handleSubmit} className="transaction-form">
        <h2>{isEditing ? "Edit Transaksi" : "Tambah Transaksi Baru"}</h2>
        
        {}
        <select 
          value={form.type} 
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="income">Income (Pemasukan)</option>
          <option value="expense">Expense (Pengeluaran)</option>
        </select>

        {}
        <input
          type="number"
          placeholder="Jumlah (Rp)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />

        {}
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