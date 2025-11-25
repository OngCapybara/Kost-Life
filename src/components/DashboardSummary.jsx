// src/components/DashboardSummary.jsx (FINAL - TANPA TOMBOL)

export default function DashboardSummary({ userData, budgetPerDay, timeLeft, formatTime }) {
  
  // Hapus props: navigate dan handleLogout dari parameter di atas karena tidak digunakan.

  return (
    <>
      {/* Kartu Ringkasan Data */}
      <div className="summary-card">
        <p><strong>Saldo:</strong> Rp {userData.balance.toLocaleString('id-ID')}</p>
        <p><strong>Budget Per Hari:</strong> Rp {budgetPerDay.toFixed(0).toLocaleString('id-ID')}</p>
        <p><strong>Hitung Mundur Budget:</strong> {formatTime(timeLeft)}</p>
      </div>
    </>
  );
}