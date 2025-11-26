import React, { useRef } from 'react'; 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, doc, getDocs, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import useCountdown from "../hooks/useCountdown";
import DashboardSummary from "../components/DashboardSummary";
import TransactionList from "../components/TransactionList";
import TransactionChart from "../components/TransactionChart"; 
import PrintButton from "../components/PrintButton";
import Swal from 'sweetalert2'; // <-- Import SweetAlert2

import "../styles/Dashboard.css"; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const componentRef = useRef(); 

  // ... (semua useEffect, state, resetBudget, handleEdit tetap sama)

  // 🔹 Auth check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else navigate("/login");
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  // 🔹 Ambil data user & transaksi
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() || {};
      const balance = data.balance ?? 0;
      const budgetDuration = data.budgetDuration ?? 30;
      const budgetStart = data.budgetStart?.toDate
        ? data.budgetStart.toDate()
        : new Date(data.budgetStart || new Date());
      setUserData({ ...data, balance, budgetDuration, budgetStart });
    });
    const transQuery = query(collection(db, "transactions"), where("uid", "==", user.uid));
    const unsubTrans = onSnapshot(transQuery, (snap) => {
      const trans = snap.docs.map((docu) => ({ id: docu.id, ...docu.data() }));
      setTransactions(trans);
    });
    return () => {
      unsubUser();
      unsubTrans();
    };
  }, [user]);

  // 🔹 Reset budget function
  const resetBudget = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { balance: 0, budgetStart: new Date() });
    const q = query(collection(db, "transactions"), where("uid", "==", user.uid));
    const snap = await getDocs(q);
    const batchDelete = snap.docs.map((docu) => deleteDoc(doc(db, "transactions", docu.id)));
    await Promise.all(batchDelete);
  };

  // 🔹 Logic Hapus Transaksi (Fungsional dengan SweetAlert2)
  const handleDelete = async (transaction) => {
    // Ganti window.confirm dengan SweetAlert2 untuk konfirmasi penghapusan
    const result = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: `Yakin ingin menghapus transaksi "${transaction.note}" senilai Rp ${transaction.amount.toLocaleString('id-ID')}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
        background: '#2c2c2c',
        color: '#f0f0f0',
        customClass: {
            confirmButton: 'swal-custom-button delete-confirm-btn', // Tambahkan class delete
            popup: 'swal-custom-popup',
        }
    });

    if (!result.isConfirmed) return; // Keluar jika pengguna membatalkan

    try {
      await deleteDoc(doc(db, "transactions", transaction.id));
      
      // Reverse Saldo
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const currentBalance = userSnap.data().balance;
      let newBalance = currentBalance;
      const amountNum = transaction.amount;
      if (transaction.type === "expense") {
        newBalance += amountNum; 
      } else {
        newBalance -= amountNum; 
      }
      await updateDoc(userRef, { balance: newBalance });
      // Ganti alert sukses
      Swal.fire({
          title: "Berhasil!",
          text: "Transaksi berhasil dihapus.",
          icon: "success",
          background: '#2c2c2c',
          color: '#f0f0f0',
          confirmButtonText: "OK",
          customClass: { confirmButton: 'swal-custom-button', popup: 'swal-custom-popup' }
      });
      
    } catch (error) {
      console.error("Error deleting transaction:", error);
      // Ganti alert gagal
      Swal.fire({
          title: "Gagal Menghapus! 😔",
          text: `Terjadi error: ${error.message}`,
          icon: "error",
          background: '#2c2c2c',
          color: '#f0f0f0',
          confirmButtonText: "Tutup",
          customClass: { confirmButton: 'swal-custom-button', popup: 'swal-custom-popup' }
      });
    }
  };

  // 🔹 Logic Edit Transaksi
  const handleEdit = (transaction) => {
    navigate("/add", { state: { transactionToEdit: transaction } });
  };
  
  // 🔹 Gunakan hook countdown
  const { timeLeft, formatTime } = useCountdown(
    userData?.budgetStart,
    userData?.budgetDuration,
    resetBudget
  );

  if (loading) return <p>Loading auth...</p>;
  if (!userData) return <p>Loading data...</p>;

  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  const budgetPerDay = Math.max(daysLeft, 1) > 0 ? userData.balance / Math.max(daysLeft, 1) : 0;

  return (
    <div className="dashboard-container" ref={componentRef}> 
      <h2>Dashboard</h2>
      <p>Halo, {userData.name} 👋</p>
      
      <div className="dashboard-grid">
        {/* KOLOM KIRI: SUMMARY & CHART */}
        <div> 
          <DashboardSummary 
            userData={userData}
            budgetPerDay={budgetPerDay}
            timeLeft={timeLeft}
            formatTime={formatTime}
          />

          <div className="chart-container">
            <TransactionChart transactions={transactions} /> 
          </div>

          <PrintButton componentRef={componentRef} /> 
        </div>

        {/* KOLOM KANAN: Transaction List */}
        <div className="transaction-section">
          <TransactionList 
            transactions={transactions}
            onDelete={handleDelete} 
            onEdit={handleEdit}     
          />
        </div>
      </div>
    </div>
  );
}