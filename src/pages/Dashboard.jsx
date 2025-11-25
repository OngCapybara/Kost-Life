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

import "../styles/Dashboard.css"; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const componentRef = useRef(); 

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else navigate("/login");
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

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

  const resetBudget = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { balance: 0, budgetStart: new Date() });
    const q = query(collection(db, "transactions"), where("uid", "==", user.uid));
    const snap = await getDocs(q);
    const batchDelete = snap.docs.map((docu) => deleteDoc(doc(db, "transactions", docu.id)));
    await Promise.all(batchDelete);
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm(`Yakin ingin menghapus transaksi "${transaction.note}" senilai Rp ${transaction.amount.toLocaleString('id-ID')}?`)) return;
    try {
      await deleteDoc(doc(db, "transactions", transaction.id));
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
      alert("Transaksi berhasil dihapus!🤓");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Gagal menghapus transaksi😔🥀: " + error.message);
    }
  };

  const handleEdit = (transaction) => {
    navigate("/add", { state: { transactionToEdit: transaction } });
  };
  
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
          {}
          <DashboardSummary 
            userData={userData}
            budgetPerDay={budgetPerDay}
            timeLeft={timeLeft}
            formatTime={formatTime}
          />

          {}
          <div className="chart-container">
            <TransactionChart transactions={transactions} /> 
          </div>

          {}
          <PrintButton componentRef={componentRef} /> 
        </div>

        {}
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